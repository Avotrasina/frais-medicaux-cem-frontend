import type { PlafondPaths } from "../api/domains/plafond";
import { apiService } from "./api";
import { type QueryOf, type ResponseOf } from "./api-contract";

const ROUTES = {
	list: "/plafonds",
} as const satisfies Record<string, keyof PlafondPaths>;

export type PlafondListQuery = QueryOf<PlafondPaths, typeof ROUTES.list, "get">;
export type PlafondListResponse = ResponseOf<
	PlafondPaths,
	typeof ROUTES.list,
	"get"
>;


export type PlafondsPayload = {
	parActe?: { montant: number } | null;
	parAn?:
		| { unite: "MONTANT"; montant: number }
		| { unite: "SEANCES"; nbSeances: number }
		| null;
};

export function listPlafonds(
	query: PlafondListQuery = {},
): Promise<PlafondListResponse> {
	return apiService.get<PlafondListResponse>(ROUTES.list, { params: query });
}
