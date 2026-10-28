import { apiRoutes, apiService } from "../../../services/api";
import type { Beneficiary } from "../../../types/api";

/** `GET /beneficiaries/by-matricule/:matricule` — agent + spouse + children. */
export function listBeneficiariesByMatricule(
	matricule: string,
): Promise<Beneficiary[]> {
	return apiService.get<Beneficiary[]>(
		apiRoutes.beneficiariesByMatricule(matricule),
	);
}

/** `GET /beneficiaries/:idp` — throws `Beneficiaire introuvable` if unknown. */
export function getBeneficiaryByIdp(idp: string): Promise<Beneficiary> {
	return apiService.get<Beneficiary>(apiRoutes.beneficiaryByIdp(idp));
}

/**
 * `PATCH /beneficiaries/:idp/observation`.
 * A missing or `null` value clears the observation.
 */
export function updateBeneficiaryObservation(
	idp: string,
	observationIDP: string | null,
): Promise<Beneficiary> {
	return apiService.patch<Beneficiary>(
		apiRoutes.beneficiaryObservation(idp),
		{ observationIDP },
	);
}

export interface BeneficiaryCollection {
	beneficiaries: Beneficiary[];
	/** Matricules whose sub-request failed; the rest of the list is still valid. */
	failedMatricules: string[];
}

/**
 * The reference API exposes no "list every beneficiary" route: only lookups by
 * matricule or by IDP. A global view therefore has to be aggregated from the
 * agents, which costs one request per agent.
 *
 * The fan-out is bounded and tolerant: a failing matricule is reported instead
 * of discarding the whole result.
 */
export async function listAllBeneficiaries(
	matricules: string[],
	options: {
		concurrency?: number;
		onProgress?: (loaded: number, total: number) => void;
	} = {},
): Promise<BeneficiaryCollection> {
	const { concurrency = 6, onProgress } = options;
	const beneficiaries: Beneficiary[] = [];
	const failedMatricules: string[] = [];
	let cursor = 0;
	let loaded = 0;

	const worker = async (): Promise<void> => {
		while (cursor < matricules.length) {
			const matricule = matricules[cursor];
			cursor += 1;
			try {
				beneficiaries.push(...(await listBeneficiariesByMatricule(matricule)));
			} catch {
				failedMatricules.push(matricule);
			}
			loaded += 1;
			onProgress?.(loaded, matricules.length);
		}
	};

	const workers = Array.from(
		{ length: Math.min(concurrency, matricules.length) },
		() => worker(),
	);
	await Promise.all(workers);

	beneficiaries.sort(
		(left, right) =>
			left.nom.localeCompare(right.nom, "fr") ||
			left.prenom.localeCompare(right.prenom, "fr"),
	);

	return { beneficiaries, failedMatricules };
}
