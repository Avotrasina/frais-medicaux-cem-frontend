import { useCallback, useState } from "react";
import useAddFactureRow from "./useAddFactureRow";
import useUpdateFactureRow from "./useUpdateFactureRow";
import { personnelFactureGlobaleEditableColumns } from "../data/tableColumn";
import {
	FACTURE_GLOBALE_UPDATE_KEYS,
	SaveColumnKey,
	type FactureGlobaleCellValue,
	type FactureGlobaleColumnKey,
	type FactureGlobaleCreateInput,
	type FactureGlobaleRow,
	type FactureGlobaleUpdateChanges,
	type FactureGlobaleUpdateKey,
} from "../types/invoiceTable";

type EditingMode = "create" | "update";

const createKeys = new Set<string>([...SaveColumnKey, "localite"]);
const updateKeys = new Set<string>(personnelFactureGlobaleEditableColumns);

function getChangedValues(
	original: FactureGlobaleRow,
	current: FactureGlobaleRow,
): FactureGlobaleUpdateChanges {
	const changes: FactureGlobaleUpdateChanges = {};

	const addChange = <K extends FactureGlobaleUpdateKey>(key: K) => {
		const originalValue = original[key];
		const currentValue = current[key];
		const isSameDate = originalValue instanceof Date && currentValue instanceof Date
			&& originalValue.getTime() === currentValue.getTime();
		if (!isSameDate && originalValue !== currentValue) {
			changes[key] = currentValue;
		}
	};

	FACTURE_GLOBALE_UPDATE_KEYS.forEach(addChange);
	return changes;
}

function getCreateInput(row: FactureGlobaleRow): FactureGlobaleCreateInput | null {
	if (
		!row.dateReception.trim()
		|| !row.numFacture.trim()
		|| !row.dateFacture.trim()
		|| !row.nomEtablissement.trim()
		|| !row.localite.trim()
		|| !Number.isFinite(row.montantTotal)
	) {
		return null;
	}

	return {
		dateReception: row.dateReception,
		numFacture: row.numFacture.trim(),
		dateFacture: row.dateFacture,
		nomEtablissement: row.nomEtablissement.trim(),
		localite: row.localite,
		montantTotal: row.montantTotal,
	};
}

export default function useInvoiceRowEditing(
	rows: FactureGlobaleRow[],
	addRowId: number,
	onCellChange: (rowId: number, key: FactureGlobaleColumnKey, value: FactureGlobaleCellValue) => void,
	onRowCancel: (rowId: number, original: FactureGlobaleRow, wasAddRow: boolean) => void,
	onMutationSuccess: (created: boolean) => Promise<unknown>,
	canEditRows: boolean,
) {
	const [activeRowId, setActiveRowId] = useState<number | null>(null);
	const [originalRow, setOriginalRow] = useState<FactureGlobaleRow | null>(null);
	const [activeMode, setActiveMode] = useState<EditingMode | null>(null);
	const [activeWasAddRow, setActiveWasAddRow] = useState(false);
	const [saveError, setSaveError] = useState<string | null>(null);
	const [isRefreshing, setIsRefreshing] = useState(false);
	const { save: saveNewInvoice, isLoading: isCreating } = useAddFactureRow();
	const { modify: modifyInvoice, isLoading: isUpdating } = useUpdateFactureRow();
	const isSaving = isCreating || isUpdating || isRefreshing;
	const activeRow = rows.find((row) => row.id === activeRowId);
	const canSave = canEditRows
		&& activeRowId !== null
		&& activeMode !== null
		&& (activeMode !== "create" || (activeWasAddRow && activeRow !== undefined && getCreateInput(activeRow) !== null));

	const updateCell = useCallback((
		rowId: number,
		key: FactureGlobaleColumnKey,
		value: FactureGlobaleCellValue,
	) => {
		if (!canEditRows) return;
		if (key === "refSocial" || key === "majT5") return;
		if (activeRowId !== null && activeRowId !== rowId) return;

		const row = rows.find((item) => item.id === rowId);
		if (!row) return;

		const mode = row.refSocial.trim() ? "update" : "create";
		if (mode === "create" && !createKeys.has(key)) return;
		if (mode === "update" && !updateKeys.has(key)) return;

		if (activeRowId === null) {
			setActiveRowId(rowId);
			setOriginalRow(row);
			setActiveMode(mode);
			setActiveWasAddRow(rowId === addRowId);
		}

		setSaveError(null);
		onCellChange(rowId, key, value);
	}, [activeRowId, addRowId, canEditRows, onCellChange, rows]);

	const saveActiveRow = useCallback(async () => {
		if (!canEditRows) return false;
		if (activeRowId === null || !originalRow || !activeMode || isSaving) return false;
		const currentRow = rows.find((row) => row.id === activeRowId);
		if (!currentRow) {
			setSaveError("La ligne active n’a pas été trouvée.");
			return false;
		}

		try {
			if (activeMode === "create") {
				if (!activeWasAddRow) {
					setSaveError("Seule la ligne d’ajout peut créer une facture.");
					return false;
				}

				const input = getCreateInput(currentRow);
				if (!input) {
					setSaveError("Complétez la date de réception, le numéro, la date de facture, l’établissement, sa localité et le montant total.");
					return false;
				}
				await saveNewInvoice(input);
			} else {
				if (!originalRow.refSocial.trim()) {
					setSaveError("La référence sociale est obligatoire pour modifier une facture.");
					return false;
				}

				const changes = getChangedValues(originalRow, currentRow);
				if (Object.keys(changes).length > 0) {
					await modifyInvoice(originalRow.refSocial, changes);
				}
			}
		} catch (error) {
			setSaveError(error instanceof Error ? error.message : "L’enregistrement a échoué.");
			return false;
		}

		setActiveRowId(null);
		setOriginalRow(null);
		setActiveMode(null);
		setActiveWasAddRow(false);
		setSaveError(null);
		setIsRefreshing(true);
		try {
			await onMutationSuccess(activeMode === "create");
			return true;
		} catch (error) {
			setSaveError(error instanceof Error
				? `Enregistrement réussi, mais le rechargement des factures a échoué : ${error.message}`
				: "Enregistrement réussi, mais le rechargement des factures a échoué.");
			return true;
		} finally {
			setIsRefreshing(false);
		}
	}, [
		activeMode,
		activeRowId,
		activeWasAddRow,
		canEditRows,
		isSaving,
		modifyInvoice,
		onMutationSuccess,
		originalRow,
		rows,
		saveNewInvoice,
	]);

	const cancelActiveRow = useCallback(() => {
		if (activeRowId === null || !originalRow || isSaving) return;
		onRowCancel(activeRowId, originalRow, activeWasAddRow);
		setActiveRowId(null);
		setOriginalRow(null);
		setActiveMode(null);
		setActiveWasAddRow(false);
		setSaveError(null);
	}, [activeRowId, activeWasAddRow, isSaving, onRowCancel, originalRow]);

	const clearSaveError = useCallback(() => setSaveError(null), []);

	return {
		activeRowId,
		hasActiveRow: activeRowId !== null,
		canSave,
		isSaving,
		saveError,
		clearSaveError,
		onCellChange: updateCell,
		saveActiveRow,
		cancelActiveRow,
	};
}
