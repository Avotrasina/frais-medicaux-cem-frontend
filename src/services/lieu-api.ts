import type { LieuPaths } from "../api/domains/lieu";
import { apiService } from "./api";
import { type BodyOf, fillPath, type ResponseOf } from "./api-contract";

const ROUTES = {
	list: "/locations",
	detail: "/locations/{id}",
} as const satisfies Record<string, keyof LieuPaths>;

export type LieuListResponse = ResponseOf<
	LieuPaths,
	typeof ROUTES.list,
	"get"
>;
export type CreateLieuBody = BodyOf<LieuPaths, typeof ROUTES.list, "post">;
export type CreateLieuResponse = ResponseOf<
	LieuPaths,
	typeof ROUTES.list,
	"post"
>;
export type UpdateLieuBody = BodyOf<LieuPaths, typeof ROUTES.detail, "patch">;
export type UpdateLieuResponse = ResponseOf<
	LieuPaths,
	typeof ROUTES.detail,
	"patch"
>;

/** There is no `GET /locations/{id}`: only the full listing is available. */
export function listLieux(): Promise<LieuListResponse> {
	return apiService.get<LieuListResponse>(ROUTES.list);
}

export function createLieu(nom: string): Promise<CreateLieuResponse> {
	const body: CreateLieuBody = { nom };
	return apiService.post<CreateLieuResponse>(ROUTES.list, body);
}

export function updateLieu(
	id: number,
	nom: string,
): Promise<UpdateLieuResponse> {
	const body: UpdateLieuBody = { nom };
	return apiService.patch<UpdateLieuResponse>(
		fillPath(ROUTES.detail, { id }),
		body,
	);
}
