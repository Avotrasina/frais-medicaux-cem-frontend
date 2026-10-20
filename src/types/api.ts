/**
 * Data contracts of the FM-CEM backend (see `API.md`).
 * Enums are declared as union types plus a `const` tuple so forms can iterate
 * over them without duplicating the literals.
 */

// --- Enums ------------------------------------------------------------------

export const SEXES = ["MASCULIN", "FEMININ"] as const;
export type Sexe = (typeof SEXES)[number];

export const STATUTS_PEC = [
	"AGENT",
	"CHEF_SERVICE",
	"CHEF_AGENCE",
	"DIRECTEUR",
] as const;
export type StatutPEC = (typeof STATUTS_PEC)[number];

export const AFFECTATIONS = ["RETRAITE", "AGENCE", "DIRECTION"] as const;
export type BackOfficeFrontOffice = (typeof AFFECTATIONS)[number];

export const PROVIDER_STATUSES = ["PRIVE", "PUBLIC"] as const;
export type ProviderStatus = (typeof PROVIDER_STATUSES)[number];

export const CODES_FAMILLE = ["AGENT", "CONJOINT", "ENFANT"] as const;
export type CodeFamille = (typeof CODES_FAMILLE)[number];

// --- Agents -----------------------------------------------------------------

/**
 * Item returned by `/agent/all`, `/agent/all/filtered` and the two search routes.
 *
 * The structure codes (`codeAgence`, `codeDirection`) are **not** part of the
 * response: `AgentRepository.toReadAgent` drops them, so an active agent always
 * resolves to `AGENCE`.
 */
export interface AgentItem {
	matricule: string;
	nom: string;
	prenom: string;
	dateNaissance: string;
	sexe: Sexe;
	statutPEC: StatutPEC;
	backOfficeFrontOffice: BackOfficeFrontOffice;
	dateEntree: string;
	observationMatricule: string | null;
	fonction: string | null;
	categorieID: string | null;
	codeService: string | null;
	carteProfessionnellePath: string | null;
	createdAt: string;
	updatedAt: string;
}

/** Body of `POST /agent/create/` (multipart, `image` is required). */
export interface CreateAgentInput {
	matricule: string;
	nom: string;
	prenom: string;
	statutPEC: StatutPEC;
	dateNaissance: string;
	sexe: Sexe;
	backOfficeFrontOffice: BackOfficeFrontOffice;
	dateEntree: string;
	observationMatricule?: string | null;
	fonction?: string | null;
	categorieID?: string | null;
	codeDirection?: string | null;
	codeAgence?: string | null;
	codeService?: string | null;
}

/**
 * Body of `PATCH /agent/information/:matricule`.
 * `matricule` and `image` are not updatable. `null`/missing values are ignored
 * by the backend, so a field can never be cleared through this route.
 */
export type UpdateAgentInput = Partial<Omit<CreateAgentInput, "matricule">>;

/** Nested `filter` object accepted by `GET /agent/all/filtered`. */
export interface AgentStructureFilter {
	backOfficeFrontOffice?: BackOfficeFrontOffice;
	codeAgence?: string;
	codeDirection?: string;
	codeService?: string;
}

// --- Agent family -----------------------------------------------------------

export interface FamilyMember {
	id: number;
	nom: string;
	prenom: string;
	dateNaissance: string;
	sexe: Sexe;
	numConjoint: number | null;
	numEnfant: number | null;
	/** Spelled without the second `e`, unlike `carteSocialePath` elsewhere. */
	carteSocialPath: string | null;
	agentMatricule: string;
}

/** Body of `POST /agent-family/conjoint|enfant` (multipart, `image` required). */
export interface CreateFamilyMemberInput {
	agentMatricule: string;
	nom: string;
	prenom: string;
	dateNaissance: string;
	sexe: Sexe;
}

/** Body of `PATCH /agent-family/<kind>/informations/:id`. */
export interface UpdateFamilyMemberInput {
	nom?: string;
	prenom?: string;
	dateNaissance?: string;
	sexe?: Sexe;
}

export type FamilyKind = "conjoint" | "enfant";

// --- Beneficiaries ----------------------------------------------------------

export interface Beneficiary {
	nom: string;
	prenom: string;
	dateNaissance: string;
	sexe: Sexe;
	idp: string;
	observationIDP: string | null;
	/** Always the agent's matricule, including for a spouse or a child. */
	matricule: string;
	codeFamille: CodeFamille;
	/** Set for a spouse/child only. */
	carteSocialePath: string | null;
	/** Set for the agent only. */
	carteProfessionnellePath: string | null;
}

// --- Organisational structure ----------------------------------------------

export interface Agence {
	codeAgence: string;
	nomAgence: string;
}

export interface Service {
	codeService: string;
	nom: string;
	codeDirection: string;
}

export interface Direction {
	codeDirection: string;
	/** Responses use `nom`, while create/update bodies send `nomDirection`. */
	nom: string;
	services: Service[];
}

// --- Referentials -----------------------------------------------------------

export interface Lieu {
	id: number;
	nom: string;
}

export interface ProviderCategory {
	id: number;
	nom: string;
}

export interface AgentCategory {
	id: number;
	codeCategory: string;
}

// --- Providers --------------------------------------------------------------

export interface Provider {
	id: number;
	nom: string;
	adresse: string;
	statut: ProviderStatus;
	nif: string;
	stat: string;
	dateDebutConvention: string;
	dateFinConvention: string;
	listePrestation: string;
	lieuID: number;
	categorieID: number;
}

/** Body of `POST /providers`; every field is optional on `PATCH`. */
export interface CreateProviderInput {
	nom: string;
	adresse: string;
	statut: ProviderStatus;
	nif: string;
	stat: string;
	dateDebutConvention: string;
	dateFinConvention: string;
	listePrestation: string;
	lieuID: number;
	categorieID: number;
}

export type UpdateProviderInput = Partial<CreateProviderInput>;

/** Query of `GET /providers/filter`. */
export interface ProviderFilter {
	lieuID?: number;
	categorieID?: number;
}
