import type { T5XConstraintRow, T5XTypeRow } from "../types/t5xType";

export const initialT5XTable1Mock: T5XTypeRow[] = [
	{ id: 1, nom: "Analyse", typeContrainte: "PAR_AN", plafondActe: null, plafondAn: 10_000_000, nombreSeances: null },
	{ id: 2, nom: "Chirurgie", typeContrainte: "PAR_AN_PAR_ACTE", plafondActe: 5_000_000, plafondAn: 10_000_000, nombreSeances: null },
	{ id: 3, nom: "Consultation", typeContrainte: "PAR_ACTE", plafondActe: 1_000_000, plafondAn: null, nombreSeances: null },
	{ id: 4, nom: "Kinésithérapie", typeContrainte: "PAR_SEANCE", plafondActe: null, plafondAn: null, nombreSeances: 12 },
	{ id: 5, nom: "Soins sans contrainte", typeContrainte: "SANS_CONTRAINTE", plafondActe: null, plafondAn: null, nombreSeances: null },
];

export const initialT5XTable2Mock: T5XConstraintRow[] = [
	{ id: 1, code: "AN-001", nom: "Analyse sanguine", libelle: "Bilan sanguin complet", categorieId: 1, nomCategorie: "Laboratoire", typeContrainte: "PAR_AN", plafondActe: null, plafondAn: 2_000_000, nombreSeances: null },
	{ id: 2, code: "AN-002", nom: "Analyse urinaire", libelle: "Examen cytobactériologique", categorieId: 1, nomCategorie: "Laboratoire", typeContrainte: "PAR_AN", plafondActe: null, plafondAn: 750_000, nombreSeances: null },
	{ id: 3, code: "CH-001", nom: "Chirurgie générale", libelle: "Intervention chirurgicale", categorieId: 2, nomCategorie: "Chirurgie", typeContrainte: "PAR_AN_PAR_ACTE", plafondActe: 4_000_000, plafondAn: 8_000_000, nombreSeances: null },
	{ id: 4, code: "CO-001", nom: "Consultation spécialiste", libelle: "Consultation médicale spécialisée", categorieId: 3, nomCategorie: "Consultation", typeContrainte: "PAR_ACTE", plafondActe: 120_000, plafondAn: null, nombreSeances: null },
	{ id: 5, code: "KI-001", nom: "Séance de kinésithérapie", libelle: "Rééducation fonctionnelle", categorieId: 4, nomCategorie: "Kinésithérapie", typeContrainte: "PAR_SEANCE", plafondActe: null, plafondAn: null, nombreSeances: 12 },
	{ id: 6, code: "SO-001", nom: "Soins infirmiers", libelle: "Soins à domicile", categorieId: 5, nomCategorie: "Soins", typeContrainte: "SANS_CONTRAINTE", plafondActe: null, plafondAn: null, nombreSeances: null },
];

const mockDelay = () => new Promise((resolve) => setTimeout(resolve, 1200));

export async function fetchT5XTable1Mock(): Promise<T5XTypeRow[]> {
	await mockDelay();
	return initialT5XTable1Mock.map((row) => ({ ...row }));
}

export async function fetchT5XTable2Mock(): Promise<T5XConstraintRow[]> {
	await mockDelay();
	return initialT5XTable2Mock.map((row) => ({ ...row }));
}
