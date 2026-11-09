import { useCallback, useMemo, useState } from "react";
import { t6EditableKeys } from "../data/t6Columns";
import type { T6CellValue, T6ColumnKey, T6EditableKey, T6Row } from "../types/t6Row";

type EditingMode = "create" | "update";

export default function useT6RowEditing(
	rows: T6Row[],
	addRowId: number,
	onCellChange: (rowId: number, key: T6ColumnKey, value: T6CellValue) => void,
	onRowCancel: (rowId: number, original: T6Row, isAddRow: boolean) => void,
	persistRow: (row: T6Row, isNew: boolean) => Promise<void>,
) {
	const [activeRowId, setActiveRowId] = useState<number | null>(null);
	const [originalRow, setOriginalRow] = useState<T6Row | null>(null);
	const [activeMode, setActiveMode] = useState<EditingMode | null>(null);
	const [saveError, setSaveError] = useState<string | null>(null);
	const [isSaving, setIsSaving] = useState(false);

	const activeRow = rows.find((row) => row.id === activeRowId);
	const hasNewRowData = useMemo(() => activeRow
		? t6EditableKeys.some((key) => {
			const value = activeRow[key];
			return value instanceof Date || (typeof value === "number"
				? value !== 0
				: typeof value === "string" && value.trim() !== "");
		})
		: false, [activeRow]);
	const canSave = activeRowId !== null && activeMode !== null
		&& (activeMode !== "create" || hasNewRowData)
		&& !isSaving;

	const beginAddRow = useCallback(() => {
		if (activeRowId !== null) return;
		const row = rows.find((item) => item.id === addRowId);
		if (!row) return;
		setActiveRowId(row.id);
		setOriginalRow(row);
		setActiveMode("create");
		setSaveError(null);
	}, [activeRowId, addRowId, rows]);

	const updateCell = useCallback((rowId: number, key: T6EditableKey, value: T6CellValue) => {
		if (activeRowId !== null && activeRowId !== rowId) return;
		const row = rows.find((item) => item.id === rowId);
		if (!row) return;
		if (activeRowId === null) {
			setActiveRowId(rowId);
			setOriginalRow(row);
			setActiveMode(rowId === addRowId ? "create" : "update");
		}
		setSaveError(null);
		onCellChange(rowId, key, value);
	}, [activeRowId, addRowId, onCellChange, rows]);

	const saveActiveRow = useCallback(async () => {
		if (activeRowId === null || !originalRow || !activeMode || isSaving) return false;
		const currentRow = rows.find((row) => row.id === activeRowId);
		if (!currentRow) {
			setSaveError("La ligne T6 active n’a pas été trouvée.");
			return false;
		}
		if (activeMode === "create" && !hasNewRowData) {
			setSaveError("Saisissez au moins une valeur avant d’enregistrer la retenue.");
			return false;
		}

		setIsSaving(true);
		try {
			await persistRow(currentRow, activeMode === "create");
			setActiveRowId(null);
			setOriginalRow(null);
			setActiveMode(null);
			setSaveError(null);
			return true;
		} catch (error) {
			setSaveError(error instanceof Error ? error.message : "L’enregistrement de la retenue T6 a échoué.");
			return false;
		} finally {
			setIsSaving(false);
		}
	}, [activeMode, activeRowId, hasNewRowData, isSaving, originalRow, persistRow, rows]);

	const cancelActiveRow = useCallback(() => {
		if (activeRowId === null || !originalRow || isSaving) return;
		onRowCancel(activeRowId, originalRow, activeRowId === addRowId);
		setActiveRowId(null);
		setOriginalRow(null);
		setActiveMode(null);
		setSaveError(null);
	}, [activeRowId, addRowId, isSaving, onRowCancel, originalRow]);

	return {
		activeRowId,
		hasActiveRow: activeRowId !== null,
		canSave,
		isSaving,
		saveError,
		clearSaveError: useCallback(() => setSaveError(null), []),
		beginAddRow,
		onCellChange: updateCell,
		saveActiveRow,
		cancelActiveRow,
	};
}
