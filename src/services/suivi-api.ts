import type { SuiviPaths } from "../api/domains/suivi";
import { apiService } from "./api";
import { type QueryOf, type ResponseOf } from "./api-contract";

const ROUTES = {
	cibles: "/suivis/cibles",
} as const satisfies Record<string, keyof SuiviPaths>;

export type SuiviCibleListQuery = NonNullable<
	QueryOf<SuiviPaths, typeof ROUTES.cibles, "get">
>;
export type SuiviCibleListResponse = ResponseOf<
	SuiviPaths,
	typeof ROUTES.cibles,
	"get"
>;

/**
 * `GET /suivis/cibles` — actes and categories whose ceilings are tracked.
 * Without `date`, the backend uses today (Indian/Antananarivo).
 */
export function listSuiviCibles(
	query?: SuiviCibleListQuery,
): Promise<SuiviCibleListResponse> {
	return apiService.get<SuiviCibleListResponse>(ROUTES.cibles, {
		params: query,
	});
}
