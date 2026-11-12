import type { RefObject } from "react";

export const T5X_CONSTRAINT_TYPES = [
	"PAR_AN",
	"PAR_ACTE",
	"PAR_SEANCE",
	"PAR_AN_PAR_ACTE",
	"SANS_CONTRAINTE",
] as const;

export const T5X_REGIME_TYPES = ["EXCLU", "SUR_DECISION_DG"] as const;

export const T5X_ACT_CONSTRAINT_TYPES = [
	...T5X_CONSTRAINT_TYPES,
	...T5X_REGIME_TYPES,
] as const;

export type T5XConstraintType = (typeof T5X_ACT_CONSTRAINT_TYPES)[number];

export type T5XRegime = "NORMAL" | (typeof T5X_REGIME_TYPES)[number];

export type T5XConstraintSource = "ACTE" | "CATEGORIE";

export type T5XTypeRow = {
	id: number;
	nom: string;
	typeContrainte: T5XConstraintType | "";
	plafondActe: number | null;
	plafondAn: number | null;
	nombreSeances: number | null;
};

export type T5XConstraintRow = {
	id: number;
	code: string;
	nom: string;
	listeLibelle: string;
	categorieId: number;
	nomCategorie: string;
	typeContrainte: T5XConstraintType | "";
	regime: T5XRegime;
	plafondActe: number | null;
	plafondAn: number | null;
	nombreSeances: number | null;

	contraintePropre: boolean;
};

export type T5XTypeEditableKey = "nom" | "typeContrainte" | "plafondActe" | "plafondAn" | "nombreSeances";

export type T5XConstraintEditableKey = Exclude<keyof T5XConstraintRow, "id" | "contraintePropre">;

export type T5XCategoryOption = {
	id: number;
	nom: string;
	typeContrainte: T5XConstraintType | "";
	plafondActe: number | null;
	plafondAn: number | null;
	nombreSeances: number | null;
};

export type T5XTypeTableProps = {
	rows: T5XTypeRow[];
	addRowId: number;
	activeRowId?: number | null;
	selectedRowId?: number | null;
	onRowSelect?: (rowId: number | null) => void;
	containerRef: RefObject<HTMLDivElement | null>;
	addRowRef: RefObject<HTMLTableRowElement | null>;
	onCellChange: (rowId: number, key: T5XTypeEditableKey, value: string | number | null) => void;
};

export type T5XConstraintTableProps = {
	rows: T5XConstraintRow[];
	categories: T5XCategoryOption[];
	addRowId: number;
	activeRowId?: number | null;
	selectedRowId?: number | null;
	onRowSelect?: (rowId: number | null) => void;
	containerRef: RefObject<HTMLDivElement | null>;
	addRowRef: RefObject<HTMLTableRowElement | null>;
	onCellChange: (rowId: number, key: T5XConstraintEditableKey, value: string | number | null) => void;
};

export type T5XColumn<Key extends string = string> = {
	key: Key;
	label: string;
	width: string;
	filterMode?: "text" | "constraint" | "category";
};
