import type {
	T5XCategoryOption,
	T5XConstraintRow,
	T5XConstraintSource,
	T5XConstraintType,
	T5XTypeRow,
} from "../types/t5xType";

export type T5XContrainteInfo = {
	typeContrainte: T5XConstraintType | "";
	plafondActe: number | null;
	plafondAn: number | null;
	nombreSeances: number | null;
};

export type T5XContrainteEffective = {
	type: T5XConstraintType;
	plafondActe: number | null;
	plafondAn: number | null;
	nombreSeances: number | null;
	source: T5XConstraintSource | null;
	verrouillee: boolean;
};

export function toT5XContrainteInfo(
	source: T5XContrainteInfo | T5XTypeRow | T5XCategoryOption | null | undefined,
): T5XContrainteInfo | null {
	if (!source) return null;
	return {
		typeContrainte: source.typeContrainte,
		plafondActe: source.plafondActe,
		plafondAn: source.plafondAn,
		nombreSeances: source.nombreSeances,
	};
}

export function hasCategoryConstraint(
	category: T5XContrainteInfo | T5XTypeRow | T5XCategoryOption | null | undefined,
): boolean {
	const info = toT5XContrainteInfo(category);
	if (!info) return false;
	return info.typeContrainte !== "" && info.typeContrainte !== "SANS_CONTRAINTE";
}


export function isConstraintLocked(
	_acte: T5XConstraintRow,
	category: T5XContrainteInfo | T5XTypeRow | T5XCategoryOption | null | undefined,
): boolean {
	return hasCategoryConstraint(category);
}


export function getEffectiveConstraint(
	acte: T5XConstraintRow,
	category: T5XContrainteInfo | T5XTypeRow | T5XCategoryOption | null | undefined,
): T5XContrainteEffective {
	const info = toT5XContrainteInfo(category);
	if (info && isConstraintLocked(acte, info)) {
		return {
			type: (info.typeContrainte || "SANS_CONTRAINTE") as T5XConstraintType,
			plafondActe: info.plafondActe,
			plafondAn: info.plafondAn,
			nombreSeances: info.nombreSeances,
			source: "CATEGORIE",
			verrouillee: true,
		};
	}
	const type = (acte.typeContrainte || "SANS_CONTRAINTE") as T5XConstraintType;
	return {
		type,
		plafondActe: acte.plafondActe,
		plafondAn: acte.plafondAn,
		nombreSeances: acte.nombreSeances,
		source: type === "SANS_CONTRAINTE" ? null : "ACTE",
		verrouillee: false,
	};
}


export function hasConflictingConstraint(
	acte: T5XConstraintRow,
	category: T5XContrainteInfo | T5XTypeRow | T5XCategoryOption | null | undefined,
): boolean {
	return isConstraintLocked(acte, category) && acte.contraintePropre;
}
