import type { ActePaths } from "../api/domains/acte";
import type { ActeAvecPlafondsResponseDto } from "../api/domains/shared/components";
import { apiService } from "./api";
import { type BodyOf, type QueryOf, type ResponseOf } from "./api-contract";

const ROUTES = {
	list: "/actes",
} as const satisfies Record<string, keyof ActePaths>;

export type ActeListQuery = QueryOf<ActePaths, typeof ROUTES.list, "get">;
export type ActeListResponse = ResponseOf<
	ActePaths,
	typeof ROUTES.list,
	"get"
>;
export type CreateActeBody = BodyOf<ActePaths, typeof ROUTES.list, "post">;
export type CreateActeInput = Extract<CreateActeBody, { type: "ACTE" }>;
export type CreateActeResponse = ResponseOf<
	ActePaths,
	typeof ROUTES.list,
	"post"
>;
export type ActeWithPlafonds = ActeAvecPlafondsResponseDto;

/** `GET /actes` — pass `avecPlafonds` to receive the resolved ceilings. */
export function listActes(
	query: ActeListQuery = {},
): Promise<ActeListResponse> {
	return apiService.get<ActeListResponse>(ROUTES.list, { params: query });
}

/** `POST /actes` — creates an act; ceilings are optional. */
export function createActe(
	input: CreateActeInput,
): Promise<CreateActeResponse> {
	return apiService.post<CreateActeResponse>(ROUTES.list, input);
}
