import type { T5XConstraintRow, T5XConstraintType, T5XRegime, T5XTypeRow } from "../types/t5xType";

export function regimeFromConstraintType(type: T5XConstraintType | ""): T5XRegime {
	if (type === "EXCLU") return "EXCLU";
	if (type === "SUR_DECISION_DG") return "SUR_DECISION_DG";
	return "NORMAL";
}

export function createEmptyCategoryRow(id: number): T5XTypeRow {
	return { id, nom: "", typeContrainte: "", plafondActe: null, plafondAn: null, nombreSeances: null };
}

export function createEmptyActRow(id: number): T5XConstraintRow {
	return {
		id, code: "", nom: "", listeLibelle: "", categorieId: 0, nomCategorie: "",
		typeContrainte: "", regime: "NORMAL", plafondActe: null, plafondAn: null, nombreSeances: null,
		contraintePropre: false,
	};
}

export function hasT5XRowData(row: T5XTypeRow | T5XConstraintRow) {
	return Object.entries(row).some(([key, value]) => {
		if (key === "id" || key === "typeContrainte" || key === "regime") return false;
		if (typeof value === "string") return value.trim() !== "";
		return typeof value === "number" && value !== 0;
	});
}

export function applyT5XConstraintType<T extends {
	typeContrainte: T5XConstraintType | "";
	plafondActe: number | null;
	plafondAn: number | null;
	nombreSeances: number | null;
}>(row: T, typeContrainte: T5XConstraintType | ""): T {
	return {
		...row,
		typeContrainte,
		plafondActe: typeContrainte === "PAR_ACTE" || typeContrainte === "PAR_AN_PAR_ACTE" ? 0 : null,
		plafondAn: typeContrainte === "PAR_AN" || typeContrainte === "PAR_AN_PAR_ACTE" ? 0 : null,
		nombreSeances: typeContrainte === "PAR_SEANCE" ? 0 : null,
	};
}

export function applyT5XActConstraintType(
	row: T5XConstraintRow,
	typeContrainte: T5XConstraintType | "",
): T5XConstraintRow {
	return {
		...applyT5XConstraintType(row, typeContrainte),
		regime: regimeFromConstraintType(typeContrainte),
	};
}
