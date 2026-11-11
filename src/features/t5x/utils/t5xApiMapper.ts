import type { CategorieActeAvecPlafondsResponseDto } from "../../../api/domains/categorie-acte";
import type { ActeAvecPlafondsResponseDto } from "../../../api/domains/shared/components";
import type { ActeListResponse, CreateActeInput } from "../../../services/acte-api";
import type {
	CategorieListResponse,
	CreateCategorieBody,
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
): T5XConstraintRow {
	if (isActeWithPlafonds(acte)) return mapActeToRow(acte, nomCategorie);
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
		return mapActeToRow(created, row.nomCategorie);
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

export function toCreateActeInput(row: T5XConstraintRow): CreateActeInput {
	const code = row.code.trim();
	const nomActe = row.nom.trim();
	const listeLibelle = row.listeLibelle.trim();
	if (!code || !nomActe || !listeLibelle) {
		throw new Error("Code, nom et liste libellé sont requis.");
	}
	if (!row.categorieId) {
		throw new Error("La catégorie est requise.");
	}
	const plafonds = toPlafondsCreation(row);
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

export function toCreateCategorieInput(row: T5XTypeRow): CreateCategorieBody {
	const nomCategorie = row.nom.trim();
	if (!nomCategorie) {
		throw new Error("Le nom de la catégorie est requis.");
	}
	const plafonds = toPlafondsCreation(row);
	return { nomCategorie, ...(plafonds ? { plafonds } : {}) };
}
