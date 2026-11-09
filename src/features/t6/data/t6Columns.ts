import type { T6ColumnKey, T6EditableKey } from "../types/t6Row";

export type T6Column = {
	key: T6ColumnKey;
	label: string;
	width: string;
};

export const t6Columns: T6Column[] = [
	{ key: "moisAffectation", label: "Mois d’affectation", width: "w-44 min-w-44 max-w-44" },
	{ key: "refPaie", label: "Réf. paie", width: "w-44 min-w-44 max-w-44" },
	{ key: "dateSaisie", label: "Date saisie", width: "w-48 min-w-48 max-w-48" },
	{ key: "refSocial", label: "Réf. social", width: "w-36 min-w-36 max-w-36" },
	{ key: "numFacture", label: "Num facture", width: "w-40 min-w-40 max-w-40" },
	{ key: "dateFacture", label: "Date facture", width: "w-36 min-w-36 max-w-36" },
	{ key: "nomEtablissement", label: "Nom de l’établissement", width: "w-80 min-w-80 max-w-80" },
	{ key: "idp", label: "IDP", width: "w-36 min-w-36 max-w-36" },
	{ key: "nomBeneficiaire", label: "Nom bénéficiaire", width: "w-48 min-w-48 max-w-48" },
	{ key: "prenomBeneficiaire", label: "Prénom bénéficiaire", width: "w-56 min-w-56 max-w-56" },
	{ key: "codeFamille", label: "Code famille", width: "w-32 min-w-32 max-w-32" },
	{ key: "obsIdp", label: "Obs. IDP", width: "w-40 min-w-40 max-w-40" },
	{ key: "im", label: "IM", width: "w-28 min-w-28 max-w-28" },
	{ key: "nomAgent", label: "Nom agent", width: "w-48 min-w-48 max-w-48" },
	{ key: "prenomAgent", label: "Prénom agent", width: "w-56 min-w-56 max-w-56" },
	{ key: "direction", label: "Direction", width: "w-36 min-w-36 max-w-36" },
	{ key: "serviceAgence", label: "Service / Agence", width: "w-64 min-w-64 max-w-64" },
	{ key: "code", label: "Code", width: "w-32 min-w-32 max-w-32" },
	{ key: "actePrestation", label: "Acte / Prestation", width: "w-64 min-w-64 max-w-64" },
	{ key: "categorie", label: "Catégorie", width: "w-64 min-w-64 max-w-64" },
	{ key: "dateActe", label: "Date de l’acte", width: "w-40 min-w-40 max-w-40" },
	{ key: "numPec", label: "Num PEC", width: "w-40 min-w-40 max-w-40" },
	{ key: "montantTotal", label: "Montant total", width: "w-40 min-w-40 max-w-40" },
	{ key: "partCem100", label: "100 % CEM", width: "w-36 min-w-36 max-w-36" },
	{ key: "depassement", label: "Dépassement", width: "w-36 min-w-36 max-w-36" },
	{ key: "obsDepassement", label: "Obs. dépassement", width: "w-44 min-w-44 max-w-44" },
	{ key: "partCem80", label: "80 % CEM", width: "w-36 min-w-36 max-w-36" },
	{ key: "partAgent20", label: "20 % Agent", width: "w-36 min-w-36 max-w-36" },
	{ key: "totalChargeAgent", label: "Total à la charge de l’agent", width: "w-52 min-w-52 max-w-52" },
];

export const t6EditableKeys = [
	"moisAffectation",
	"refPaie",
	"dateSaisie",
	"refSocial",
	"idp",
	"code",
	"dateActe",
	"numPec",
	"montantTotal",
	"partCem100",
	"depassement",
	"partCem80",
	"partAgent20",
	"totalChargeAgent",
] as const satisfies readonly T6EditableKey[];

export const t6NumberKeys = new Set<T6ColumnKey>([
	"montantTotal",
	"partCem100",
	"depassement",
	"partCem80",
	"partAgent20",
	"totalChargeAgent",
]);
