import type { FactureGlobaleRow } from "./invoiceTable";

export type ValidationRole = "Adjoint" | "Chef";

export type UpdateFactureGlobaleCell = <K extends Exclude<keyof FactureGlobaleRow, "id">>(
	rowId: number,
	key: K,
	value: FactureGlobaleRow[K],
) => void;
