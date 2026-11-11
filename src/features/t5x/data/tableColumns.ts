import type { T5XColumn } from "../types/t5xType";

export const t5xTypeColumns: T5XColumn<"nom" | "typeContrainte" | "plafondActe" | "plafondAn" | "nombreSeances">[] = [
	{ key: "nom", label: "Catégorie", width: "w-64 min-w-64 max-w-64", filterMode: "text" },
	{ key: "typeContrainte", label: "Type contrainte", width: "w-52 min-w-52 max-w-52", filterMode: "constraint" },
	{ key: "plafondActe", label: "Plafond par acte", width: "w-48 min-w-48 max-w-48" },
	{ key: "plafondAn", label: "Plafond par an", width: "w-48 min-w-48 max-w-48" },
	{ key: "nombreSeances", label: "Nombre de séances", width: "w-48 min-w-48 max-w-48" },
];

export const t5xConstraintColumns: T5XColumn<"code" | "nom" | "listeLibelle" | "nomCategorie" | "typeContrainte" | "plafondActe" | "plafondAn" | "nombreSeances">[] = [
	{ key: "code", label: "Code", width: "w-32 min-w-32 max-w-32" },
	{ key: "nom", label: "Nom", width: "w-56 min-w-56 max-w-56", filterMode: "text" },
	{ key: "listeLibelle", label: "Liste libellé", width: "w-72 min-w-72 max-w-72" },
	{ key: "nomCategorie", label: "Nom catégorie", width: "w-56 min-w-56 max-w-56", filterMode: "category" },
	{ key: "typeContrainte", label: "Type contraintes", width: "w-52 min-w-52 max-w-52", filterMode: "constraint" },
	{ key: "plafondActe", label: "Plafond par acte", width: "w-48 min-w-48 max-w-48" },
	{ key: "plafondAn", label: "Plafond par an", width: "w-48 min-w-48 max-w-48" },
	{ key: "nombreSeances", label: "Nombre de séances", width: "w-48 min-w-48 max-w-48" },
];
