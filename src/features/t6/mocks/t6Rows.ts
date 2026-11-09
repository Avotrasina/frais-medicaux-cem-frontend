import type { T6Row } from "../types/t6Row";

const initialRows: T6Row[] = [
	{
		id: 1,
		moisAffectation: new Date(Date.UTC(2026, 2, 1)),
		refPaie: "001/FM/JANV/26",
		dateSaisie: "04/03/2026",
		refSocial: "F26/001",
		numFacture: "1321/F/26",
		dateFacture: "31/01/2026",
		nomEtablissement: "CLINIQUE MEDICO-CHIRURGICALE SAINT PAUL",
		idp: "342AGT01",
		nomBeneficiaire: "TIANA BARIOELINA",
		prenomBeneficiaire: "Rajaonarison Rija",
		codeFamille: "Agent",
		obsIdp: "",
		im: "342",
		nomAgent: "TIANA BARIOELINA",
		prenomAgent: "Rajaonarison Rija",
		direction: "Agence",
		serviceAgence: "CEM - WU 049 ANTSAKAVIRO",
		code: "CON-01",
		actePrestation: "Consultation généraliste",
		categorie: "01 – CONSULTATIONS MÉDICALES",
		dateActe: "30/01/2026",
		numPec: "2026 / 0025",
		montantTotal: 30000,
		partCem100: 0,
		depassement: 0,
		obsDepassement: "",
		partCem80: 24000,
		partAgent20: 6000,
		totalChargeAgent: 6000,
	},
	{
		id: 2,
		moisAffectation: new Date(Date.UTC(2026, 2, 1)),
		refPaie: "001/FM/JANV/26",
		dateSaisie: "04/03/2026",
		refSocial: "F26/001",
		numFacture: "1321/F/26",
		dateFacture: "31/01/2026",
		nomEtablissement: "CLINIQUE MEDICO-CHIRURGICALE SAINT PAUL",
		idp: "342CJT01",
		nomBeneficiaire: "RAKOTOMALALA",
		prenomBeneficiaire: "Nambinina Hanta Joelson Felana",
		codeFamille: "Conjoint",
		obsIdp: "",
		im: "342",
		nomAgent: "TIANA BARIOELINA",
		prenomAgent: "Rajaonarison Rija",
		direction: "Agence",
		serviceAgence: "CEM - WU 049 ANTSAKAVIRO",
		code: "HOS-01",
		actePrestation: "Hospitalisation médicale",
		categorie: "13 – HOSPITALISATION ET URGENCES",
		dateActe: "11/01/2026",
		numPec: "2026 / 0007",
		montantTotal: 4000000,
		partCem100: 4000000,
		depassement: 0,
		obsDepassement: "",
		partCem80: 0,
		partAgent20: 0,
		totalChargeAgent: 0,
	},
	{
		id: 3,
		moisAffectation: new Date(Date.UTC(2026, 2, 1)),
		refPaie: "001/FM/JANV/26",
		dateSaisie: "04/03/2026",
		refSocial: "F26/001",
		numFacture: "1321/F/26",
		dateFacture: "31/01/2026",
		nomEtablissement: "CLINIQUE MEDICO-CHIRURGICALE SAINT PAUL",
		idp: "342EFT01",
		nomBeneficiaire: "TIANA BARIOELINA",
		prenomBeneficiaire: "Tiah Richard Antonio",
		codeFamille: "Enfant",
		obsIdp: "",
		im: "342",
		nomAgent: "TIANA BARIOELINA",
		prenomAgent: "Rajaonarison Rija",
		direction: "Agence",
		serviceAgence: "CEM - WU 049 ANTSAKAVIRO",
		code: "PHA-02",
		actePrestation: "Médicaments non prescrits",
		categorie: "02 – SOINS INFIRMIERS ET ACTES MÉDICAUX",
		dateActe: "14/01/2026",
		numPec: "2026 / 0016",
		montantTotal: 1970000,
		partCem100: 0,
		depassement: 1000000,
		obsDepassement: "",
		partCem80: 776000,
		partAgent20: 194000,
		totalChargeAgent: 1194000,
	},
];

let rows = initialRows;

function cloneRow(row: T6Row): T6Row {
	return { ...row, moisAffectation: row.moisAffectation ? new Date(row.moisAffectation) : null };
}

export async function fetchT6RowsMock(): Promise<T6Row[]> {
	await new Promise((resolve) => setTimeout(resolve, 900));
	return rows.map(cloneRow);
}

async function fetchMatchingRow(
	key: "refSocial" | "idp" | "code",
	value: string,
): Promise<T6Row | undefined> {
	await new Promise((resolve) => setTimeout(resolve, 650));
	const normalizedValue = value.trim().toLocaleLowerCase();
	const match = initialRows.find((row) => row[key].trim().toLocaleLowerCase() === normalizedValue);
	return match ? cloneRow(match) : undefined;
}

export function fetchT6ByRefSocialMock(refSocial: string): Promise<T6Row | undefined> {
	return fetchMatchingRow("refSocial", refSocial);
}

export function fetchT6ByIdpMock(idp: string): Promise<T6Row | undefined> {
	return fetchMatchingRow("idp", idp);
}

export function fetchT6ByCodeMock(code: string): Promise<T6Row | undefined> {
	return fetchMatchingRow("code", code);
}

export async function createT6RowMock(row: T6Row): Promise<T6Row> {
	await Promise.resolve();
	const id = Math.max(0, ...rows.map((item) => item.id)) + 1;
	const createdRow = { ...row, id };
	rows = [...rows, createdRow];
	return cloneRow(createdRow);
}

export async function updateT6RowMock(id: number, row: T6Row): Promise<T6Row> {
	await Promise.resolve();
	const existing = rows.find((row) => row.id === id);
	if (!existing) throw new Error(`Aucune retenue T6 trouvée pour la ligne ${id}.`);
	const updatedRow = { ...existing, ...row, id };
	rows = rows.map((row) => row.id === id ? updatedRow : row);
	return cloneRow(updatedRow);
}
