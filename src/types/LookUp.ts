import type { T5ParAnRow } from "../features/invoice/types/t5ParAn";
import type { T5ParAnParActeRow } from "../features/invoice/types/t5ParAnParActe";
import type { T5ParSeanceRow } from "../features/invoice/types/t5ParSeance";

export type IdpLookupInfo = {
	nom: string;
	prenom: string;
	codeFam: string;
	observationIdp: string | null;
	matricule: string;
	backOfficeFrontOffice: string;
	direction: string | null;
	agenceService: string | null;
};

export type IdpLookupResult = {
	agent: IdpLookupInfo;
	t5Data: {
		parAn: T5ParAnRow[];
		parAnParActe: T5ParAnParActeRow[];
		parSeance: T5ParSeanceRow[];
	};
};
