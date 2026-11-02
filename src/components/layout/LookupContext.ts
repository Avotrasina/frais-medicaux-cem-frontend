import { createContext, useContext } from "react";
import type { IdpLookupResult } from "../../types/LookUp";

export const LookupResultContext = createContext<IdpLookupResult | null>(null);
export const LookupLoadingContext = createContext(false);

export function useLookupResult() {
	return useContext(LookupResultContext);
}

export function useLookupLoading() {
	return useContext(LookupLoadingContext);
}
