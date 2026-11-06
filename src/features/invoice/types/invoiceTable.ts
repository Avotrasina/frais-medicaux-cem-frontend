import type { RefObject } from "react";

export const ContrainteType = {
	PAR_AN : "PAR_AN",
	PAR_SEANCE : "PAR SEANCE",
	PAR_AN_PAR_ACTE: "PAR_AN_PAR_ACTE"
} as const;
export type ContarinteType = (typeof ContrainteType) [keyof typeof ContrainteType]


export type FactureGlobaleRow = {
	id: number;
	refSocial: string;
	dateReception: string;
	numFacture: string;
	dateFacture: string;
	nomEtablissement: string;
	montantTotal: number;
	partCem100: number;
	depassement: number;
	partCem80: number;
	partAgent20: number;
	totalPartAgent: number;
	localite: string;
	moisPrestation: Date | null;
	refAgence: string;
	remarques1: string;
	retourPrestataire: string;
	recuApresModification: string;
	dateEnregistrement: string;
	parQuiEnregistrement: string;
	dateEnvoiValidation: string;
	pourQuiValidation: string;
	remarques2: string;
	retourCorrection: string;
	dateValidation: string;
	parQuiValidationFinale: string;
	dateSortie: string;
	serviceSortie: string;
};


export type FactureGlobaleChanges = Partial<{
	[K in Exclude<keyof FactureGlobaleRow, "id">]: FactureGlobaleRow[K] | undefined;
}>;

export type FactureGlobaleCreateInput = Pick<
	FactureGlobaleRow,
	"dateReception" | "numFacture" | "dateFacture" | "nomEtablissement" | "montantTotal"
>;

export const FACTURE_GLOBALE_UPDATE_KEYS = [
	"dateReception",
	"numFacture",
	"dateFacture",
	"nomEtablissement",
	"montantTotal",
	"partCem100",
	"depassement",
	"partCem80",
	"partAgent20",
	"totalPartAgent",
	"localite",
	"moisPrestation",
	"refAgence",
	"remarques1",
	"retourPrestataire",
	"recuApresModification",
] as const satisfies readonly (keyof FactureGlobaleRow)[];

export type FactureGlobaleUpdateKey = (typeof FACTURE_GLOBALE_UPDATE_KEYS)[number];
export type FactureGlobaleUpdateChanges = Partial<
	Pick<FactureGlobaleRow, FactureGlobaleUpdateKey>
>;

export type FactureGlobaleCellValue = string | number | Date | null;

export type FactureGlobaleTableProps = {
	rows: FactureGlobaleRow[];
	addRowId: number;
	activeRowId: number | null;
	selectedRowId: number | null;
	containerRef: RefObject<HTMLDivElement | null>;
	addRowRef: RefObject<HTMLTableRowElement | null>;
	onRowSelect: (rowId: number) => void;
	onCellChange: (
		rowId: number,
		key: FactureGlobaleColumnKey,
		value: FactureGlobaleCellValue,
	) => void;
}

export type FactureGlobaleColumnKey = Exclude<keyof FactureGlobaleRow, "id">|"majT5";

export type FactureGlobaleColumn = {
	key: FactureGlobaleColumnKey;
	label: string;
	width: string;
};


export type FactureT5X = {
	id: number;
	typeContrainte: ContarinteType;
	nom:string;
};

export const numberColumn = {
	montantTotal : "montantTotal",
	partCem100 : "partCem100",
	depassement : "depassement",
	partCem80 : "partCem80",
	partAgent20 : "partAgent20",
	totalPartAgent : "totalPartAgent"
} as const ; 
export type numberColumn =  (typeof numberColumn)[keyof typeof numberColumn];

export const dateColumn = {
	dateReception : "dateReception",
	dateFacture : "dateFacture",
	dateEnregistrement : "dateEnregistrement",
	dateEnvoiValidation : "dateEnvoiValidation",
	dateValidation : "dateValidation"
} as const;
export type dateColumn = (typeof dateColumn) [keyof typeof dateColumn];

export const SaveColumnKey = [
    "dateReception",
    "numFacture",
    "dateFacture",
    "nomEtablissement",
    "montantTotal"
] as const;

export type SaveColumnKey = (typeof SaveColumnKey)[number];