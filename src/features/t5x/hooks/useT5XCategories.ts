import { useCallback, useEffect, useState } from "react";
import {
	createT5XCategoryMock,
	fetchT5XTable1Mock,
	updateT5XCategoryMock,
} from "../mocks/t5xTypes";
import type { T5XConstraintType, T5XTypeEditableKey, T5XTypeRow } from "../types/t5xType";
import { applyT5XConstraintType, createEmptyCategoryRow, hasT5XRowData } from "../utils/t5xRowUtils";
import useSaveT5XRow from "./useSaveT5XRow";
import useT5XRowEditing from "./useT5XRowEditing";

export default function useT5XCategories() {
	const [rows, setRows] = useState<T5XTypeRow[]>([]);
	const [isLoading, setIsLoading] = useState(true);

	useEffect(() => {
		let isActive = true;
		fetchT5XTable1Mock().then((loadedRows) => {
			if (!isActive) return;
			setRows([...loadedRows, createEmptyCategoryRow(Math.max(0, ...loadedRows.map((row) => row.id)) + 1)]);
			setIsLoading(false);
		});
		return () => { isActive = false; };
	}, []);

	const updateRowCell = useCallback((rowId: number, key: T5XTypeEditableKey, value: string | number | null) => {
		setRows((currentRows) => currentRows.map((current) => {
			if (current.id !== rowId) return current;
			let updated = key === "typeContrainte"
				? applyT5XConstraintType(current, value as T5XConstraintType | "")
				: { ...current, [key]: value } as T5XTypeRow;
			if (rowId === currentRows.at(-1)?.id && !updated.typeContrainte && hasT5XRowData(updated)) {
				updated = { ...updated, typeContrainte: "SANS_CONTRAINTE" };
			}
			return updated;
		}));
	}, []);

	const createRow = useCallback((row: T5XTypeRow) => createT5XCategoryMock(row), []);
	const updateRow = useCallback((row: T5XTypeRow) => updateT5XCategoryMock(row), []);
	const saveRow = useSaveT5XRow(createRow, updateRow);

	const persistRow = useCallback(async (row: T5XTypeRow, isNew: boolean) => {
		const savedRow = await saveRow(row, isNew);
		setRows((currentRows) => {
			if (!isNew) return currentRows.map((item) => item.id === row.id ? savedRow : item);
			const persistedRows = [...currentRows.filter((item) => item.id !== row.id), savedRow];
			const nextId = Math.max(0, ...persistedRows.map((item) => item.id)) + 1;
			return [...persistedRows, createEmptyCategoryRow(nextId)];
		});
		return savedRow;
	}, [saveRow]);

	const restoreRow = useCallback((rowId: number, originalRow: T5XTypeRow) => {
		setRows((currentRows) => currentRows.map((item) => item.id === rowId ? originalRow : item));
	}, []);
	const addRowId = rows.at(-1)?.id ?? 0;
	const editing = useT5XRowEditing({
		rows,
		addRowId,
		onCellChange: updateRowCell,
		onRowRestore: restoreRow,
		onRowSave: persistRow,
		isValidNewRow: hasT5XRowData,
	});

	return {
		rows,
		addRowId,
		isLoading,
		activeRowId: editing.activeRowId,
		canSaveRow: editing.canSave,
		isSaving: editing.isSaving,
		saveError: editing.saveError,
		updateCell: editing.updateCell,
		saveActiveRow: editing.saveActiveRow,
		cancelActiveRow: editing.cancelActiveRow,
	};
}
