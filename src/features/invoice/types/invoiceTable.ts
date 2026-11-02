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
	moisPrestation: string;
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

export type FactureGlobaleTableProps = {
	rows: FactureGlobaleRow[];
	addRowId: number;
	containerRef: RefObject<HTMLDivElement | null>;
	addRowRef: RefObject<HTMLTableRowElement | null>;
	onCellChange: (
		rowId: number,
		key: FactureGlobaleColumnKey,
		value: string,
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
	retourPrestataire : "retourPrestataire",
	recuApresModification : "recuApresModification",
	dateEnregistrement : "dateEnregistrement",
	dateEnvoiValidation : "dateEnvoiValidation",
	dateValidation : "dateValidation"
} as const;
export type dateColumn = (typeof dateColumn) [keyof typeof dateColumn];

