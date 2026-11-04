import { useCallback, useMemo, useState } from "react";
import { useLookupRefresh } from "../context/LookupContext";
import {
	createT5RowMock,
	updateT5RowMock,
	type T5Row,
	type T5TableKind,
	type T5Update,
} from "../mocks/idpLookup";

type ReferencedRow = {
	id: number;
	refSocial: string;
	dateActe: string;
	libelle: string;
	montantActe: number;
};

type EditableKey = "dateActe" | "libelle" | "montantActe";
type EditableValue = string | number;

function getChangedValues<T extends ReferencedRow>(original: T, current: T) {
	const changes: T5Update = {
		refSocial: current.refSocial,
	};
	if (original.dateActe !== current.dateActe) changes.dateActe = current.dateActe;
	if (original.libelle !== current.libelle) changes.libelle = current.libelle;
	if (original.montantActe !== current.montantActe) changes.montantActe = current.montantActe;
	return changes;
}

function isValidForCreate(row: ReferencedRow): boolean {
	return Boolean(
		row.refSocial.trim()
		&& row.dateActe.trim()
		&& row.libelle.trim()
		&& Number.isFinite(row.montantActe),
	);
}

export default function useT5RowsByRefSocial<T extends T5Row>(
	sourceRows: T[] | undefined,
	refSocial: string | undefined,
	createEmptyRow: (id: number, refSocial: string) => T,
	table: T5TableKind,
) {
	const refreshLookup = useLookupRefresh();
	const [storedRows, setStoredRows] = useState<T[] | null>(null);
	const [editedSource, setEditedSource] = useState<{ rows: T[]; refSocial: string } | null>(null);
	const [activeRowId, setActiveRowId] = useState<number | null>(null);
	const [originalRow, setOriginalRow] = useState<T | null>(null);
	const [activeIsNew, setActiveIsNew] = useState(false);
	const [isSaving, setIsSaving] = useState(false);
	const [saveError, setSaveError] = useState<string | null>(null);

	const baseRows = useMemo(() => {
		if (!sourceRows || !refSocial) return [];
		const loadedRows = sourceRows.map((row) => ({ ...row }));
		if (!loadedRows.some((row) => row.refSocial === refSocial)) {
			const nextId = Math.max(0, ...loadedRows.map((row) => row.id)) + 1;
			loadedRows.push(createEmptyRow(nextId, refSocial));
		}
		return loadedRows;
	}, [createEmptyRow, refSocial, sourceRows]);
	const hasCurrentEdits = Boolean(
		sourceRows && refSocial
		&& editedSource?.rows === sourceRows
		&& editedSource.refSocial === refSocial,
	);
	const rows = hasCurrentEdits && storedRows ? storedRows : baseRows;
	const currentActiveRowId = hasCurrentEdits ? activeRowId : null;
	const currentOriginalRow = hasCurrentEdits ? originalRow : null;
	const currentActiveIsNew = hasCurrentEdits && activeIsNew;

	const updateCell = useCallback((rowId: number, key: EditableKey, value: EditableValue) => {
		const isSameSource = editedSource !== null
			&& editedSource.rows === sourceRows
			&& editedSource.refSocial === refSocial;
		const sessionActiveRowId = isSameSource
			? activeRowId
			: null;
		if (sessionActiveRowId !== null && sessionActiveRowId !== rowId) return;
		const row = rows.find((item) => item.id === rowId);
		if (!row) return;

		if (sessionActiveRowId === null) {
			const isNew = !sourceRows?.some((sourceRow) => sourceRow.id === rowId);
			setActiveRowId(rowId);
			setOriginalRow(row);
			setActiveIsNew(isNew);
			setEditedSource(sourceRows && refSocial ? { rows: sourceRows, refSocial } : null);
		}

		setSaveError(null);
		setStoredRows((current) => (current && sessionActiveRowId !== null ? current : rows).map((item) =>
			item.id === rowId ? { ...item, [key]: value } as T : item,
		));
	}, [activeRowId, editedSource, refSocial, rows, sourceRows]);

	const activeRow = rows.find((row) => row.id === currentActiveRowId);
	const canSave = activeRow !== undefined
		&& currentOriginalRow !== null
		&& (currentActiveIsNew
			? isValidForCreate(activeRow)
			: Object.keys(getChangedValues(currentOriginalRow, activeRow)).length > 1);

	const saveActiveRow = useCallback(async () => {
		if (!activeRow || !currentOriginalRow || currentActiveRowId === null || !canSave || isSaving) return false;
		setIsSaving(true);
		setSaveError(null);
		try {
			if (currentActiveIsNew) {
				const { id, refSocial, dateActe, libelle, montantActe } = activeRow;
				if (id !== currentActiveRowId) return false;
				await createT5RowMock<T>(
					table,
					{ refSocial, dateActe, libelle, montantActe },
					activeRow,
				);
			} else {
				const changes = getChangedValues(currentOriginalRow, activeRow);
				await updateT5RowMock(
					table,
					currentActiveRowId,
					changes,
				);
			}

			setActiveRowId(null);
			setOriginalRow(null);
			setActiveIsNew(false);
			try {
				await refreshLookup();
				return true;
			} catch (error) {
				setSaveError(error instanceof Error
					? `Enregistrement réussi, mais l’actualisation des données a échoué : ${error.message}`
					: "Enregistrement réussi, mais l’actualisation des données a échoué.");
				return true;
			}
		} catch (error) {
			setSaveError(error instanceof Error ? error.message : "L’enregistrement T5 a échoué.");
			return false;
		} finally {
			setIsSaving(false);
		}
	}, [activeRow, canSave, currentActiveIsNew, currentActiveRowId, currentOriginalRow, isSaving, refreshLookup, table]);

	const resetActiveRow = useCallback(() => {
		if (currentActiveRowId === null || currentOriginalRow === null || isSaving) return;
		setStoredRows((current) => (current ?? rows).map((row) =>
			row.id === currentActiveRowId ? currentOriginalRow : row,
		));
		setActiveRowId(null);
		setOriginalRow(null);
		setActiveIsNew(false);
		setSaveError(null);
	}, [currentActiveRowId, currentOriginalRow, isSaving, rows]);

	const isReady = Boolean(sourceRows && refSocial);
	const readyRows = useMemo(() => isReady ? rows : [], [isReady, rows]);

	return {
		rows: readyRows,
		isReady,
		activeRowId: currentActiveRowId,
		canSave,
		isSaving,
		saveError,
		updateCell,
		saveActiveRow,
		resetActiveRow,
	};
}
