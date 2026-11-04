import { useCallback, useState } from "react";
import { createFactureGlobaleMock } from "../mocks/invoiceTable";
import type { FactureGlobaleCreateInput } from "../types/invoiceTable";

export default function useAddFactureRow() {
	const [isLoading, setIsLoading] = useState(false);

	const save = useCallback(async (input: FactureGlobaleCreateInput) => {
		setIsLoading(true);
		try {
			return await createFactureGlobaleMock(input);
		} finally {
			setIsLoading(false);
		}
	}, []);

	return { save, isLoading };
}
