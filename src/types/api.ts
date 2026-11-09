/**
 * UI-facing API contracts. Request DTOs and query shapes come from the
 * generated OpenAPI views below; response models stay local where Swagger
 * currently emits `Record<string, never>` instead of response DTOs.
 */

import type {
	AgentCreateMultipartDto,
	AgentUpdateDto,
} from "../api/domains/agent";
import type { UpdateObservationBeneficiaryDto } from "../api/domains/beneficiaire";
import type {
	AgentFamilyCreateMultipartDto,
	UpdatePartialFamilleAgentDto,
} from "../api/domains/famille-agent";
import type {
	CreateLieuDto,
	UpdateLieuDto,
} from "../api/domains/lieu";
import type {
	CreateProviderDto,
	UpdateProviderDto,
} from "../api/domains/prestataire";
import type {
	CreateAgentCategoryDto,
	UpdateAgentCategoryDto,
} from "../api/domains/categorie-agent";
import type {
	CreateProviderCategoryDto,
	UpdateProviderCategoryDto,
} from "../api/domains/categorie-prestataire";
import type {
	CreateAgenceDto,
	CreateDirectionDto,
	CreateServiceDto,
	UpdateAgenceDto,
	UpdateDirectionDto,
	UpdateServiceCodeDirectionDto,
	UpdateServiceNomDto,
} from "../api/domains/structure-organisationnelle";
import type { PrestatairePaths } from "../api/domains/prestataire";

// --- Enums ------------------------------------------------------------------

export const SEXES = ["MASCULIN", "FEMININ"] as const;
export type Sexe = AgentCreateMultipartDto["sexe"];

export const STATUTS_PEC = [
	"AGENT",
	"CHEF_SERVICE",
	"CHEF_AGENCE",
	"DIRECTEUR",
] as const;
export type StatutPEC = AgentCreateMultipartDto["statutPEC"];

export const AFFECTATIONS = ["RETRAITE", "AGENCE", "DIRECTION"] as const;
export type BackOfficeFrontOffice = AgentCreateMultipartDto["backOfficeFrontOffice"];

export const PROVIDER_STATUSES = ["PRIVE", "PUBLIC"] as const;
export type ProviderStatus = CreateProviderDto["statut"];

export const CODES_FAMILLE = ["AGENT", "CONJOINT", "ENFANT"] as const;
export type CodeFamille = (typeof CODES_FAMILLE)[number];

// --- Agents -----------------------------------------------------------------

/**
 * Item returned by `/agents`, `/agents/search` and the two search routes.
 *
 * `structureID` is the organizational structure code: an agency code for
 * `AGENCE` agents and a direction code for `DIRECTION` agents.
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
	structureID: string | null;
	codeService: string | null;
	carteProfessionnellePath: string | null;
	createdAt: string;
	updatedAt: string;
}

/** Body of `POST /agents` (multipart, `image` is required). */
export type CreateAgentInput = Omit<
	AgentCreateMultipartDto,
	"image" | "matricule"
> & {
	matricule: string;
	codeDirection?: string | null;
	codeAgence?: string | null;
};

/**
 * Body of `PATCH /agents/:matricule`.
 * `matricule` and `image` are not updatable. `null`/missing values are ignored
 * by the backend, so a field can never be cleared through this route.
 */
export type UpdateAgentInput = AgentUpdateDto & {
	codeDirection?: string | null;
	codeAgence?: string | null;
};

/**
 * Runtime's nested `filter` query shape for `GET /agents/search`.
 * Kept local because the current Swagger schema describes the query flatly.
 */
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

/** Body of `POST /agent-families/spouses|children` (multipart, `image` required). */
export type CreateFamilyMemberInput = Omit<
	AgentFamilyCreateMultipartDto,
	"image" | "agentMatricule"
> & { agentMatricule: string };

/** Body of `PATCH /agent-families/<kind>/:id`. */
export type UpdateFamilyMemberInput = UpdatePartialFamilleAgentDto;

export type UpdateBeneficiaryObservationInput =
	UpdateObservationBeneficiaryDto["observationIDP"];

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
	echeanceRenouvellement: string | null;
	echeanceResiliation: string | null;
	observation: string | null;
	lieuID: number;
	categorieID: number;
}

/** Body of `POST /providers`; every field is optional on `PATCH`. */
export type CreateProviderInput = CreateProviderDto;
export type UpdateProviderInput = UpdateProviderDto;

/** Query of `GET /providers/search`. */
export type ProviderFilter = NonNullable<
	NonNullable<PrestatairePaths["/providers/search"]["get"]>["parameters"]["query"]
>;

export type CreateLieuInput = CreateLieuDto;
export type UpdateLieuInput = UpdateLieuDto;
export type CreateAgentCategoryInput = CreateAgentCategoryDto;
export type UpdateAgentCategoryInput = UpdateAgentCategoryDto;
export type CreateProviderCategoryInput = CreateProviderCategoryDto;
export type UpdateProviderCategoryInput = UpdateProviderCategoryDto;
export type CreateAgenceInput = CreateAgenceDto;
export type UpdateAgenceInput = UpdateAgenceDto;
export type CreateDirectionInput = CreateDirectionDto;
export type UpdateDirectionInput = UpdateDirectionDto;
export type CreateServiceInput = CreateServiceDto;
export type UpdateServiceNameInput = UpdateServiceNomDto;
export type UpdateServiceDirectionInput = UpdateServiceCodeDirectionDto;
