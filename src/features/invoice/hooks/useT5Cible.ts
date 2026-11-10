import { useMemo } from "react";
import useSuiviCibles from "./useSuiviCibles";
import type { CibleType, DropdownOption } from "../types/dropDown";

/**
 * Resolves the target selected in the "Maj T5" dropdown for a T5 page.
 * The page re-fetches `/suivis/cibles`, so a direct URL or a refresh keeps
 * working without relying on React Router state.
 */
export default function useT5Cible(
	id: string | undefined,
	type: CibleType,
): {
	cible: DropdownOption | null;
	isLoading: boolean;
	error: string | null;
	reload: () => Promise<void>;
} {
	const { options, isLoading, error, reload } = useSuiviCibles();

	const cible = useMemo(() => {
		const numericId = Number(id);
		if (!Number.isInteger(numericId)) return null;
		return options.find(
			(option) => option.id === numericId && option.type === type,
		) ?? null;
	}, [id, options, type]);

	const notFound = !isLoading && !error && cible === null;

	return {
		cible,
		isLoading,
		error: error ?? (notFound
			? `Aucune cible T5 trouvée pour l’identifiant « ${id ?? ""} » et le type « ${type} ».`
			: null),
		reload,
	};
}
