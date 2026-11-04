import { useCallback, useState } from "react";
import { modifyFactureGlobaleMock } from "../mocks/invoiceTable";
import type { FactureGlobaleUpdateChanges } from "../types/invoiceTable";

export default function useUpdateFactureRow() {
	const [isLoading, setIsLoading] = useState(false);

	const modify = useCallback(async (
		refSocial: string,
		changes: FactureGlobaleUpdateChanges,
	) => {
		setIsLoading(true);
		try {
			return await modifyFactureGlobaleMock(refSocial, changes);
		} finally {
			setIsLoading(false);
		}
	}, []);

	return { modify, isLoading };
}
