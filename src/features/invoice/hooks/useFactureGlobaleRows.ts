import { useCallback, useEffect, useMemo, useState } from "react";
import { fetchFactureGlobaleMock } from "../mocks/invoiceTable";
import type { FactureGlobaleColumnKey, FactureGlobaleRow } from "../types/invoiceTable";

const numericKeys = new Set<FactureGlobaleColumnKey>([
	"montantTotal", "partCem100", "depassement", "partCem80", "partAgent20", "totalPartAgent",
]);

function createEmptyInvoice(id: number): FactureGlobaleRow {
	return {
		id, refSocial: "", dateReception: "", numFacture: "", dateFacture: "", nomEtablissement: "",
		montantTotal: 0, partCem100: 0, depassement: 0, partCem80: 0, partAgent20: 0, totalPartAgent: 0,
		localite: "", moisPrestation: "", refAgence: "", remarques1: "", retourPrestataire: "",
		recuApresModification: "", dateEnregistrement: "", parQuiEnregistrement: "", dateEnvoiValidation: "",
		pourQuiValidation: "", remarques2: "", retourCorrection: "", dateValidation: "",
		parQuiValidationFinale: "", dateSortie: "", serviceSortie: "",
	};
}

function hasInvoiceValue(row: FactureGlobaleRow) {
	return Object.entries(row).some(([key, value]) => key !== "id" && value !== "" && value !== 0);
}

function receptionTimestamp(value: string) {
	if (!value) return Number.POSITIVE_INFINITY;
	const [day, month, year] = value.split("/").map(Number);
	if (!day || !month || !year) return Number.POSITIVE_INFINITY;
	return new Date(year || 0, (month || 1) - 1, day || 1).getTime();
}

export default function useFactureGlobaleRows() {
	const [dataRows, setDataRows] = useState<FactureGlobaleRow[]>([]);
	const [addRow, setAddRow] = useState(() => createEmptyInvoice(1));
	const [isLoaded, setIsLoaded] = useState(false);

	useEffect(() => {
		let active = true;
		fetchFactureGlobaleMock().then((loadedRows) => {
			if (!active) return;
			setDataRows(loadedRows);
			setAddRow(createEmptyInvoice(Math.max(...loadedRows.map((row) => row.id)) + 1));
			setIsLoaded(true);
		});
		return () => { active = false; };
	}, []);

	const updateCell = useCallback((rowId: number, key: FactureGlobaleColumnKey, value: string) => {
		const nextValue: string | number = numericKeys.has(key) ? (value === "" ? 0 : Number(value)) : value;
		if (rowId === addRow.id) {
			const updated = { ...addRow, [key]: nextValue } as FactureGlobaleRow;
			if (hasInvoiceValue(updated)) {
				setDataRows((currentRows) => [...currentRows, updated].sort((a, b) => receptionTimestamp(a.dateReception) - receptionTimestamp(b.dateReception)));
				setAddRow(createEmptyInvoice(updated.id + 1));
			} else {
				setAddRow(updated);
			}
			return;
		}
		setDataRows((current) => current
			.map((row) => row.id === rowId ? { ...row, [key]: nextValue } as FactureGlobaleRow : row)
			.sort((a, b) => receptionTimestamp(a.dateReception) - receptionTimestamp(b.dateReception)));
	}, [addRow.id]);

	const rows = useMemo(() => [...dataRows, addRow], [dataRows, addRow]);
	return { rows, addRowId: addRow.id, isLoaded, updateCell };
}
