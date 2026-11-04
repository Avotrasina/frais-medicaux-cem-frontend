import { useCallback, useState } from "react";
import { saveFactureGlobaleMock } from "../mocks/invoiceTable";
import type {
	FactureGlobaleChanges,
	FactureGlobaleCellValue,
	FactureGlobaleColumnKey,
	FactureGlobaleRow,
} from "../types/invoiceTable";

function getChangedValues(
	original: FactureGlobaleRow,
	current: FactureGlobaleRow,
): FactureGlobaleChanges {
	const changes: FactureGlobaleChanges = {};
	(Object.keys(original) as (keyof FactureGlobaleRow)[]).forEach((key) => {
		const originalValue = original[key];
		const currentValue = current[key];
		const isSameDate = originalValue instanceof Date && currentValue instanceof Date
			&& originalValue.getTime() === currentValue.getTime();
		if (key !== "id" && !isSameDate && originalValue !== currentValue) {
			changes[key] = current[key] as never;
		}
	});
	return changes;
}

export default function useInvoiceRowEditing(
	rows: FactureGlobaleRow[],
	addRowId: number,
	onCellChange: (rowId: number, key: FactureGlobaleColumnKey, value: FactureGlobaleCellValue) => void,
	onRowCancel: (rowId: number, original: FactureGlobaleRow, wasAddRow: boolean) => void,
) {
	const [activeRowId, setActiveRowId] = useState<number | null>(null);
	const [originalRow, setOriginalRow] = useState<FactureGlobaleRow | null>(null);
	const [activeWasAddRow, setActiveWasAddRow] = useState(false);

	const updateCell = useCallback((rowId: number, key: FactureGlobaleColumnKey, value: FactureGlobaleCellValue) => {
		if (activeRowId !== null && activeRowId !== rowId) return;
		const row = rows.find((item) => item.id === rowId);
		if (!row) return;
		if (activeRowId === null) {
			setActiveRowId(rowId);
			setOriginalRow(row);
			setActiveWasAddRow(rowId === addRowId);
		}
		onCellChange(rowId, key, value);
	}, [activeRowId, addRowId, onCellChange, rows]);

	const saveActiveRow = useCallback(async () => {
		if (activeRowId === null || !originalRow) return;
		const currentRow = rows.find((row) => row.id === activeRowId);
		if (!currentRow) return;
		const changes = getChangedValues(originalRow, currentRow);
		await saveFactureGlobaleMock(activeRowId, changes);
		setActiveRowId(null);
		setOriginalRow(null);
		setActiveWasAddRow(false);
	}, [activeRowId, originalRow, rows]);

	const cancelActiveRow = useCallback(() => {
		if (activeRowId === null || !originalRow) return;
		onRowCancel(activeRowId, originalRow, activeWasAddRow);
		setActiveRowId(null);
		setOriginalRow(null);
		setActiveWasAddRow(false);
	}, [activeRowId, activeWasAddRow, onRowCancel, originalRow]);

	return {
		activeRowId,
		canSave: activeRowId !== null,
		isRowLocked: (rowId: number) => activeRowId !== null && activeRowId !== rowId,
		onCellChange: updateCell,
		saveActiveRow,
		cancelActiveRow,
	};
}
