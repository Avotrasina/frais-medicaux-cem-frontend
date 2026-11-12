import { useCallback, useMemo, useState } from "react";
import { useAsyncLoader } from "../../../hooks/useAsyncLoader";
import { listPlafonds, type PlafondListResponse } from "../../../services/plafond-api";
import {
	buildT5XPlafondIndex,
} from "../utils/t5xPlafondIndex";

export default function useT5XPlafonds() {
	const [plafonds, setPlafonds] = useState<PlafondListResponse>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [loadError, setLoadError] = useState<string | null>(null);

	const load = useCallback(async (isStale: () => boolean) => {
		try {
			const loaded = await listPlafonds();
			if (isStale()) return;
			setPlafonds(loaded);
			setLoadError(null);
		} catch (error) {
			if (isStale()) return;
			setPlafonds([]);
			setLoadError(
				error instanceof Error
					? error.message
					: "Impossible de charger les plafonds T5.",
			);
		} finally {
			if (!isStale()) setIsLoading(false);
		}
	}, []);

	useAsyncLoader(load);

	const reload = useCallback(async () => {
		setLoadError(null);
		await load(() => false);
	}, [load]);

	const index = useMemo(() => buildT5XPlafondIndex(plafonds), [plafonds]);

	return { index, isLoading, loadError, reload };
}
