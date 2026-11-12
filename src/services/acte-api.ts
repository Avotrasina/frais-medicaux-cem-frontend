import type { ActePaths } from "../api/domains/acte";
import type { ActeAvecPlafondsResponseDto } from "../api/domains/shared/components";
import { apiService } from "./api";
import { fillPath } from "./api-contract";
import { type BodyOf, type QueryOf, type ResponseOf } from "./api-contract";
import type { PlafondsPayload } from "./plafond-api";

const ROUTES = {
	list: "/actes",
	detail: "/actes/{id}",
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
export type UpdateActeBody = BodyOf<ActePaths, typeof ROUTES.detail, "patch">;
export type UpdateActeResponse = ResponseOf<
	ActePaths,
	typeof ROUTES.detail,
	"patch"
>;
export type ActeWithPlafonds = ActeAvecPlafondsResponseDto;


export type UpdateActeInput = UpdateActeBody & {
	plafonds?: PlafondsPayload | null;
};

export function listActes(
	query: ActeListQuery = {},
): Promise<ActeListResponse> {
	return apiService.get<ActeListResponse>(ROUTES.list, { params: query });
}

export function createActe(
	input: CreateActeInput,
): Promise<CreateActeResponse> {
	return apiService.post<CreateActeResponse>(ROUTES.list, input);
}

export function updateActe(
	id: number,
	input: UpdateActeInput,
): Promise<UpdateActeResponse> {
	return apiService.patch<UpdateActeResponse>(
		fillPath(ROUTES.detail, { id }),
		input,
	);
}

export function deleteActe(id: number): Promise<void> {
	return apiService.delete<void>(fillPath(ROUTES.detail, { id }));
}
