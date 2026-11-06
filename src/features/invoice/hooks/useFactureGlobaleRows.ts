import { useCallback, useMemo, useState } from "react";
import useGetFactureGlobaleRows from "./useGetFactureGlobaleRows";
import type { FactureGlobaleCellValue, FactureGlobaleColumnKey, FactureGlobaleRow } from "../types/invoiceTable";


const numericKeys = new Set<FactureGlobaleColumnKey>([
	"montantTotal", "partCem100", "depassement", "partCem80", "partAgent20", "totalPartAgent",
]);

function createEmptyInvoice(id: number): FactureGlobaleRow {
	return {
		id, refSocial: "", dateReception: "", numFacture: "", dateFacture: "", nomEtablissement: "",
		montantTotal: 0, partCem100: 0, depassement: 0, partCem80: 0, partAgent20: 0, totalPartAgent: 0,
		localite: "", moisPrestation: null, refAgence: "", remarques1: "", retourPrestataire: "",
		recuApresModification: "", dateEnregistrement: "", parQuiEnregistrement: "", dateEnvoiValidation: "",
		pourQuiValidation: "", remarques2: "", retourCorrection: "", dateValidation: "",
		parQuiValidationFinale: "", dateSortie: "", serviceSortie: "",
	};
}

function receptionTimestamp(value: string) {
	if (!value) return Number.POSITIVE_INFINITY;
	const [day, month, year] = value.split("/").map(Number);
	if (!day || !month || !year) return Number.POSITIVE_INFINITY;
	return new Date(year || 0, (month || 1) - 1, day || 1).getTime();
}

export default function useFactureGlobaleRows() {
	const factureRowsQuery = useGetFactureGlobaleRows();
	const reloadRows = factureRowsQuery.reload;
	const [storedDataRows, setStoredDataRows] = useState<FactureGlobaleRow[] | null>(null);
	const [storedAddRow, setStoredAddRow] = useState<FactureGlobaleRow | null>(null);
	const [selectedRowId, setSelectedRowId] = useState<number | null>(null);
	const dataRows = useMemo(
		() => storedDataRows ?? factureRowsQuery.data ?? [],
		[storedDataRows, factureRowsQuery.data],
	);
	const nextId = Math.max(0, ...dataRows.map((row) => row.id)) + 1;
	const addRow = useMemo(
		() => storedAddRow ?? createEmptyInvoice(nextId),
		[storedAddRow, nextId],
	);

	const updateCell = useCallback((rowId: number, key: FactureGlobaleColumnKey, value: FactureGlobaleCellValue) => {
		const nextValue: string | number | Date | null = key === "moisPrestation"
			? value instanceof Date ? value : null
			: numericKeys.has(key) ? (value === "" ? 0 : Number(value)) : typeof value === "string" ? value : "";
		if (rowId === addRow.id) {
			const updated = {
				...addRow,
				[key]: nextValue,
				...((key === "depassement" || key === "partAgent20") && {
					totalPartAgent: (key === "depassement" ? Number(nextValue) : addRow.depassement)
						+ (key === "partAgent20" ? Number(nextValue) : addRow.partAgent20),
				}),
			} as FactureGlobaleRow;
			setStoredAddRow(updated);
			return;
		}
		setStoredDataRows((current) => (current ?? factureRowsQuery.data ?? [])
			.map((row) => row.id === rowId ? {
				...row,
				[key]: nextValue,
				...((key === "depassement" || key === "partAgent20") && {
					totalPartAgent: (key === "depassement" ? Number(nextValue) : row.depassement)
						+ (key === "partAgent20" ? Number(nextValue) : row.partAgent20),
				}),
			} as FactureGlobaleRow : row)
			.sort((a, b) => receptionTimestamp(a.dateReception) - receptionTimestamp(b.dateReception)));
	}, [addRow, factureRowsQuery.data]);

	const restoreRow = useCallback((rowId: number, originalRow: FactureGlobaleRow, wasAddRow: boolean) => {
		if (wasAddRow) {
			setStoredAddRow((current) => (current ?? addRow).id === rowId ? originalRow : current);
			return;
		}
		setStoredDataRows((current) => (current ?? factureRowsQuery.data ?? [])
			.map((row) => row.id === rowId ? originalRow : row)
			.sort((a, b) => receptionTimestamp(a.dateReception) - receptionTimestamp(b.dateReception)));
	}, [addRow, factureRowsQuery.data]);

	const refreshRows = useCallback(async (created = false) => {
		if (created) setStoredAddRow(null);
		const latestRows = await reloadRows();
		if (!latestRows) {
			throw new Error("Impossible d’actualiser les factures. Réessayez le chargement.");
		}
		setStoredDataRows(latestRows);
		return latestRows;
	}, [reloadRows]);

	const reload = useCallback(async () => {
		const latestRows = await reloadRows();
		if (!latestRows) return false;
		setStoredDataRows(latestRows);
		return true;
	}, [reloadRows]);

	const rows = useMemo(() => [...dataRows, addRow], [dataRows, addRow]);
	const selectRow = useCallback((rowId: number) => {
		setSelectedRowId((current) => (current === rowId ? rowId : rowId));
	}, []);
	return {
		rows,
		addRowId: addRow.id,
		selectedRowId,
		selectRow,
		isLoaded: factureRowsQuery.data !== null && !factureRowsQuery.isLoading,
		loadError: factureRowsQuery.error,
		reload,
		updateCell,
		refreshRows,
		restoreRow,
	};
}
