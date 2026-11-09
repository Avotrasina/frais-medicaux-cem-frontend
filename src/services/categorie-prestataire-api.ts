import type { CategoriePrestatairePaths } from "../api/domains/categorie-prestataire";
import { apiService } from "./api";
import { type BodyOf, fillPath, type ResponseOf } from "./api-contract";

const ROUTES = {
	list: "/provider-categories",
	detail: "/provider-categories/{id}",
} as const satisfies Record<string, keyof CategoriePrestatairePaths>;

export type ProviderCategoryListResponse = ResponseOf<
	CategoriePrestatairePaths,
	typeof ROUTES.list,
	"get"
>;
export type CreateProviderCategoryBody = BodyOf<
	CategoriePrestatairePaths,
	typeof ROUTES.list,
	"post"
>;
export type CreateProviderCategoryResponse = ResponseOf<
	CategoriePrestatairePaths,
	typeof ROUTES.list,
	"post"
>;
export type UpdateProviderCategoryBody = BodyOf<
	CategoriePrestatairePaths,
	typeof ROUTES.detail,
	"patch"
>;
export type UpdateProviderCategoryResponse = ResponseOf<
	CategoriePrestatairePaths,
	typeof ROUTES.detail,
	"patch"
>;

export function listProviderCategories(): Promise<ProviderCategoryListResponse> {
	return apiService.get<ProviderCategoryListResponse>(ROUTES.list);
}

export function createProviderCategory(
	nom: string,
): Promise<CreateProviderCategoryResponse> {
	const body: CreateProviderCategoryBody = { nom };
	return apiService.post<CreateProviderCategoryResponse>(ROUTES.list, body);
}

export function updateProviderCategory(
	id: number,
	nom: string,
): Promise<UpdateProviderCategoryResponse> {
	const body: UpdateProviderCategoryBody = { nom };
	return apiService.patch<UpdateProviderCategoryResponse>(
		fillPath(ROUTES.detail, { id }),
		body,
	);
}
