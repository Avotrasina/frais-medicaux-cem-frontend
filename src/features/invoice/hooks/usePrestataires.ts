import { useCallback, useState } from "react";
import { useAsyncLoader } from "../../../hooks/useAsyncLoader";
import { listLieux } from "../../../services/lieu-api";
import { listProviders } from "../../../services/prestataire-api";
import { mapPrestatairesResponse } from "../services/mapPrestatairesResponse";
import type { Prestataire } from "../types/prestataire";

export default function usePrestataires() {
	const [prestataires, setPrestataires] = useState<Prestataire[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	const load = useCallback(async (isStale: () => boolean) => {
		try {
			const [providersResult, locationsResult] = await Promise.allSettled([
				listProviders(),
				listLieux(),
			]);
			if (providersResult.status === "rejected") throw providersResult.reason;
			if (isStale()) return;

			const locations =
				locationsResult.status === "fulfilled" ? locationsResult.value : [];
			setPrestataires(
				mapPrestatairesResponse(providersResult.value, locations),
			);
			setError(null);
		} catch (reason) {
			if (isStale()) return;
			setPrestataires([]);
			setError(
				reason instanceof Error
					? reason.message
					: "Impossible de charger les prestataires.",
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

	return { prestataires, isLoading, error, reload };
}
