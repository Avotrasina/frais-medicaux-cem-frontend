import type { IdpLookupResult } from "../../../types/LookUp";
import { initialT5ParAnRowsMock } from "./t5ParAn";
import { initialT5ParAnParActeRowsMock } from "./t5ParAnParActe";
import { initialT5ParSeanceRowsMock } from "./t5ParSeance";

export async function fetchIdpLookupMock(_idp: string): Promise<IdpLookupResult> {
	await new Promise((resolve) => setTimeout(resolve, 250));
	return {
		agent: {
			nom: "Rakoto",
			prenom: "Ando",
			codeFam: "AGENT",
			observationIdp: null,
			matricule: "12345",
			backOfficeFrontOffice: "BACK_OFFICE",
			direction: "Informatique",
			agenceService: null,
		},
		t5Data: {
			parAn: initialT5ParAnRowsMock.map((row) => ({ ...row })),
			parAnParActe: initialT5ParAnParActeRowsMock.map((row) => ({ ...row })),
			parSeance: initialT5ParSeanceRowsMock.map((row) => ({ ...row })),
		},
	};
}
