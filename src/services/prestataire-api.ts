import type {
	CreateProviderDto,
	PrestatairePaths,
} from "../api/domains/prestataire";
import { apiService, imageFormData } from "./api";
import {
	type BodyOf,
	fillPath,
	type QueryOf,
	type ResponseOf,
} from "./api-contract";

const ROUTES = {
	list: "/providers",
	search: "/providers/search",
	detail: "/providers/{id}",
	convention: "/providers/{id}/convention",
} as const satisfies Record<string, keyof PrestatairePaths>;

export type ProviderListResponse = ResponseOf<
	PrestatairePaths,
	typeof ROUTES.list,
	"get"
>;
export type ProviderSearchQuery = QueryOf<
	PrestatairePaths,
	typeof ROUTES.search,
	"get"
>;
export type CreateProviderResponse = ResponseOf<
	PrestatairePaths,
	typeof ROUTES.list,
	"post"
>;
export type UpdateProviderBody = BodyOf<
	PrestatairePaths,
	typeof ROUTES.detail,
	"patch"
>;
export type UpdateProviderResponse = ResponseOf<
	PrestatairePaths,
	typeof ROUTES.detail,
	"patch"
>;
export type UpdateProviderConventionResponse = ResponseOf<
	PrestatairePaths,
	typeof ROUTES.convention,
	"patch"
>;

/** `GET /providers` — every provider, sorted by `nom`. */
export function listProviders(): Promise<ProviderListResponse> {
	return apiService.get<ProviderListResponse>(ROUTES.list);
}

/**
 * `GET /providers/search?lieuID=&categorieID=`.
 * Both criteria are optional and combined with AND. Invalid integers give a 400,
 * so the caller must send numbers or nothing.
 */
export function filterProviders(
	filter: ProviderSearchQuery,
): Promise<ProviderListResponse> {
	const params: ProviderSearchQuery = {};
	if (filter.lieuID !== undefined) params.lieuID = filter.lieuID;
	if (filter.categorieID !== undefined) params.categorieID = filter.categorieID;
	if (Object.keys(params).length === 0) {
		return listProviders();
	}
	return apiService.get<ProviderListResponse>(ROUTES.search, { params });
}

/** `POST /providers` — all fields required; returns the created provider. */
export function createProvider(
	input: CreateProviderDto,
	convention: File,
): Promise<CreateProviderResponse> {
	return apiService.post<CreateProviderResponse>(
		ROUTES.list,
		imageFormData(input, convention, "convention"),
	);
}

/** `PATCH /providers/{id}` — partial update; `null`/missing values are ignored. */
export function updateProvider(
	id: number,
	input: UpdateProviderBody,
): Promise<UpdateProviderResponse> {
	return apiService.patch<UpdateProviderResponse>(
		fillPath(ROUTES.detail, { id }),
		input,
	);
}

/** `PATCH /providers/{id}/convention` — replaces the agreement PDF. */
export function updateProviderConvention(
	id: number,
	convention: File,
): Promise<UpdateProviderConventionResponse> {
	return apiService.patch<UpdateProviderConventionResponse>(
		fillPath(ROUTES.convention, { id }),
		imageFormData({}, convention, "convention"),
	);
}
