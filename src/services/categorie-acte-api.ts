import type { CategorieActePaths } from "../api/domains/categorie-acte";
import type { CategorieActeAvecPlafondsResponseDto } from "../api/domains/categorie-acte";
import { apiService } from "./api";
import { fillPath } from "./api-contract";
import { type BodyOf, type QueryOf, type ResponseOf } from "./api-contract";
import type { PlafondsPayload } from "./plafond-api";

const ROUTES = {
	list: "/categories-actes",
	detail: "/categories-actes/{id}",
} as const satisfies Record<string, keyof CategorieActePaths>;

export type CategorieListQuery = QueryOf<
	CategorieActePaths,
	typeof ROUTES.list,
	"get"
>;
export type CategorieListResponse = ResponseOf<
	CategorieActePaths,
	typeof ROUTES.list,
	"get"
>;
export type CreateCategorieBody = BodyOf<
	CategorieActePaths,
	typeof ROUTES.list,
	"post"
>;
export type CreateCategorieResponse = ResponseOf<
	CategorieActePaths,
	typeof ROUTES.list,
	"post"
>;
export type UpdateCategorieBody = BodyOf<
	CategorieActePaths,
	typeof ROUTES.detail,
	"patch"
>;
export type UpdateCategorieResponse = ResponseOf<
	CategorieActePaths,
	typeof ROUTES.detail,
	"patch"
>;
export type CategorieWithPlafonds = CategorieActeAvecPlafondsResponseDto;

export type UpdateCategorieInput = UpdateCategorieBody & {
	plafonds?: PlafondsPayload | null;
};

export function listCategories(
	query: CategorieListQuery = {},
): Promise<CategorieListResponse> {
	return apiService.get<CategorieListResponse>(ROUTES.list, { params: query });
}

export function createCategorie(
	input: CreateCategorieBody,
): Promise<CreateCategorieResponse> {
	return apiService.post<CreateCategorieResponse>(ROUTES.list, input);
}

export function updateCategorie(
	id: number,
	input: UpdateCategorieInput,
): Promise<UpdateCategorieResponse> {
	return apiService.patch<UpdateCategorieResponse>(
		fillPath(ROUTES.detail, { id }),
		input,
	);
}

export function deleteCategorie(id: number): Promise<void> {
	return apiService.delete<void>(fillPath(ROUTES.detail, { id }));
}
