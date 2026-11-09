import { useCallback, useMemo, useState } from "react";
import { useAsyncLoader } from "../../../hooks/useAsyncLoader";
import { t6NumberKeys } from "../data/t6Columns";
import { createT6RowMock, fetchT6RowsMock, updateT6RowMock } from "../mocks/t6Rows";
import type { T6CellValue, T6ColumnKey, T6Row } from "../types/t6Row";

function createEmptyRow(id: number): T6Row {
	return {
		id,
		moisAffectation: null,
		refPaie: "",
		dateSaisie: "",
		refSocial: "",
		numFacture: "",
		dateFacture: "",
		nomEtablissement: "",
		idp: "",
		nomBeneficiaire: "",
		prenomBeneficiaire: "",
		codeFamille: "",
		obsIdp: "",
		im: "",
		nomAgent: "",
		prenomAgent: "",
		direction: "",
		serviceAgence: "",
		code: "",
		actePrestation: "",
		categorie: "",
		dateActe: "",
		numPec: "",
		montantTotal: 0,
		partCem100: 0,
		depassement: 0,
		obsDepassement: "",
		partCem80: 0,
		partAgent20: 0,
		totalChargeAgent: 0,
	};
}

export default function useT6Rows() {
	const [dataRows, setDataRows] = useState<T6Row[]>([]);
	const [addRow, setAddRow] = useState<T6Row | null>(null);
	const [isLoading, setIsLoading] = useState(true);
	const [isLoaded, setIsLoaded] = useState(false);
	const [loadError, setLoadError] = useState<string | null>(null);

	const loadRows = useCallback(async (isStale: () => boolean) => {
		try {
			const latestRows = await fetchT6RowsMock();
			if (isStale()) return;
			setDataRows(latestRows);
			setAddRow(createEmptyRow(Math.max(0, ...latestRows.map((row) => row.id)) + 1));
			setLoadError(null);
		} catch (error) {
			if (isStale()) return;
			setLoadError(error instanceof Error ? error.message : "Impossible de charger les retenues T6.");
		} finally {
			if (!isStale()) {
				setIsLoaded(true);
				setIsLoading(false);
			}
		}
	}, []);

	useAsyncLoader(loadRows);

	const reload = useCallback(async () => {
		setIsLoading(true);
		setIsLoaded(false);
		setLoadError(null);
		try {
			const latestRows = await fetchT6RowsMock();
			setDataRows(latestRows);
			setAddRow(createEmptyRow(Math.max(0, ...latestRows.map((row) => row.id)) + 1));
			setIsLoaded(true);
			return true;
		} catch (error) {
			setLoadError(error instanceof Error ? error.message : "Impossible de charger les retenues T6.");
			return false;
		} finally {
			setIsLoading(false);
		}
	}, []);

	const rows = useMemo(() => [...dataRows, ...(addRow ? [addRow] : [])], [addRow, dataRows]);
	const addRowId = addRow?.id ?? -1;

	const updateCell = useCallback((rowId: number, key: T6ColumnKey, value: T6CellValue) => {
		const nextValue = key === "moisAffectation"
			? value instanceof Date ? value : null
			: t6NumberKeys.has(key) ? (value === "" ? 0 : Number(value))
				: typeof value === "string" ? value : "";
		if (rowId === addRowId) {
			setAddRow((current) => current ? { ...current, [key]: nextValue } as T6Row : current);
			return;
		}
		setDataRows((current) => current.map((row) => row.id === rowId
			? { ...row, [key]: nextValue } as T6Row
			: row));
	}, [addRowId]);

	const restoreRow = useCallback((rowId: number, original: T6Row, isAddRow: boolean) => {
		if (isAddRow) {
			setAddRow(original);
			return;
		}
		setDataRows((current) => current.map((row) => row.id === rowId ? original : row));
	}, []);

	const persistRow = useCallback(async (row: T6Row, isNew: boolean) => {
		if (isNew) {
			await createT6RowMock(row);
			const latestRows = await fetchT6RowsMock();
			setDataRows(latestRows);
			setAddRow(createEmptyRow(Math.max(0, ...latestRows.map((item) => item.id)) + 1));
			return;
		}

		await updateT6RowMock(row.id, row);
		setDataRows(await fetchT6RowsMock());
	}, []);

	return {
		rows,
		addRowId,
		isLoading,
		isLoaded,
		loadError,
		reload,
		updateCell,
		restoreRow,
		persistRow,
	};
}
