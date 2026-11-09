import type {
	AgentItem,
	Beneficiary,
	Direction,
	Lieu,
	Provider,
	Service,
} from "./api";
import type { CreateAttestationDto } from "../api/domains/attestation";

export const ATTESTATION_STATUTS = [
	"EN_ATTENTE",
	"VALIDEE",
	"REFUSEE",
] as const;

export type AttestationStatut = (typeof ATTESTATION_STATUTS)[number];

/** Serialized `ReadAttestation` returned by the NestJS API. */
export interface Attestation {
	id: number;
	attestationPath: string | null;
	dateValidation: string | null;
	naturePrestation: string;
	servicePrestataire: string | null;
	statut: AttestationStatut;
	idpBeneficiaire: string;
	prestataireID: number;
	createdAt: string;
	datePEC: string;
}

/** Body of `POST /attestations`; the endpoint returns no body. */
export type CreateAttestationInput = CreateAttestationDto;

export type AttestationFormValues = CreateAttestationInput;

/** Enriched client-side row; these joined values are not part of the API DTO. */
export interface AttestationTableRow extends Attestation {
	beneficiary?: Beneficiary;
	agent?: AgentItem;
	provider?: Provider;
	location?: Lieu;
	service?: Service;
	direction?: Direction;
}

/** Shape retained for the old, unused local demonstration dataset. */
export interface MockAttestation {
	id: number;
	attestationPath: string;
	dateValidation: string;
	naturePrestation: string;
	servicePrestataire: string;
	prestataireID: number;
	idpBeneficiaire: string;
	statut: AttestationStatut;
}
