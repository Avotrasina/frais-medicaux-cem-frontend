import { api, apiRoutes, apiService } from "../../../services/api";
import type { CreateAttestationDto } from "../../../api/domains/attestation";
import type { Attestation, CreateAttestationInput } from "../../../types/attestation";

/** `GET /attestations` — all attestations. */
export function listAttestations(): Promise<Attestation[]> {
	return apiService.get<Attestation[]>(apiRoutes.attestations);
}

/** `GET /attestations/:id/preview` — PNG rendering of the stored PDF's first page. */
export async function getAttestationPreview(id: number): Promise<Blob> {
	const response = await api.get<Blob>(apiRoutes.attestationPreview(id), {
		responseType: "blob",
	});
	return response.data;
}

/** `POST /attestations` — HTTP 201 with no response body. */
export async function createAttestation(
	input: CreateAttestationInput,
): Promise<void> {
	const body: CreateAttestationDto = input;
	await apiService.post<void>(apiRoutes.attestationCreate, body);
}

/** `PATCH /attestations/:id/approval` — marks a pending attestation as approved. */
export function approveAttestation(id: number): Promise<void> {
	return apiService.patch<void>(apiRoutes.approveAttestation(id));
}

/** `PATCH /attestations/:id/rejection` — rejects and removes the stored PDF. */
export function rejectAttestation(id: number): Promise<void> {
	return apiService.patch<void>(apiRoutes.rejectAttestation(id));
}
