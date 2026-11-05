import type {
	FactureGlobaleCreateInput,
	FactureGlobaleRow,
	FactureGlobaleUpdateChanges,
} from "../types/invoiceTable";


export const initialFactureGlobaleRowsMock: FactureGlobaleRow[] = [
	{
		id: 1,
		refSocial: "25/001",
		dateReception: "10/02/2026",
		numFacture: "1321/F/26",
		dateFacture: "01/02/2026",
		nomEtablissement: "CLINIQUE MEDICO-CHIRURGICALE SAINT PAUL",
		montantTotal: 6000000,
		partCem100: 4000000,
		depassement: 1000000,
		partCem80: 800000,
		partAgent20: 200000,
		totalPartAgent: 1200000,
		localite: "008 TULEAR",
		moisPrestation: new Date(Date.UTC(2026, 0, 1)),
		refAgence: "FRM-60-008-1224-PR03",
		remarques1: "Tsy ampy ordonnance",
		retourPrestataire: "15/02/26 ; 25/02/26",
		recuApresModification: "20/02/26 ; 27/02/26",
		dateEnregistrement: "14/02/2026",
		parQuiEnregistrement: "Rakoto",
		dateEnvoiValidation: "28/02/2026",
		pourQuiValidation: "Chef",
		remarques2: "",
		retourCorrection: "",
		dateValidation: "01/03/2026",
		parQuiValidationFinale: "",
		dateSortie: "02/03/2026",
		serviceSortie: "SCTRL",
	},
	{
		id: 2,
		refSocial: "25/002",
		dateReception: "15/03/2026",
		numFacture: "HLA/FPC/24/199",
		dateFacture: "28/02/2024",
		nomEtablissement: "HOPITALY LOTERANA ANDRANOMADIO",
		montantTotal: 120000,
		partCem100: 0,
		depassement: 20000,
		partCem80: 80000,
		partAgent20: 20000,
		totalPartAgent: 40000,
		localite: "009 ANTSIRABE",
		moisPrestation: new Date(Date.UTC(2026, 1, 1)),
		refAgence: "",
		remarques1: "",
		retourPrestataire: "",
		recuApresModification: "",
		dateEnregistrement: "16/03/2026",
		parQuiEnregistrement: "Rakoto",
		dateEnvoiValidation: "17/03/2026",
		pourQuiValidation: "Adjoint",
		remarques2: "",
		retourCorrection: "",
		dateValidation: "16/03/2026",
		parQuiValidationFinale: "",
		dateSortie: "17/03/2026",
		serviceSortie: "SCTRL",
	},
	{
		id: 3,
		refSocial: "25/003",
		dateReception: "15/03/2026",
		numFacture: "CMA/26/03",
		dateFacture: "01/03/2026",
		nomEtablissement: "CARE MEDICAL",
		montantTotal: 400000,
		partCem100: 30000000,
		depassement: 0,
		partCem80: 8000000,
		partAgent20: 20000,
		totalPartAgent: 20000,
		localite: "ANTANANARIVO",
		moisPrestation: new Date(Date.UTC(2026, 1, 1)),
		refAgence: "",
		remarques1: "",
		retourPrestataire: "",
		recuApresModification: "",
		dateEnregistrement: "16/03/2026",
		parQuiEnregistrement: "Rasoa",
		dateEnvoiValidation: "",
		pourQuiValidation: "",
		remarques2: "Diso calcul",
		retourCorrection: "",
		dateValidation: "17/03/2026",
		parQuiValidationFinale: "",
		dateSortie: "18/03/2026",
		serviceSortie: "SAUT",
	},

];

const formatMockDate = (date: Date) =>
	`${String(date.getDate()).padStart(2, "0")}/${String(date.getMonth() + 1).padStart(2, "0")}/${date.getFullYear()}`;

function createInitialRows(): FactureGlobaleRow[] {
	const rows = Array.from({ length: 60 }, (_, index) => {
		const template = initialFactureGlobaleRowsMock[index % initialFactureGlobaleRowsMock.length];
		const receptionDate = new Date(2026, 0, 5 + index * 2);
		return {
			...template,
			id: index + 1,
			refSocial: index < initialFactureGlobaleRowsMock.length
				? template.refSocial
				: `26/${String(index + 1).padStart(3, "0")}`,
			dateReception: formatMockDate(receptionDate),
			numFacture: `${template.numFacture}-${String(index + 1).padStart(3, "0")}`,
		};
	});

	return rows.sort((a, b) => {
		const [dayA, monthA, yearA] = a.dateReception.split("/").map(Number);
		const [dayB, monthB, yearB] = b.dateReception.split("/").map(Number);
		return new Date(yearA, monthA - 1, dayA).getTime() - new Date(yearB, monthB - 1, dayB).getTime();
	});
}

let factureGlobaleRows: FactureGlobaleRow[] | null = null;

function getFactureGlobaleRows(): FactureGlobaleRow[] {
	factureGlobaleRows ??= createInitialRows();
	return factureGlobaleRows;
}

function cloneFactureGlobaleRow(row: FactureGlobaleRow): FactureGlobaleRow {
	return { ...row, moisPrestation: row.moisPrestation ? new Date(row.moisPrestation) : null };
}

export async function fetchFactureGlobaleMock(): Promise<FactureGlobaleRow[]> {
	await new Promise((resolve) => setTimeout(resolve, 2000));
	return getFactureGlobaleRows().map(cloneFactureGlobaleRow);
}

export async function createFactureGlobaleMock(
	input: FactureGlobaleCreateInput,
): Promise<FactureGlobaleRow> {
	await Promise.resolve();
	const rows = getFactureGlobaleRows();
	const id = Math.max(0, ...rows.map((row) => row.id)) + 1;
	const createdRow: FactureGlobaleRow = {
		id,
		refSocial: `26/${String(id).padStart(3, "0")}`,
		dateReception: input.dateReception,
		numFacture: input.numFacture,
		dateFacture: input.dateFacture,
		nomEtablissement: input.nomEtablissement,
		montantTotal: input.montantTotal,
		partCem100: 0,
		depassement: 0,
		partCem80: 0,
		partAgent20: 0,
		totalPartAgent: 0,
		localite: "",
		moisPrestation: null,
		refAgence: "",
		remarques1: "",
		retourPrestataire: "",
		recuApresModification: "",
		dateEnregistrement: "",
		parQuiEnregistrement: "",
		dateEnvoiValidation: "",
		pourQuiValidation: "",
		remarques2: "",
		retourCorrection: "",
		dateValidation: "",
		parQuiValidationFinale: "",
		dateSortie: "",
		serviceSortie: "",
	};
	factureGlobaleRows = [...rows, createdRow];
	return cloneFactureGlobaleRow(createdRow);
}

export async function modifyFactureGlobaleMock(
	refSocial: string,
	changes: FactureGlobaleUpdateChanges,
): Promise<FactureGlobaleRow> {
	await Promise.resolve();
	const rows = getFactureGlobaleRows();
	const rowIndex = rows.findIndex((row) => row.refSocial === refSocial);
	if (rowIndex === -1) {
		throw new Error(`Aucune facture trouvée pour la référence sociale ${refSocial}.`);
	}
	const updatedRow = { ...rows[rowIndex], ...changes };
	factureGlobaleRows = rows.map((row, index) => index === rowIndex ? updatedRow : row);
	return cloneFactureGlobaleRow(updatedRow);
}
