import { useCallback, useState } from "react";
import { updateFacture } from "../services/serviceAPI";
import { mapFactureGlobaleUpdate } from "../services/mapFactureGlobaleUpdate";
import type { FactureGlobaleUpdateChanges } from "../types/invoiceTable";

export default function useUpdateFactureRow() {
	const [isLoading, setIsLoading] = useState(false);

	const modify = useCallback(async (
		id: number,
		changes: FactureGlobaleUpdateChanges,
	) => {
		const body = mapFactureGlobaleUpdate(changes);
		if (!body) return null;

		setIsLoading(true);
		try {
			return await updateFacture(id, body);
		} finally {
			setIsLoading(false);
		}
	}, []);

	return { modify, isLoading };
}
