import { createContext, useContext } from "react";
import type { IdpLookupResult } from "../../types/LookUp";

export const LookupResultContext = createContext<IdpLookupResult | null>(null);

export function useLookupResult() {
	return useContext(LookupResultContext);
}
