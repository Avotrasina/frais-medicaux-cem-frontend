import type { UpdateFactureBody } from "./serviceAPI";
import type { FactureGlobaleUpdateChanges } from "../types/invoiceTable";

function toApiDate(value: string, field: string): string {
	const match = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(value.trim());
	if (!match) {
		throw new Error(
			`La date « ${field} » est invalide (format attendu : jj/mm/aaaa).`,
		);
	}
	return `${match[3]}-${match[2]}-${match[1]}`;
}

export function mapFactureGlobaleUpdate(
	changes: FactureGlobaleUpdateChanges,
): UpdateFactureBody | null {
	const body: UpdateFactureBody = {};

	if (changes.prestataireId !== undefined && changes.prestataireId !== null) {
		body.prestataireId = changes.prestataireId;
	}
	if (changes.numFacture !== undefined) {
		body.numFacture = changes.numFacture;
	}
	if (changes.dateFacture !== undefined) {
		body.dateFacture = toApiDate(changes.dateFacture, "date de facture");
	}
	if (changes.dateReception !== undefined) {
		body.dateReception = toApiDate(changes.dateReception, "date de réception");
	}
	if (changes.moisPrestation !== undefined && changes.moisPrestation !== null) {
		body.moisPrestation = changes.moisPrestation.toISOString().slice(0, 10);
	}
	if (changes.refAgence !== undefined) {
		body.refAgence = changes.refAgence;
	}
	if (changes.remarques1 !== undefined) {
		body.remarque = changes.remarques1;
	}
	if (changes.montantTotal !== undefined) {
		body.montantTotal = changes.montantTotal;
	}
	if (changes.partCem100 !== undefined) {
		body.total100Cem = changes.partCem100;
	}
	if (changes.depassement !== undefined) {
		body.totalDepassement = changes.depassement;
	}

	return Object.keys(body).length > 0 ? body : null;
}
