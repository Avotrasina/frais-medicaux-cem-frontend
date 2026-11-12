import type { PlafondListResponse } from "../../../services/plafond-api";

type PlafondRow = PlafondListResponse[number];

export type T5XPlafondIndex = {
	parActe: Map<number, PlafondRow[]>;
	parCategorie: Map<number, PlafondRow[]>;
};

function estOuvert(plafond: PlafondRow): boolean {
	return plafond.dateFin === null;
}

export function buildT5XPlafondIndex(
	plafonds: PlafondListResponse,
): T5XPlafondIndex {
	const parActe = new Map<number, PlafondRow[]>();
	const parCategorie = new Map<number, PlafondRow[]>();
	for (const plafond of plafonds) {
		if (!estOuvert(plafond)) continue;
		if (typeof plafond.acteID === "number") {
			const liste = parActe.get(plafond.acteID) ?? [];
			liste.push(plafond);
			parActe.set(plafond.acteID, liste);
			continue;
		}
		if (typeof plafond.categorieActeID === "number") {
			const liste = parCategorie.get(plafond.categorieActeID) ?? [];
			liste.push(plafond);
			parCategorie.set(plafond.categorieActeID, liste);
		}
	}
	return { parActe, parCategorie };
}

/** Vrai lorsque l'acte porte au moins un plafond ouvert. */
export function acteHasOwnConstraint(
	index: T5XPlafondIndex,
	acteId: number,
): boolean {
	return (index.parActe.get(acteId)?.length ?? 0) > 0;
}

/** Vrai lorsque la catégorie porte au moins un plafond ouvert. */
export function categorieHasOwnConstraint(
	index: T5XPlafondIndex,
	categorieId: number,
): boolean {
	return (index.parCategorie.get(categorieId)?.length ?? 0) > 0;
}
