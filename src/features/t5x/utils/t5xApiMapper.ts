import type { CategorieActeAvecPlafondsResponseDto } from "../../../api/domains/categorie-acte";
import type { ActeAvecPlafondsResponseDto } from "../../../api/domains/shared/components";
import type {
	ActeListResponse,
	CreateActeInput,
	UpdateActeInput,
} from "../../../services/acte-api";
import type {
	CategorieListResponse,
	CreateCategorieBody,
	UpdateCategorieInput,
} from "../../../services/categorie-acte-api";
import type {
	T5XConstraintRow,
	T5XConstraintType,
	T5XRegime,
	T5XTypeRow,
} from "../types/t5xType";

type PlafondsCreation = NonNullable<CreateActeInput["plafonds"]>;

type PlafondsResolus = {
	parActe: { valeur: string | number } | null;
	parAn: { unite: "MONTANT" | "SEANCES"; valeur: string | number } | null;
};

type ConstraintFields = Pick<
	T5XConstraintRow,
	"typeContrainte" | "plafondActe" | "plafondAn" | "nombreSeances"
>;

function toNumber(value: string | number): number {
	const parsed = typeof value === "number" ? value : Number(value);
	return Number.isFinite(parsed) ? parsed : 0;
}

function constraintFromPlafonds(
	plafonds: PlafondsResolus,
	regime: T5XRegime = "NORMAL",
): T5XConstraintType {
	if (regime === "EXCLU") return "EXCLU";
	if (regime === "SUR_DECISION_DG") return "SUR_DECISION_DG";
	if (plafonds.parActe && plafonds.parAn) return "PAR_AN_PAR_ACTE";
	if (plafonds.parActe) return "PAR_ACTE";
	if (plafonds.parAn?.unite === "SEANCES") return "PAR_SEANCE";
	if (plafonds.parAn) return "PAR_AN";
	return "SANS_CONTRAINTE";
}

function mapPlafonds(plafonds: PlafondsResolus, regime: T5XRegime = "NORMAL") {
	return {
		typeContrainte: constraintFromPlafonds(plafonds, regime),
		plafondActe: plafonds.parActe ? toNumber(plafonds.parActe.valeur) : null,
		plafondAn:
			plafonds.parAn?.unite === "MONTANT"
				? toNumber(plafonds.parAn.valeur)
				: null,
		nombreSeances:
			plafonds.parAn?.unite === "SEANCES"
				? toNumber(plafonds.parAn.valeur)
				: null,
	};
}

export function isActeWithPlafonds(
	acte: ActeListResponse[number],
): acte is ActeAvecPlafondsResponseDto {
	return "plafonds" in acte;
}

export function isCategorieWithPlafonds(
	categorie: CategorieListResponse[number],
): categorie is CategorieActeAvecPlafondsResponseDto {
	return "plafonds" in categorie && !("actes" in categorie);
}

export function mapActeToRow(
	acte: ActeAvecPlafondsResponseDto,
	nomCategorie: string,
	contraintePropre = false,
): T5XConstraintRow {
	return {
		id: acte.id,
		code: acte.code,
		nom: acte.nomActe,
		listeLibelle: acte.listeLibelle,
		categorieId: acte.categorieActeId,
		nomCategorie,
		regime: acte.regime,
		...mapPlafonds(acte.plafonds, acte.regime),
		contraintePropre,
	};
}

export function mapCategorieToRow(
	categorie: CategorieActeAvecPlafondsResponseDto,
): T5XTypeRow {
	return {
		id: categorie.id,
		nom: categorie.nomCategorie,
		...mapPlafonds(categorie.plafonds),
	};
}

export function mapActeListItem(
	acte: ActeListResponse[number],
	nomCategorie: string,
	contraintePropre = false,
): T5XConstraintRow {
	if (isActeWithPlafonds(acte)) return mapActeToRow(acte, nomCategorie, contraintePropre);
	return {
		id: acte.id,
		code: acte.code,
		nom: acte.nomActe,
		listeLibelle: acte.listeLibelle,
		categorieId: acte.categorieActeId,
		nomCategorie,
		typeContrainte: "SANS_CONTRAINTE",
		regime: acte.regime,
		plafondActe: null,
		plafondAn: null,
		nombreSeances: null,
		contraintePropre,
	};
}

export function mapCategorieListItem(
	categorie: CategorieListResponse[number],
): T5XTypeRow {
	if (isCategorieWithPlafonds(categorie)) return mapCategorieToRow(categorie);
	return {
		id: categorie.id,
		nom: categorie.nomCategorie,
		typeContrainte: "SANS_CONTRAINTE",
		plafondActe: null,
		plafondAn: null,
		nombreSeances: null,
	};
}

