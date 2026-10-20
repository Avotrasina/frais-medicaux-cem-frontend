import { api, apiRoutes, apiService } from "./api";
import type { Attestation, CreateAttestationInput } from "../types/attestation";

/** `GET /attestation/pending/` — pending attestations only. */
export function listPendingAttestations(): Promise<Attestation[]> {
	return apiService.get<Attestation[]>(apiRoutes.pendingAttestations);
}

/** `GET /attestation/preview/:id` — PNG rendering of the stored PDF's first page. */
export async function getAttestationPreview(id: number): Promise<Blob> {
	const response = await api.get<Blob>(apiRoutes.attestationPreview(id), {
		responseType: "blob",
	});
	return response.data;
}

/** `POST /attestation/create/` — HTTP 201 with no response body. */
export async function createAttestation(
	input: CreateAttestationInput,
): Promise<void> {
	await apiService.post<void>(apiRoutes.attestationCreate, input);
}

/** `PATCH /attestation/approve/:id` — marks a pending attestation as approved. */
export function approveAttestation(id: number): Promise<void> {
	return apiService.patch<void>(apiRoutes.approveAttestation(id));
}

/** `PATCH /attestation/reject/:id` — rejects and removes the stored PDF. */
export function rejectAttestation(id: number): Promise<void> {
	return apiService.patch<void>(apiRoutes.rejectAttestation(id));
}
