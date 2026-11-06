import { useCallback, useMemo, useState } from "react";

type IdentifiedRow = { id: number };
type EditableKey<T> = Exclude<keyof T, "id">;
type CellValue<T> = T[EditableKey<T>];
type UpdateCell<T> = (rowId: number, key: EditableKey<T>, value: CellValue<T>) => void;

type Options<T extends IdentifiedRow> = {
	rows: T[];
	addRowId: number;
	onCellChange: UpdateCell<T>;
	onRowRestore: (rowId: number, originalRow: T) => void;
	onRowSave: (row: T, isNew: boolean) => Promise<T>;
	isValidNewRow: (row: T) => boolean;
};

export default function useT5XRowEditing<T extends IdentifiedRow>({
	rows,
	addRowId,
	onCellChange,
	onRowRestore,
	onRowSave,
	isValidNewRow,
}: Options<T>) {
	const [activeRowId, setActiveRowId] = useState<number | null>(null);
	const [originalRow, setOriginalRow] = useState<T | null>(null);
	const [activeIsNew, setActiveIsNew] = useState(false);
	const [isSaving, setIsSaving] = useState(false);
	const [saveError, setSaveError] = useState<string | null>(null);
	const activeRow = rows.find((row) => row.id === activeRowId) ?? null;

	const updateCell = useCallback((rowId: number, key: EditableKey<T>, value: CellValue<T>) => {
		if (activeRowId !== null && activeRowId !== rowId) return;
		const row = rows.find((item) => item.id === rowId);
		if (!row || Object.is(row[key], value)) return;
		if (activeRowId === null) {
			setActiveRowId(rowId);
			setOriginalRow(row);
			setActiveIsNew(rowId === addRowId);
		}
		setSaveError(null);
		onCellChange(rowId, key, value);
	}, [activeRowId, addRowId, onCellChange, rows]);

	const hasChanges = useMemo(() => {
		if (!activeRow || !originalRow) return false;
		return Object.keys(activeRow).some((key) =>
			key !== "id"
			&& activeRow[key as keyof T] !== originalRow[key as keyof T],
		);
	}, [activeRow, originalRow]);
	const canSave = activeRow !== null && originalRow !== null
		&& (activeIsNew ? isValidNewRow(activeRow) : hasChanges);

	const clearActiveRow = useCallback(() => {
		setActiveRowId(null);
		setOriginalRow(null);
		setActiveIsNew(false);
	}, []);

	const saveActiveRow = useCallback(async () => {
		if (!activeRow || !originalRow || activeRowId === null || !canSave || isSaving) return false;
		setIsSaving(true);
		setSaveError(null);
		try {
			await onRowSave(activeRow, activeIsNew);
			clearActiveRow();
			return true;
		} catch (error) {
			setSaveError(error instanceof Error ? error.message : "L’enregistrement a échoué.");
			return false;
		} finally {
			setIsSaving(false);
		}
	}, [activeIsNew, activeRow, activeRowId, canSave, clearActiveRow, isSaving, onRowSave, originalRow]);

	const cancelActiveRow = useCallback(() => {
		if (activeRowId === null || !originalRow || isSaving) return;
		onRowRestore(activeRowId, originalRow);
		clearActiveRow();
		setSaveError(null);
	}, [activeRowId, clearActiveRow, isSaving, onRowRestore, originalRow]);

	return {
		activeRowId,
		canSave,
		isSaving,
		saveError,
		updateCell,
		saveActiveRow,
		cancelActiveRow,
	};
}
