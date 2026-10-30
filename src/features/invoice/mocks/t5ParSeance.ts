import type { T5ParSeanceRow } from "../types/t5ParSeance";

export const initialT5ParSeanceRowsMock: T5ParSeanceRow[] = [
	{
		id: 1,
		refSocial: "25/001",
		dateActe: "2026-01-15",
		libelle: "Consultation médicale",
		montantActe: 150000,
		numeroSeance: "1",
		montantDepassement: 0,
		nomEtablissement: "CLINIQUE MEDICO-CHIRURGICALE SAINT PAUL",
	},
	{
		id: 2,
		refSocial: "25/002",
		dateActe: "2026-03-15",
		libelle: "Séance de kinésithérapie",
		montantActe: 85000,
		numeroSeance: "2",
		montantDepassement: 5000,
		nomEtablissement: "HOPITALY LOTERANA ANDRANOMADIO",
	},
	{
		id: 3,
		refSocial: "25/003",
		dateActe: "2026-05-02",
		libelle: "Examen médical",
		montantActe: 220000,
		numeroSeance: "3",
		montantDepassement: 0,
		nomEtablissement: "CARE MEDICAL",
	},
];
