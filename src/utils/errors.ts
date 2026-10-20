import { ApiError } from "../services/api";

/**
 * Turns any thrown value into a message that can be shown to the user.
 * `ApiError` already carries a French message built from the HTTP status.
 */
export function errorMessage(
	error: unknown,
	fallback = "Une erreur est survenue.",
): string {
	if (error instanceof ApiError) return error.message;
	if (error instanceof Error) return error.message || fallback;
	return fallback;
}

/**
 * Known backend defects documented in `API.md` §13 that the UI can explain
 * instead of showing a raw 500.
 */
export function explainKnownBackendDefect(
	error: unknown,
	context: "enfant" | "agent" | "generic" = "generic",
): string | null {
	if (!(error instanceof ApiError) || error.status !== 500) return null;
	if (context === "enfant") {
		return "Le serveur a refusé la création : la branche `develop` transmet `numConjoint` au lieu de `numEnfant` pour un enfant (defect connu, API.md §13.2). La route doit être corrigée côté backend.";
	}
	return null;
}
