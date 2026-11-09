import { apiRoutes, apiService, imageFormData } from "../../../services/api";
import type { UpdatePartialFamilleAgentDto } from "../../../api/domains/famille-agent";
import type {
	Beneficiary,
	CreateFamilyMemberInput,
	FamilyKind,
	FamilyMember,
	UpdateFamilyMemberInput,
} from "../../../types/api";
import { resolveFamilyCardUrl } from "../../../services/api";

const familyCardMembersByMatricule = new Map<string, Promise<FamilyMember[]>>();

/**
 * `GET /agent-families/agents/:matricule` — spouses and children of an agent.
 * `:id` used by the update routes is the **person id**, not the matricule, so
 * this listing is also the way to resolve that id from an IDP.
 */
export function listFamilyMembers(matricule: string): Promise<FamilyMember[]> {
	return apiService.get<FamilyMember[]>(apiRoutes.family(matricule));
}

function createRoute(kind: FamilyKind): string {
	return kind === "conjoint"
		? apiRoutes.conjointCreate
		: apiRoutes.enfantCreate;
}

function informationsRoute(kind: FamilyKind, id: number): string {
	return kind === "conjoint"
		? apiRoutes.conjointInformations(id)
		: apiRoutes.enfantInformations(id);
}

function cardRoute(kind: FamilyKind, id: number): string {
	return kind === "conjoint" ? apiRoutes.conjointCard(id) : apiRoutes.enfantCard(id);
}

/**
 * `POST /agent-families/spouses|children` — creates the person and its beneficiary
 * row. The social card (`image`) is mandatory.
 *
 * Known backend defect: `SaveEnfantUseCase` passes `numConjoint: numEnfant`,
 * while the IDP builder requires `numEnfant` for a child, so creating a child
 * currently fails server-side. The failure is surfaced as a normal `ApiError`.
 */
export async function createFamilyMember(
	kind: FamilyKind,
	input: CreateFamilyMemberInput,
	image: File,
): Promise<void> {
	await apiService.post<void>(
		createRoute(kind),
		imageFormData(input, image),
	);
	familyCardMembersByMatricule.delete(input.agentMatricule);
}

/** `PATCH /agent-families/spouses|children/:id` — `204`. */
export async function updateFamilyMemberInformation(
	kind: FamilyKind,
	id: number,
	input: UpdateFamilyMemberInput,
): Promise<void> {
	const body: UpdatePartialFamilleAgentDto = input;
	await apiService.patch<void>(informationsRoute(kind, id), body);
	familyCardMembersByMatricule.clear();
}

/** `PATCH /agent-families/spouses|children/:id/card` — `204`. */
export function updateFamilyMemberCard(
	kind: FamilyKind,
	id: number,
	image: File,
): Promise<void> {
	return apiService.patch<void>(cardRoute(kind, id), imageFormData({}, image));
}

/**
 * Resolves the person id of a family member from the agent's family listing.
 * Matching is done on the full civil identity, which is what the IDP encodes.
 */
export function resolveFamilyMember(
	members: FamilyMember[],
	member: {
		nom: string;
		prenom: string;
		dateNaissance: string;
		sexe: string;
		codeFamille: string;
	},
): FamilyMember | undefined {
	const isChild = member.codeFamille === "ENFANT";
	return members.find(
		(candidate) =>
			(isChild ? candidate.numEnfant !== null : candidate.numConjoint !== null) &&
			candidate.nom === member.nom &&
			candidate.prenom === member.prenom &&
			candidate.sexe === member.sexe &&
			sameDay(candidate.dateNaissance, member.dateNaissance),
	);
}

/** Resolves the family-member ID required by `GET /agent-families/family-members/:id/card`. */
export async function resolveFamilyMemberCardUrl(
	beneficiary: Pick<
		Beneficiary,
		"matricule" | "nom" | "prenom" | "dateNaissance" | "sexe" | "codeFamille"
	>,
): Promise<string | null> {
	let membersRequest = familyCardMembersByMatricule.get(beneficiary.matricule);
	if (!membersRequest) {
		membersRequest = listFamilyMembers(beneficiary.matricule);
		familyCardMembersByMatricule.set(beneficiary.matricule, membersRequest);
	}
	let members: FamilyMember[];
	try {
		members = await membersRequest;
	} catch (error) {
		familyCardMembersByMatricule.delete(beneficiary.matricule);
		throw error;
	}
	const member = resolveFamilyMember(members, beneficiary);
	return member ? resolveFamilyCardUrl(member.id) : null;
}

/** Compares two ISO strings on the calendar day only (time part is noise). */
function sameDay(left: string, right: string): boolean {
	return left.slice(0, 10) === right.slice(0, 10);
}
