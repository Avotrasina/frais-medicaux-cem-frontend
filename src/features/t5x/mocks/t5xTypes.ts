import type { T5XConstraintRow, T5XTypeRow } from "../types/t5xType";

export const initialT5XTable1Mock: T5XTypeRow[] = [
	{ id: 1, nom: "Analyse", typeContrainte: "PAR_AN", plafondActe: null, plafondAn: 10_000_000, nombreSeances: null },
	{ id: 2, nom: "Chirurgie", typeContrainte: "PAR_AN_PAR_ACTE", plafondActe: 5_000_000, plafondAn: 10_000_000, nombreSeances: null },
	{ id: 3, nom: "Consultation", typeContrainte: "PAR_ACTE", plafondActe: 1_000_000, plafondAn: null, nombreSeances: null },
	{ id: 4, nom: "Kinésithérapie", typeContrainte: "PAR_SEANCE", plafondActe: null, plafondAn: null, nombreSeances: 12 },
	{ id: 5, nom: "Soins sans contrainte", typeContrainte: "SANS_CONTRAINTE", plafondActe: null, plafondAn: null, nombreSeances: null },
];

const act = (row: Omit<T5XConstraintRow, "regime" | "contraintePropre">): T5XConstraintRow => ({ ...row, regime: "NORMAL", contraintePropre: false });

export const initialT5XTable2Mock: T5XConstraintRow[] = [
	act({ id: 1, code: "AN-001", nom: "Analyse sanguine", listeLibelle: "Bilan sanguin complet", categorieId: 1, nomCategorie: "Laboratoire", typeContrainte: "PAR_AN", plafondActe: null, plafondAn: 2_000_000, nombreSeances: null }),
	act({ id: 2, code: "AN-002", nom: "Analyse urinaire", listeLibelle: "Examen cytobactériologique", categorieId: 1, nomCategorie: "Laboratoire", typeContrainte: "PAR_AN", plafondActe: null, plafondAn: 750_000, nombreSeances: null }),
	act({ id: 3, code: "CH-001", nom: "Chirurgie générale", listeLibelle: "Intervention chirurgicale", categorieId: 2, nomCategorie: "Chirurgie", typeContrainte: "PAR_AN_PAR_ACTE", plafondActe: 4_000_000, plafondAn: 8_000_000, nombreSeances: null }),
	act({ id: 4, code: "CO-001", nom: "Consultation spécialiste", listeLibelle: "Consultation médicale spécialisée", categorieId: 3, nomCategorie: "Consultation", typeContrainte: "PAR_ACTE", plafondActe: 120_000, plafondAn: null, nombreSeances: null }),
	act({ id: 5, code: "KI-001", nom: "Séance de kinésithérapie", listeLibelle: "Rééducation fonctionnelle", categorieId: 4, nomCategorie: "Kinésithérapie", typeContrainte: "PAR_SEANCE", plafondActe: null, plafondAn: null, nombreSeances: 12 }),
	act({ id: 6, code: "SO-001", nom: "Soins infirmiers", listeLibelle: "Soins à domicile", categorieId: 5, nomCategorie: "Soins", typeContrainte: "SANS_CONTRAINTE", plafondActe: null, plafondAn: null, nombreSeances: null }),
];

const mockDelay = () => new Promise((resolve) => setTimeout(resolve, 1200));

let t5xTable1Rows: T5XTypeRow[] | null = null;
let t5xTable2Rows: T5XConstraintRow[] | null = null;

function getT5XTable1Rows() {
	t5xTable1Rows ??= initialT5XTable1Mock.map((row) => ({ ...row }));
	return t5xTable1Rows;
}

function getT5XTable2Rows() {
	t5xTable2Rows ??= initialT5XTable2Mock.map((row) => ({ ...row }));
	return t5xTable2Rows;
}

export async function fetchT5XTable1Mock(): Promise<T5XTypeRow[]> {
	await mockDelay();
	return getT5XTable1Rows().map((row) => ({ ...row }));
}

export async function fetchT5XTable2Mock(): Promise<T5XConstraintRow[]> {
	await mockDelay();
	return getT5XTable2Rows().map((row) => ({ ...row }));
}

export async function createT5XCategoryMock(row: Omit<T5XTypeRow, "id">): Promise<T5XTypeRow> {
	await mockDelay();
	const rows = getT5XTable1Rows();
	const createdRow = { ...row, id: Math.max(0, ...rows.map((item) => item.id)) + 1 };
	t5xTable1Rows = [...rows, createdRow];
	return { ...createdRow };
}

export async function updateT5XCategoryMock(row: T5XTypeRow): Promise<T5XTypeRow> {
	await mockDelay();
	const rows = getT5XTable1Rows();
	if (!rows.some((item) => item.id === row.id)) {
		throw new Error(`Catégorie ${row.id} introuvable.`);
	}
	t5xTable1Rows = rows.map((item) => item.id === row.id ? { ...row } : item);
	return { ...row };
}

export async function createT5XActMock(row: Omit<T5XConstraintRow, "id">): Promise<T5XConstraintRow> {
	await mockDelay();
	const rows = getT5XTable2Rows();
	const createdRow = { ...row, id: Math.max(0, ...rows.map((item) => item.id)) + 1 };
	t5xTable2Rows = [...rows, createdRow];
	return { ...createdRow };
}

export async function updateT5XActMock(row: T5XConstraintRow): Promise<T5XConstraintRow> {
	await mockDelay();
	const rows = getT5XTable2Rows();
	if (!rows.some((item) => item.id === row.id)) {
		throw new Error(`Acte ${row.id} introuvable.`);
	}
	t5xTable2Rows = rows.map((item) => item.id === row.id ? { ...row } : item);
	return { ...row };
}
