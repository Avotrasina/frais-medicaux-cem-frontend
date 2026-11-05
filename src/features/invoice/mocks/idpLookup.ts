import type { IdpLookupResult } from "../../../types/LookUp";
import { initialT5ParAnRowsMock } from "./t5ParAn";
import { initialT5ParAnParActeRowsMock } from "./t5ParAnParActe";
import { initialT5ParSeanceRowsMock } from "./t5ParSeance";

export type T5TableKind = "parAn" | "parAnParActe" | "parSeance";

export type T5Row = IdpLookupResult["t5Data"][T5TableKind][number];

export type T5Update = {
	refSocial: string;
	dateActe?: string;
	libelle?: string;
	montantActe?: number;
};

export type T5WriteInput = Pick<T5Update, "refSocial" | "dateActe" | "libelle" | "montantActe">;

let t5Rows: IdpLookupResult["t5Data"] | null = null;

function getT5Rows(): IdpLookupResult["t5Data"] {
	t5Rows ??= {
		parAn: initialT5ParAnRowsMock.map((row) => ({ ...row })),
		parAnParActe: initialT5ParAnParActeRowsMock.map((row) => ({ ...row })),
		parSeance: initialT5ParSeanceRowsMock.map((row) => ({ ...row })),
	};
	return t5Rows;
}

export async function fetchIdpLookupMock(idp: string): Promise<IdpLookupResult> {
	await new Promise((resolve) => setTimeout(resolve, 2000));
	return {
		agent: {
			nom: "Rakoto",
			prenom: "Ando",
			codeFam: "AGENT",
			observationIdp: null,
			matricule: idp,
			backOfficeFrontOffice: "BACK_OFFICE",
			direction: "Informatique",
			agenceService: null,
		},
		t5Data: {
			parAn: getT5Rows().parAn.map((row) => ({ ...row })),
			parAnParActe: getT5Rows().parAnParActe.map((row) => ({ ...row })),
			parSeance: getT5Rows().parSeance.map((row) => ({ ...row })),
		},
	};
}

export async function createT5RowMock<T extends T5Row>(
	table: T5TableKind,
	input: T5WriteInput,
	defaults: T,
): Promise<T> {
	await Promise.resolve();
	const rows = getT5Rows()[table] as T5Row[];
	const createdRow = {
		...defaults,
		...input,
		id: Math.max(0, ...rows.map((item) => item.id)) + 1,
	} as T;
	(t5Rows as IdpLookupResult["t5Data"])[table] = [...rows, createdRow] as never;
	return { ...createdRow };
}

export async function updateT5RowMock(
	table: T5TableKind,
	rowId: number,
	changes: T5Update,
): Promise<T5Row> {
	await Promise.resolve();
	const rows = getT5Rows()[table] as T5Row[];
	const rowIndex = rows.findIndex((row) => row.id === rowId);
	if (rowIndex === -1) throw new Error(`Ligne T5 ${rowId} introuvable.`);
	const updatedRow = { ...rows[rowIndex], ...changes } as T5Row;
	(t5Rows as IdpLookupResult["t5Data"])[table] = rows.map((row, index) =>
		index === rowIndex ? updatedRow : row,
	) as never;
	return { ...updatedRow };
}
