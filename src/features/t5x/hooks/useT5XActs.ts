import { useCallback, useState } from "react";
import { useAsyncLoader } from "../../../hooks/useAsyncLoader";
import {
	createActe,
	deleteActe,
	listActes,
	updateActe,
} from "../../../services/acte-api";
import type { T5XCategoryOption, T5XConstraintEditableKey, T5XConstraintRow, T5XConstraintType } from "../types/t5xType";
import {
	mapActeListItem,
	mapCreatedActe,
	toCreateActeInput,
	toUpdateActeInput,
} from "../utils/t5xApiMapper";
import { hasCategoryConstraint, isConstraintLocked } from "../utils/t5xConstraintRules";
import { acteHasOwnConstraint, type T5XPlafondIndex } from "../utils/t5xPlafondIndex";
import { applyT5XActConstraintType, createEmptyActRow, hasT5XRowData } from "../utils/t5xRowUtils";
import useSaveT5XRow from "./useSaveT5XRow";
import useT5XRowEditing from "./useT5XRowEditing";

export default function useT5XActs(
	categories: T5XCategoryOption[],
	plafondIndex: T5XPlafondIndex,
) {
	const [rows, setRows] = useState<T5XConstraintRow[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [loadError, setLoadError] = useState<string | null>(null);

	const findCategory = useCallback(
		(categorieId: number) => categories.find((item) => item.id === categorieId) ?? null,
		[categories],
	);

	const load = useCallback(async (isStale: () => boolean) => {
		try {
			const loaded = await listActes({ avecPlafonds: true });
			if (isStale()) return;
			const loadedRows = loaded.map((acte) =>
				mapActeListItem(
					acte,
					categories.find((item) => item.id === acte.categorieActeId)?.nom ?? "",
					acteHasOwnConstraint(plafondIndex, acte.id),
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
	}, [categories, plafondIndex]);

	useAsyncLoader(load);

	const reload = useCallback(async (silent = false) => {
		if (!silent) setIsLoading(true);
		setLoadError(null);
		await load(() => false);
	}, [load]);

	const updateRowCell = useCallback((rowId: number, key: T5XConstraintEditableKey, value: string | number | null) => {
		setRows((currentRows) => currentRows.map((current) => {
			if (current.id !== rowId) return current;
			let updated: T5XConstraintRow;
			if (key === "typeContrainte") {
				// Rule 1: a constrained category forbids an own constraint.
				if (isConstraintLocked(current, findCategory(current.categorieId))) return current;
				updated = applyT5XActConstraintType(current, value as T5XConstraintType | "");
			} else if (key === "categorieId") {
				const category = findCategory(Number(value));
				if (!category) return current;
				updated = {
					...current,
					categorieId: category.id,
					nomCategorie: category.nom,
					...(hasCategoryConstraint(category)
						? { typeContrainte: "", plafondActe: null, plafondAn: null, nombreSeances: null }
						: {}),
				};
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
	}, [categories, findCategory]);

	const createRow = useCallback(async (row: T5XConstraintRow) => {
		const category = findCategory(row.categorieId);
		const created = await createActe(
			toCreateActeInput(row, {
				contrainteVerrouillee: isConstraintLocked(row, category),
			}),
		);
		return mapCreatedActe(created, row);
	}, [findCategory]);

	const updateRow = useCallback(async (row: T5XConstraintRow, originalRow: T5XConstraintRow | null) => {
		const category = findCategory(row.categorieId);
		const payload = toUpdateActeInput(row, originalRow ?? row, {
			contrainteVerrouillee: isConstraintLocked(row, category),
		});
		const updated = await updateActe(row.id, payload);
		return {
			...row,
			id: updated.id,
			code: updated.code,
			nom: updated.nomActe,
			listeLibelle: updated.listeLibelle,
			regime: updated.regime,
			categorieId: updated.categorieActeId,
			nomCategorie: category?.nom ?? row.nomCategorie,
		};
	}, [findCategory]);

	const deleteRow = useCallback(async (rowId: number) => {
		await deleteActe(rowId);
	}, []);

	const saveRow = useSaveT5XRow(createRow, updateRow);

	const persistRow = useCallback(async (row: T5XConstraintRow, originalRow: T5XConstraintRow, isNew: boolean) => {
		const savedRow = await saveRow(row, originalRow, isNew);
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
		selectedRowId: editing.selectedRowId,
		selectRow: editing.selectRow,
		resetSelection: editing.resetSelection,
		canSaveRow: editing.canSave,
		isSaving: editing.isSaving,
		saveError: editing.saveError,
		updateCell: editing.updateCell,
		saveActiveRow: editing.saveActiveRow,
		cancelActiveRow: editing.cancelActiveRow,
		deleteRow,
	};
}
