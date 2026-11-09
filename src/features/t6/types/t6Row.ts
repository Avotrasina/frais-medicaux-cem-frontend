import type { RefObject } from "react";

export type T6Row = {
	id: number;
	moisAffectation: Date | null;
	refPaie: string;
	dateSaisie: string;
	refSocial: string;
	numFacture: string;
	dateFacture: string;
	nomEtablissement: string;
	idp: string;
	nomBeneficiaire: string;
	prenomBeneficiaire: string;
	codeFamille: string;
	obsIdp: string;
	im: string;
	nomAgent: string;
	prenomAgent: string;
	direction: string;
	serviceAgence: string;
	code: string;
	actePrestation: string;
	categorie: string;
	dateActe: string;
	numPec: string;
	montantTotal: number;
	partCem100: number;
	depassement: number;
	obsDepassement: string;
	partCem80: number;
	partAgent20: number;
	totalChargeAgent: number;
};

export type T6ColumnKey = Exclude<keyof T6Row, "id">;

export type T6EditableKey =
	| "moisAffectation"
	| "refPaie"
	| "dateSaisie"
	| "refSocial"
	| "idp"
	| "code"
	| "dateActe"
	| "numPec"
	| "montantTotal"
	| "partCem100"
	| "depassement"
	| "partCem80"
	| "partAgent20"
	| "totalChargeAgent";

export type T6CellValue = string | number | Date | null;
export type T6Changes = Partial<Pick<T6Row, T6EditableKey>>;

export type T6TableProps = {
	rows: T6Row[];
	addRowId: number;
	activeRowId: number | null;
	containerRef: RefObject<HTMLDivElement | null>;
	addRowRef: RefObject<HTMLTableRowElement | null>;
	loadingCells: ReadonlySet<string>;
	onAddRow: () => void;
	onCellChange: (rowId: number, key: T6EditableKey, value: T6CellValue) => void;
};
