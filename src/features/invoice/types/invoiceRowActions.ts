import type { FactureGlobaleCellValue, FactureGlobaleEditKey } from "./invoiceTable";

export type ValidationRole = "Adjoint" | "Chef";

export type UpdateFactureGlobaleCell = (
	rowId: number,
	key: FactureGlobaleEditKey,
	value: FactureGlobaleCellValue,
) => void;
