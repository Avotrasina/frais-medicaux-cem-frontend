import type { T5ParAnRow } from "../types/t5ParAn";

export const initialT5ParAnRowsMock: T5ParAnRow[] = [
	{
		id: 1,
		refSocial: "25/001",
		dateActe: "2026-01-15",
		libelle: "Consultation médicale",
		montantActe: 150000,
		montantCumule: 150000,
		soldePlafond: 9850000,
		montantDepassement: 0,
		nomEtablissement: "CLINIQUE MEDICO-CHIRURGICALE SAINT PAUL",
	},
	{
		id: 2,
		refSocial: "25/002",
		dateActe: "2026-03-15",
		libelle: "Examens biologiques",
		montantActe: 320000,
		montantCumule: 470000,
		soldePlafond: 9530000,
		montantDepassement: 0,
		nomEtablissement: "HOPITALY LOTERANA ANDRANOMADIO",
	},
	{
		id: 3,
		refSocial: "25/003",
		dateActe: "2026-05-02",
		libelle: "Hospitalisation",
		montantActe: 980000,
		montantCumule: 1450000,
		soldePlafond: 8550000,
		montantDepassement: 0,
		nomEtablissement: "CARE MEDICAL",
	},
];
