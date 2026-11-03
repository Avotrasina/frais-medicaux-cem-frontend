import type { T5XConstraintRow, T5XConstraintType, T5XTypeRow } from "../types/t5xType";

export function createEmptyCategoryRow(id: number): T5XTypeRow {
	return { id, nom: "", typeContrainte: "", plafondActe: null, plafondAn: null, nombreSeances: null };
}

export function createEmptyActRow(id: number): T5XConstraintRow {
	return {
		id, code: "", nom: "", libelle: "", categorieId: 0, nomCategorie: "",
		typeContrainte: "", plafondActe: null, plafondAn: null, nombreSeances: null,
	};
}

export function hasT5XRowData(row: T5XTypeRow | T5XConstraintRow) {
	return Object.entries(row).some(([key, value]) => {
		if (key === "id" || key === "typeContrainte") return false;
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
