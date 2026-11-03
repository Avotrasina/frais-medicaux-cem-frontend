import { useCallback, useEffect, useState } from "react";
import { fetchT5XTable1Mock } from "../mocks/t5xTypes";
import type { T5XConstraintType, T5XTypeEditableKey, T5XTypeRow } from "../types/t5xType";
import { applyT5XConstraintType, createEmptyCategoryRow, hasT5XRowData } from "../utils/t5xRowUtils";

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

	const updateCell = useCallback((rowId: number, key: T5XTypeEditableKey, value: string | number | null) => {
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

	const saveAddRow = useCallback(() => {
		setRows((currentRows) => {
			const addRow = currentRows.at(-1);
			if (!addRow || !hasT5XRowData(addRow)) return currentRows;
			return [...currentRows, createEmptyCategoryRow(addRow.id + 1)];
		});
	}, []);

	const addRowId = rows.at(-1)?.id ?? 0;
	const canSaveRow = Boolean(rows.at(-1) && hasT5XRowData(rows.at(-1)!));
	return { rows, addRowId, isLoading, canSaveRow, updateCell, saveAddRow };
}
