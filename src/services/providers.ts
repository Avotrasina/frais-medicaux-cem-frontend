import { apiRoutes, apiService, imageFormData } from "./api";
import type {
	CreateProviderInput,
	Provider,
	ProviderCategory,
	ProviderFilter,
	UpdateProviderInput,
} from "../types/api";

/** `GET /providers` — every provider, sorted by `nom`. */
export function listProviders(): Promise<Provider[]> {
	return apiService.get<Provider[]>(apiRoutes.providers);
}

/**
 * `GET /providers/search?lieuID=&categorieID=`.
 * Both criteria are optional and combined with AND. Invalid integers give a 400,
 * so the caller must send numbers or nothing.
 */
export function filterProviders(filter: ProviderFilter): Promise<Provider[]> {
	const params: Record<string, number> = {};
	if (filter.lieuID !== undefined) params.lieuID = filter.lieuID;
	if (filter.categorieID !== undefined) params.categorieID = filter.categorieID;
	if (Object.keys(params).length === 0) {
		return listProviders();
	}
	return apiService.get<Provider[]>(apiRoutes.providersFilter, { params });
}

/** `POST /providers` — all fields required; returns the created provider. */
export function createProvider(
	input: CreateProviderInput,
	convention: File,
): Promise<Provider> {
	return apiService.post<Provider>(
		apiRoutes.providers,
		imageFormData(
			input as unknown as Record<string, unknown>,
			convention,
			"convention",
		),
	);
}

/** `PATCH /providers/:id-provider` — partial update; `null`/missing values are ignored. */
export function updateProvider(
	id: number,
	input: UpdateProviderInput,
): Promise<Provider> {
	return apiService.patch<Provider>(apiRoutes.provider(id), input);
}

/** `PATCH /providers/:id-provider/convention` — replaces the agreement PDF. */
export function updateProviderConvention(
	id: number,
	convention: File,
): Promise<Provider> {
	return apiService.patch<Provider>(
		apiRoutes.providerConvention(id),
		imageFormData({}, convention, "convention"),
	);
}

// --- Provider categories ----------------------------------------------------

export function listProviderCategories(): Promise<ProviderCategory[]> {
	return apiService.get<ProviderCategory[]>(apiRoutes.providerCategories);
}

export function createProviderCategory(nom: string): Promise<ProviderCategory> {
	return apiService.post<ProviderCategory>(apiRoutes.providerCategories, {
		nom,
	});
}

export function updateProviderCategory(
	id: number,
	nom: string,
): Promise<ProviderCategory> {
	return apiService.patch<ProviderCategory>(apiRoutes.providerCategory(id), {
		nom,
	});
}
