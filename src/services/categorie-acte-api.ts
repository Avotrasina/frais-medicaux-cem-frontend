import type { CategorieActePaths } from "../api/domains/categorie-acte";
import type { CategorieActeAvecPlafondsResponseDto } from "../api/domains/categorie-acte";
import { apiService } from "./api";
import { type BodyOf, type QueryOf, type ResponseOf } from "./api-contract";

const ROUTES = {
	list: "/categories-actes",
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
export type CategorieWithPlafonds = CategorieActeAvecPlafondsResponseDto;

/** `GET /categories-actes` — pass `avecPlafonds` for the resolved ceilings. */
export function listCategories(
	query: CategorieListQuery = {},
): Promise<CategorieListResponse> {
	return apiService.get<CategorieListResponse>(ROUTES.list, { params: query });
}

/** `POST /categories-actes` — creates a category with optional ceilings. */
export function createCategorie(
	input: CreateCategorieBody,
): Promise<CreateCategorieResponse> {
	return apiService.post<CreateCategorieResponse>(ROUTES.list, input);
}
