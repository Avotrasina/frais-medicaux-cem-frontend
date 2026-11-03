import { useCallback, useEffect, useState } from "react";
import { fetchT5XTable2Mock } from "../mocks/t5xTypes";
import type { T5XCategoryOption, T5XConstraintEditableKey, T5XConstraintRow, T5XConstraintType } from "../types/t5xType";
import { applyT5XConstraintType, createEmptyActRow, hasT5XRowData } from "../utils/t5xRowUtils";

export default function useT5XActs() {
	const [rows, setRows] = useState<T5XConstraintRow[]>([]);
	const [categories, setCategories] = useState<T5XCategoryOption[]>([]);
	const [isLoading, setIsLoading] = useState(true);

	useEffect(() => {
		let isActive = true;
		fetchT5XTable2Mock().then((loadedRows) => {
			if (!isActive) return;
			setRows([...loadedRows, createEmptyActRow(Math.max(0, ...loadedRows.map((row) => row.id)) + 1)]);
			setCategories(Array.from(new Map(loadedRows.map((row) => [row.categorieId, row.nomCategorie])), ([id, nom]) => ({ id, nom })));
			setIsLoading(false);
		});
		return () => { isActive = false; };
	}, []);

	const updateCell = useCallback((rowId: number, key: T5XConstraintEditableKey, value: string | number | null) => {
		setRows((currentRows) => currentRows.map((current) => {
			if (current.id !== rowId) return current;
			let updated: T5XConstraintRow;
			if (key === "typeContrainte") {
				updated = applyT5XConstraintType(current, value as T5XConstraintType | "");
			} else if (key === "categorieId") {
				const category = categories.find((item) => item.id === Number(value));
				updated = category
					? { ...current, categorieId: category.id, nomCategorie: category.nom }
					: current;
			} else {
				updated = { ...current, [key]: value } as T5XConstraintRow;
			}
			if (rowId === currentRows.at(-1)?.id && hasT5XRowData(updated)) {
				updated = {
					...updated,
					typeContrainte: updated.typeContrainte || "SANS_CONTRAINTE",
					categorieId: updated.categorieId || categories[0]?.id || 0,
					nomCategorie: updated.nomCategorie || categories[0]?.nom || "",
				};
			}
			return updated;
		}));
	}, [categories]);

	const saveAddRow = useCallback(() => {
		setRows((currentRows) => {
			const addRow = currentRows.at(-1);
			if (!addRow || !hasT5XRowData(addRow)) return currentRows;
			return [...currentRows, createEmptyActRow(addRow.id + 1)];
		});
	}, []);

	const addRowId = rows.at(-1)?.id ?? 0;
	const canSaveRow = Boolean(rows.at(-1) && hasT5XRowData(rows.at(-1)!));
	return { rows, addRowId, categories, isLoading, canSaveRow, updateCell, saveAddRow };
}
