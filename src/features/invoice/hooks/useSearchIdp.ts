import { useCallback, useRef, useState } from "react";
import type { IdpLookupResult } from "../../../types/LookUp";

type SearchIdp = (idp: string) => Promise<IdpLookupResult>;

export default function useSearchIdp(searchIdp: SearchIdp) {
	const [result, setResult] = useState<IdpLookupResult | null>(null);
	const [idp, setIdp] = useState("");
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const requestId = useRef(0);

	const search = useCallback(async (value: string) => {
		const query = value.trim();
		if (!query) return null;
		const currentRequest = ++requestId.current;
		setIdp(query);
		setIsLoading(true);
		setError(null);
		setResult(null);
		try {
			const response = await searchIdp(query);
			if (currentRequest !== requestId.current) return null;
			setResult(response);
			return response;
		} catch (reason) {
			if (currentRequest !== requestId.current) return null;
			const message = reason instanceof Error ? reason.message : "Recherche IDP impossible.";
			setResult(null);
			setError(message);
			return null;
		} finally {
			if (currentRequest === requestId.current) setIsLoading(false);
		}
	}, [searchIdp]);

	const refresh = useCallback(async () => {
		if (!idp) throw new Error("Aucun IDP à actualiser.");
		const currentRequest = ++requestId.current;
		setIsLoading(true);
		setError(null);
		try {
			const response = await searchIdp(idp);
			if (currentRequest !== requestId.current) throw new Error("Actualisation remplacée par une recherche plus récente.");
			setResult(response);
			return response;
		} catch (reason) {
			if (currentRequest !== requestId.current) throw reason;
			const message = reason instanceof Error ? reason.message : "Impossible d’actualiser les données IDP et T5.";
			setError(message);
			throw reason instanceof Error ? reason : new Error(message);
		} finally {
			if (currentRequest === requestId.current) setIsLoading(false);
		}
	}, [idp, searchIdp]);

	return { result, idp, isLoading, error, search, refresh };
}