export function mapCreatedActe(
	created: ActeListResponse[number],
	row: T5XConstraintRow,
): T5XConstraintRow {
	if (isActeWithPlafonds(created)) {
		return mapActeToRow(created, row.nomCategorie, row.contraintePropre);
	}
	return {
		...row,
		id: created.id,
		code: created.code,
		nom: created.nomActe,
		listeLibelle: created.listeLibelle,
		regime: created.regime,
		categorieId: created.categorieActeId,
	};
}

export function mapCreatedCategorie(
	created: CategorieListResponse[number],
	row: T5XTypeRow,
): T5XTypeRow {
	if (isCategorieWithPlafonds(created)) {
		return mapCategorieToRow(created);
	}
	return { ...row, id: created.id, nom: created.nomCategorie };
}

function requireMontant(value: number | null, label: string): number {
	if (value === null || !Number.isFinite(value) || value <= 0) {
		throw new Error(`${label} doit être supérieur à 0.`);
	}
	return value;
}

function requireSeances(value: number | null): number {
	if (value === null || !Number.isInteger(value) || value <= 0) {
		throw new Error("Le nombre de séances doit être un entier supérieur à 0.");
	}
	return value;
}

export function toPlafondsCreation(
	row: ConstraintFields,
): PlafondsCreation | undefined {
	switch (row.typeContrainte) {
		case "PAR_ACTE":
			return {
				parActe: {
					montant: requireMontant(row.plafondActe, "Le plafond par acte"),
				},
			};
		case "PAR_AN":
			return {
				parAn: {
					unite: "MONTANT",
					montant: requireMontant(row.plafondAn, "Le plafond par an"),
				},
			};
		case "PAR_SEANCE":
			return {
				parAn: { unite: "SEANCES", nbSeances: requireSeances(row.nombreSeances) },
			};
		case "PAR_AN_PAR_ACTE":
			return {
				parActe: {
					montant: requireMontant(row.plafondActe, "Le plafond par acte"),
				},
				parAn: {
					unite: "MONTANT",
					montant: requireMontant(row.plafondAn, "Le plafond par an"),
				},
			};
		default:
			return undefined;
	}
}

/** Vrai lorsque la contrainte de la ligne diffère de celle de la ligne d'origine. */
export function constraintChanged(
	row: ConstraintFields,
	originalRow: ConstraintFields,
): boolean {
	return (
		row.typeContrainte !== originalRow.typeContrainte
		|| row.plafondActe !== originalRow.plafondActe
		|| row.plafondAn !== originalRow.plafondAn
		|| row.nombreSeances !== originalRow.nombreSeances
	);
}

export function toCreateActeInput(
	row: T5XConstraintRow,
	options: { contrainteVerrouillee?: boolean } = {},
): CreateActeInput {
	const code = row.code.trim();
	const nomActe = row.nom.trim();
	const listeLibelle = row.listeLibelle.trim();
	if (!code || !nomActe || !listeLibelle) {
		throw new Error("Code, nom et liste libellé sont requis.");
	}
	if (!row.categorieId) {
		throw new Error("La catégorie est requise.");
	}
	// Rule 1: the category carries a constraint, the act cannot create one.
	const plafonds = options.contrainteVerrouillee
		? undefined
		: toPlafondsCreation(row);
	return {
		type: "ACTE",
		code,
		nomActe,
		listeLibelle,
		regime: row.regime,
		categorieActeId: row.categorieId,
		...(plafonds ? { plafonds } : {}),
	};
}

export function toUpdateActeInput(
	row: T5XConstraintRow,
	originalRow: T5XConstraintRow,
	options: { contrainteVerrouillee?: boolean } = {},
): UpdateActeInput {
	const payload: UpdateActeInput = {
		code: row.code.trim(),
		nomActe: row.nom.trim(),
		listeLibelle: row.listeLibelle.trim(),
		regime: row.regime,
		categorieActeId: row.categorieId,
	};
	const modifiee = constraintChanged(row, originalRow);
	if (options.contrainteVerrouillee) {
		// Rule 1: the act inherits the category constraint, its own one is purged.
		if (modifiee || row.contraintePropre) payload.plafonds = null;
		return payload;
	}
	if (modifiee) {
		payload.plafonds = toPlafondsCreation(row) ?? null;
	}
	return payload;
}

export function toCreateCategorieInput(row: T5XTypeRow): CreateCategorieBody {
	const nomCategorie = row.nom.trim();
	if (!nomCategorie) {
		throw new Error("Le nom de la catégorie est requis.");
	}
	const plafonds = toPlafondsCreation(row);
	return { nomCategorie, ...(plafonds ? { plafonds } : {}) };
}

export function toUpdateCategorieInput(
	row: T5XTypeRow,
	originalRow: T5XTypeRow,
): UpdateCategorieInput {
	const payload: UpdateCategorieInput = { nomCategorie: row.nom.trim() };
	if (constraintChanged(row, originalRow)) {
		payload.plafonds = toPlafondsCreation(row) ?? null;
	}
	return payload;
}
