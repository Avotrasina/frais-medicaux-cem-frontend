import { useCallback, useState } from "react";
import { useAsyncLoader } from "../../../hooks/useAsyncLoader";
import { listSuiviCibles } from "../../../services/suivi-api";
import { mapSuiviCibles } from "../services/mapSuiviCibles";
import type { DropdownOption } from "../types/dropDown";

/**
 * Loads the tracked T5 targets (categories and acts) from `/suivis/cibles`.
 * The backend uses today's date when no date is supplied.
 */
export default function useSuiviCibles() {
	const [options, setOptions] = useState<DropdownOption[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	const load = useCallback(async (isStale: () => boolean) => {
		try {
			const response = await listSuiviCibles();
			if (isStale()) return;
			setOptions(mapSuiviCibles(response));
			setError(null);
		} catch (reason) {
			if (isStale()) return;
			setOptions([]);
			setError(
				reason instanceof Error
					? reason.message
					: "Impossible de charger les cibles T5.",
			);
		} finally {
			if (!isStale()) setIsLoading(false);
		}
	}, []);

	useAsyncLoader(load);

	const reload = useCallback(async () => {
		setIsLoading(true);
		setError(null);
		await load(() => false);
	}, [load]);

	return { options, isLoading, error, reload };
}
