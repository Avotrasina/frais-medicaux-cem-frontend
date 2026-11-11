import { useCallback, useState } from "react";
import { useAsyncLoader } from "../../../hooks/useAsyncLoader";
import { createActe, listActes } from "../../../services/acte-api";
import type { T5XCategoryOption, T5XConstraintEditableKey, T5XConstraintRow, T5XConstraintType } from "../types/t5xType";
import { mapActeListItem, mapCreatedActe, toCreateActeInput } from "../utils/t5xApiMapper";
import { applyT5XActConstraintType, createEmptyActRow, hasT5XRowData } from "../utils/t5xRowUtils";
import useSaveT5XRow from "./useSaveT5XRow";
import useT5XRowEditing from "./useT5XRowEditing";

export default function useT5XActs(categories: T5XCategoryOption[]) {
	const [rows, setRows] = useState<T5XConstraintRow[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [loadError, setLoadError] = useState<string | null>(null);

	const load = useCallback(async (isStale: () => boolean) => {
		try {
			const loaded = await listActes({ avecPlafonds: true });
			if (isStale()) return;
			const loadedRows = loaded.map((acte) =>
				mapActeListItem(
					acte,
					categories.find((item) => item.id === acte.categorieActeId)?.nom ?? "",
				),
			);
			setRows([
				...loadedRows,
				createEmptyActRow(Math.max(0, ...loadedRows.map((row) => row.id)) + 1),
			]);
			setLoadError(null);
		} catch (error) {
			if (isStale()) return;
			setRows([]);
			setLoadError(
				error instanceof Error
					? error.message
					: "Impossible de charger les actes et prestations T5.",
			);
		} finally {
			if (!isStale()) setIsLoading(false);
		}
	}, [categories]);

	useAsyncLoader(load);

	const reload = useCallback(async () => {
		setIsLoading(true);
		setLoadError(null);
		await load(() => false);
	}, [load]);

	const updateRowCell = useCallback((rowId: number, key: T5XConstraintEditableKey, value: string | number | null) => {
		setRows((currentRows) => currentRows.map((current) => {
			if (current.id !== rowId) return current;
			let updated: T5XConstraintRow;
			if (key === "typeContrainte") {
				updated = applyT5XActConstraintType(current, value as T5XConstraintType | "");
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

	const createRow = useCallback(async (row: T5XConstraintRow) => {
		const created = await createActe(toCreateActeInput(row));
		return mapCreatedActe(created, row);
	}, []);
	const updateRow = useCallback(async (): Promise<T5XConstraintRow> => {
		throw new Error("La modification des actes n'est pas encore disponible.");
	}, []);
	const saveRow = useSaveT5XRow(createRow, updateRow);

	const persistRow = useCallback(async (row: T5XConstraintRow, isNew: boolean) => {
		const savedRow = await saveRow(row, isNew);
		setRows((currentRows) => {
			if (!isNew) return currentRows.map((item) => item.id === row.id ? savedRow : item);
			const persistedRows = [...currentRows.filter((item) => item.id !== row.id), savedRow];
			const nextId = Math.max(0, ...persistedRows.map((item) => item.id)) + 1;
			return [...persistedRows, createEmptyActRow(nextId)];
		});
		return savedRow;
	}, [saveRow]);

	const restoreRow = useCallback((rowId: number, originalRow: T5XConstraintRow) => {
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
		categories,
		isLoading,
		loadError,
		reload,
		activeRowId: editing.activeRowId,
		canSaveRow: editing.canSave,
		isSaving: editing.isSaving,
		saveError: editing.saveError,
		updateCell: editing.updateCell,
		saveActiveRow: editing.saveActiveRow,
		cancelActiveRow: editing.cancelActiveRow,
	};
}
