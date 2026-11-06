import type { FactureGlobaleColumn, FactureGlobaleColumnKey } from "../types/invoiceTable";
import type { T5ParAnColumn } from "../types/t5ParAn";
import type { T5ParAnParActeColumn } from "../types/t5ParAnParActe";
import type { T5ParSeanceColumn } from "../types/t5ParSeance";

export const factureGlobaleColumns: FactureGlobaleColumn[] = [
    { key: "refSocial", label: "Réf. Social", width: "w-28 min-w-28 max-w-28" },
    { key: "dateReception", label: "Date réception", width: "w-45 min-w-45" },
    { key: "numFacture", label: "Num facture", width: "w-36 min-w-36 " },
    { key: "dateFacture", label: "Date facture", width: "w-45 min-w-45" },
    { key: "nomEtablissement", label: "Nom de l'établissement", width: "w-80 min-w-80 max-w-80" },
    { key: "majT5", label: "Maj T5", width: "w-32 min-w-32 max-w-32" },
    { key: "montantTotal", label: "Montant total", width: "w-36 min-w-36 max-w-36" },
    { key: "partCem100", label: "100 % CEM", width: "w-32 min-w-32 max-w-32" },
    { key: "depassement", label: "Dépassement", width: "w-32 min-w-32 max-w-32" },
    { key: "partCem80", label: "80 % CEM", width: "w-32 min-w-32 max-w-32" },
    { key: "partAgent20", label: "20 % Agent", width: "w-32 min-w-32 max-w-32" },
    { key: "totalPartAgent", label: "Total part agent", width: "w-36 min-w-36 max-w-36" },
    { key: "localite", label: "Localité", width: "w-36 min-w-36 max-w-36" },
    { key: "moisPrestation", label: "Mois de la prestation", width: "w-36 min-w-36 max-w-36" },
    { key: "refAgence", label: "Réf. agence", width: "w-44 min-w-44 max-w-44" },
    { key: "remarques1", label: "Remarques 1", width: "w-48 min-w-48 max-w-48" },
    { key: "retourPrestataire", label: "Retour vers prestataire", width: "w-45 min-w-45 max-w-45" },
    { key: "recuApresModification", label: "Reçu après modification", width: "w-45 min-w-45 max-w-45" },
    { key: "dateEnregistrement", label: "Date enregistrement", width: "w-36 min-w-36" },
    { key: "parQuiEnregistrement", label: "Enregistré par", width: "w-32 min-w-32 max-w-32" },
    { key: "dateEnvoiValidation", label: "Date envoi pour validation", width: "w-40 min-w-40" },
    { key: "pourQuiValidation", label: "Pour qui", width: "w-32 min-w-32 max-w-32" },
    { key: "remarques2", label: "Remarques 2", width: "w-44 min-w-44 max-w-44" },
    { key: "retourCorrection", label: "Retour pour correction", width: "w-40 min-w-40 max-w-40" },
    { key: "dateValidation", label: "Date validation", width: "w-36 min-w-36" },
    { key: "parQuiValidationFinale", label: "Validé par", width: "w-32 min-w-32 max-w-32" },
    { key: "dateSortie", label: "Date sortie", width: "w-32 min-w-32" },
    { key: "serviceSortie", label: "Service de sortie", width: "w-32 min-w-32 max-w-32" },
];

export const personnelFactureGlobaleEditableColumns = [
    "refSocial", "dateReception", "numFacture", "dateFacture", "nomEtablissement", "majT5", "montantTotal", "partCem100", "depassement", "partCem80", "partAgent20", "totalPartAgent", "localite", "moisPrestation", "refAgence", "remarques1", "retourPrestataire", "recuApresModification",
] as const satisfies readonly FactureGlobaleColumnKey[];
export const t5ParAnColumns: T5ParAnColumn[] = [
	{ key: "refSocial", label: "Réf. social", width: "w-32 min-w-32 max-w-32" },
	{ key: "dateActe", label: "Date de l’acte", width: "w-40 min-w-40" },
	{ key: "libelle", label: "Libellé", width: "w-64 min-w-64 max-w-64" },
	{ key: "montantActe", label: "Montant de l’acte", width: "w-40 min-w-40 max-w-40" },
	{ key: "montantCumule", label: "Montant cumulé", width: "w-40 min-w-40 max-w-40" },
	{ key: "soldePlafond", label: "Solde plafond", width: "w-40 min-w-40 max-w-40" },
	{ key: "montantDepassement", label: "Montant dépassement", width: "w-44 min-w-44 max-w-44" },
	{ key: "nomEtablissement", label: "Nom établissement", width: "w-64 min-w-64 max-w-64" },
];

export const t5ParAnParActeColumns: T5ParAnParActeColumn[] = [
	{ key: "refSocial", label: "Réf. social", width: "w-32 min-w-32 max-w-32" },
	{ key: "dateActe", label: "Date de l’acte", width: "w-40 min-w-40" },
	{ key: "libelle", label: "Libellé", width: "w-64 min-w-64 max-w-64" },
	{ key: "montantActe", label: "Montant de l’acte", width: "w-40 min-w-40 max-w-40" },
	{ key: "depassementActe", label: "Dépassement à l’acte", width: "w-44 min-w-44 max-w-44" },
	{ key: "cumulActeConsomme", label: "Cumul acte consommé", width: "w-44 min-w-44 max-w-44" },
	{ key: "soldePlafond", label: "Solde du plafond", width: "w-40 min-w-40 max-w-40" },
	{ key: "depassementPlafond", label: "Dépassement au plafond", width: "w-48 min-w-48 max-w-48" },
	{ key: "totalDepassement", label: "Total dépassement", width: "w-44 min-w-44 max-w-44" },
	{ key: "nomEtablissement", label: "Nom établissement", width: "w-64 min-w-64 max-w-64" },
];

export const t5ParSeanceColumns: T5ParSeanceColumn[] = [
	{ key: "refSocial", label: "Réf. social", width: "w-32 min-w-32 max-w-32" },
	{ key: "dateActe", label: "Date de l’acte", width: "w-40 min-w-40" },
	{ key: "libelle", label: "Libellé", width: "w-64 min-w-64 max-w-64" },
	{ key: "montantActe", label: "Montant de l’acte", width: "w-40 min-w-40 max-w-40" },
	{ key: "numeroSeance", label: "N° séance", width: "w-32 min-w-32 max-w-32" },
	{ key: "montantDepassement", label: "Montant dépassement", width: "w-44 min-w-44 max-w-44" },
	{ key: "nomEtablissement", label: "Nom établissement", width: "w-64 min-w-64 max-w-64" },
];
