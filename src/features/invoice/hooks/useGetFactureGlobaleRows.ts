import { useCallback, useState } from "react";
import { useAsyncLoader } from "../../../hooks/useAsyncLoader";
import { getFactures } from "../services/serviceAPI";
import { mapFacturesGlobalesResponse } from "../services/mapFactureGlobaleResponse";
import type { FactureGlobaleRow } from "../types/invoiceTable";

export default function useGetFactureGlobaleRows() {
	const [data, setData] = useState<FactureGlobaleRow[] | null>(null);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	const getRows = useCallback(async (isStale: () => boolean) => {
		try {
			const response = await getFactures();
			const rows = mapFacturesGlobalesResponse(response);
			if (isStale()) return;
			setData(rows);
			setError(null);
		} catch (reason) {
			if (isStale()) return;
			setError(reason instanceof Error ? reason.message : "Impossible de charger les factures.");
		} finally {
			if (!isStale()) setIsLoading(false);
		}
	}, []);

	useAsyncLoader(getRows);

	const reload = useCallback(async () => {
		setIsLoading(true);
		setError(null);
		try {
			const response = await getFactures();
			const rows = mapFacturesGlobalesResponse(response);
			setData(rows);
			return rows;
		} catch (reason) {
			const message = reason instanceof Error ? reason.message : "Impossible de charger les factures.";
			setError(message);
			return null;
		} finally {
			setIsLoading(false);
		}
	}, []);

	return { data, isLoading, error, reload };
}
