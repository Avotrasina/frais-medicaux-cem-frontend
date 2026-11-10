import type {
	CibleSuiviResponseDto,
	PlafondsCibleSuiviResponseDto,
} from "../../../api/domains/suivi";
import {
	TypeContrainte,
	type CibleType,
	type DropdownOption,
} from "../types/dropDown";

type CibleSuiviPlafond = NonNullable<PlafondsCibleSuiviResponseDto["parAn"]>;

function toCibleType(type: CibleSuiviResponseDto["type"]): CibleType {
	return type === "ACTE" ? "acte" : "categorie";
}

function toTypeContrainte(
	modeleSuivi: CibleSuiviResponseDto["modeleSuivi"],
): TypeContrainte {
	switch (modeleSuivi) {
		case "PLAFOND_ANNUEL":
			return TypeContrainte.PAR_AN;
		case "PLAFOND_ACTE_ET_ANNUEL":
			return TypeContrainte.PAR_AN_PAR_ACTE;
		case "SEANCES":
			return TypeContrainte.PAR_SEANCE;
	}
}

function toNumber(value: string | number): number | undefined {
	const amount = Number(value);
	return Number.isFinite(amount) ? amount : undefined;
}

/** Only monetary ceilings are exposed as amounts. */
function toAmount(plafond: CibleSuiviPlafond | null): number | undefined {
	if (!plafond || plafond.unite !== "MONTANT") return undefined;
	return toNumber(plafond.valeur);
}

/** A session ceiling can be carried by either `parActe` or `parAn`. */
function toSeanceCount(
	plafonds: PlafondsCibleSuiviResponseDto,
): number | undefined {
	const plafond = plafonds.parActe?.unite === "SEANCES"
		? plafonds.parActe
		: plafonds.parAn?.unite === "SEANCES"
			? plafonds.parAn
			: null;
	return plafond ? toNumber(plafond.valeur) : undefined;
}

export function mapSuiviCible(cible: CibleSuiviResponseDto): DropdownOption {
	const option: DropdownOption = {
		id: cible.id,
		label: cible.nom,
		type: toCibleType(cible.type),
		typeContrainte: toTypeContrainte(cible.modeleSuivi),
		code: cible.code,
		categorieActeId: cible.categorieActeId,
		categorieActe: cible.categorieActe,
	};

	switch (cible.modeleSuivi) {
		case "PLAFOND_ANNUEL":
			option.plafondParAn = toAmount(cible.plafonds.parAn);
			break;
		case "PLAFOND_ACTE_ET_ANNUEL":
			option.plafondParAn = toAmount(cible.plafonds.parAn);
			option.plafondParActe = toAmount(cible.plafonds.parActe);
			break;
		case "SEANCES":
			option.nombreSeance = toSeanceCount(cible.plafonds);
			break;
	}

	return option;
}

export function mapSuiviCibles(
	cibles: CibleSuiviResponseDto[],
): DropdownOption[] {
	return cibles
		.map(mapSuiviCible)
		.sort((a, b) => {
			if (a.type !== b.type) return a.type === "categorie" ? -1 : 1;
			return a.label.localeCompare(b.label, "fr");
		});
}
