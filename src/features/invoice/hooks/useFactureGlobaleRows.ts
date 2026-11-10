import { useCallback, useMemo, useState } from "react";
import useGetFactureGlobaleRows from "./useGetFactureGlobaleRows";
import {
	deleteFactureAttachment,
	downloadFactureAttachment,
	uploadFactureAttachment,
} from "../services/serviceAPI";
import { mapFactureAttachment } from "../services/mapFactureAttachment";
import type {
	FactureGlobaleCellValue,
	FactureGlobaleAttachment,
	FactureGlobaleColumnKey,
	FactureGlobaleEditKey,
	FactureGlobaleRow,
} from "../types/invoiceTable";
import type { Prestataire } from "../types/prestataire";
import {
	AMOUNT_SOURCE_KEYS,
	COMPUTED_AMOUNT_KEYS,
	computeFactureGlobaleAmounts,
} from "../utils/invoiceAmounts";


const numericKeys = new Set<FactureGlobaleColumnKey>([
	"montantTotal", "partCem100", "depassement", "partCem80", "partAgent20", "totalPartAgent",
]);

function createEmptyInvoice(id: number): FactureGlobaleRow {
	return {
		id, piecesJointes: [], refSocial: "", dateReception: "", numFacture: "", dateFacture: "", nomEtablissement: "",
		montantTotal: 0, partCem100: 0, depassement: 0, partCem80: 0, partAgent20: 0, totalPartAgent: 0,
		localite: "", moisPrestation: null, refAgence: "", remarques1: "", retourPrestataire: "",
		recuApresModification: "", dateEnregistrement: "", parQuiEnregistrement: "", dateEnvoiValidation: "",
		pourQuiValidation: "", remarques2: "", retourCorrection: "", dateValidation: "",
		parQuiValidationFinale: "", dateSortie: "", serviceSortie: "",
	};
}


function resolveLocalite(
	row: FactureGlobaleRow,
	prestataires: Prestataire[],
): FactureGlobaleRow {
	if (row.localite.trim()) return row;
	const localite = prestataires.find(
		(prestataire) => prestataire.id === row.prestataireId,
	)?.localite;
	return localite ? { ...row, localite } : row;
}

function receptionTimestamp(value: string) {
	if (!value) return Number.POSITIVE_INFINITY;
	const [day, month, year] = value.split("/").map(Number);
	if (!day || !month || !year) return Number.POSITIVE_INFINITY;
	return new Date(year || 0, (month || 1) - 1, day || 1).getTime();
}

function applyCellChange(
	row: FactureGlobaleRow,
	key: FactureGlobaleEditKey,
	value: string | number | Date | null,
): FactureGlobaleRow {
	const updated = { ...row, [key]: value } as FactureGlobaleRow;
	if (!AMOUNT_SOURCE_KEYS.has(key)) return updated;

	return {
		...updated,
		...computeFactureGlobaleAmounts(
			updated.montantTotal,
			updated.partCem100,
			updated.depassement,
		),
	};
}

export default function useFactureGlobaleRows(prestataires: Prestataire[]) {
	const factureRowsQuery = useGetFactureGlobaleRows();
	const reloadRows = factureRowsQuery.reload;
	const [storedDataRows, setStoredDataRows] = useState<FactureGlobaleRow[] | null>(null);
	const [storedAddRow, setStoredAddRow] = useState<FactureGlobaleRow | null>(null);
	const [selectedRowId, setSelectedRowId] = useState<number | null>(null);
	const dataRows = useMemo(
		() => (storedDataRows ?? factureRowsQuery.data ?? [])
			.map((row) => resolveLocalite(row, prestataires)),
		[storedDataRows, factureRowsQuery.data, prestataires],
	);
	const nextId = Math.max(0, ...dataRows.map((row) => row.id)) + 1;
	const addRow = useMemo(
		() => storedAddRow ?? createEmptyInvoice(nextId),
		[storedAddRow, nextId],
	);

	const updateCell = useCallback((rowId: number, key: FactureGlobaleEditKey, value: FactureGlobaleCellValue) => {
		if (key === "piecesJointes") {
			if (!Array.isArray(value)) return;
			if (rowId === addRow.id) {
				setStoredAddRow((current) => ({ ...(current ?? addRow), piecesJointes: value }));
				return;
			}
			setStoredDataRows((current) => (current ?? factureRowsQuery.data ?? [])
				.map((row) => row.id === rowId ? { ...row, piecesJointes: value } : row));
			return;
		}

		if (COMPUTED_AMOUNT_KEYS.has(key)) return;

		const nextValue: string | number | Date | null = key === "moisPrestation"
			? value instanceof Date ? value : null
			: key === "prestataireId" ? (typeof value === "number" ? value : null)
			: numericKeys.has(key) ? (value === "" ? 0 : Number(value)) : typeof value === "string" ? value : "";
		if (rowId === addRow.id) {
			setStoredAddRow((current) => applyCellChange(current ?? addRow, key, nextValue));
			return;
		}
		setStoredDataRows((current) => (current ?? factureRowsQuery.data ?? [])
			.map((row) => row.id === rowId ? applyCellChange(row, key, nextValue) : row)
			.sort((a, b) => receptionTimestamp(a.dateReception) - receptionTimestamp(b.dateReception)));
	}, [addRow, factureRowsQuery.data]);

	const restoreRow = useCallback((rowId: number, originalRow: FactureGlobaleRow, wasAddRow: boolean) => {
		if (wasAddRow) {
			setStoredAddRow((current) => (current ?? addRow).id === rowId ? originalRow : current);
			return;
		}
		setStoredDataRows((current) => (current ?? factureRowsQuery.data ?? [])
			.map((row) => row.id === rowId
				? { ...originalRow, piecesJointes: row.piecesJointes }
				: row)
			.sort((a, b) => receptionTimestamp(a.dateReception) - receptionTimestamp(b.dateReception)));
	}, [addRow, factureRowsQuery.data]);

	const assertEditableAttachmentRow = useCallback((rowId: number) => {
		if (rowId === addRow.id) {
			throw new Error("Créez d’abord la facture avant de gérer ses pièces jointes.");
		}
		if (!dataRows.some((row) => row.id === rowId)) {
			throw new Error("La facture associée aux pièces jointes est introuvable.");
		}
	}, [addRow.id, dataRows]);

	const updateRowAttachments = useCallback((
		rowId: number,
		update: (attachments: FactureGlobaleAttachment[]) => FactureGlobaleAttachment[],
	) => {
		setStoredDataRows((current) => (current ?? factureRowsQuery.data ?? [])
			.map((row) => row.id === rowId
				? { ...row, piecesJointes: update(row.piecesJointes) }
				: row));
	}, [factureRowsQuery.data]);

	const addAttachment = useCallback(async (rowId: number, file: File) => {
		assertEditableAttachmentRow(rowId);
		const piece = await uploadFactureAttachment(rowId, file);
		const attachment = mapFactureAttachment(piece);
		updateRowAttachments(rowId, (attachments) => [...attachments, attachment]);
	}, [assertEditableAttachmentRow, updateRowAttachments]);

	const removeAttachment = useCallback(async (rowId: number, attachmentId: string) => {
		assertEditableAttachmentRow(rowId);
		await deleteFactureAttachment(rowId, Number(attachmentId));
		updateRowAttachments(rowId, (attachments) =>
			attachments.filter((attachment) => attachment.id !== attachmentId));
	}, [assertEditableAttachmentRow, updateRowAttachments]);

	const downloadAttachment = useCallback(
		(rowId: number, attachmentId: string) =>
			downloadFactureAttachment(rowId, Number(attachmentId)),
		[],
	);

	const refreshRows = useCallback(async (created = false) => {
		if (created) setStoredAddRow(null);
		const latestRows = await reloadRows();
		if (!latestRows) {
			throw new Error("Impossible d’actualiser les factures. Réessayez le chargement.");
		}
		setStoredDataRows(latestRows);
		return latestRows;
	}, [reloadRows]);

	const reload = useCallback(async () => {
		const latestRows = await reloadRows();
		if (!latestRows) return false;
		setStoredDataRows(latestRows);
		return true;
	}, [reloadRows]);

	const rows = useMemo(() => [...dataRows, addRow], [dataRows, addRow]);
	const selectRow = useCallback((rowId: number) => {
		setSelectedRowId((current) => (current === rowId ? rowId : rowId));
	}, []);
	return {
		rows,
		addRowId: addRow.id,
		selectedRowId,
		selectRow,
		isLoaded: factureRowsQuery.data !== null && !factureRowsQuery.isLoading,
		loadError: factureRowsQuery.error,
		reload,
		updateCell,
		addAttachment,
		removeAttachment,
		downloadAttachment,
		refreshRows,
		restoreRow,
	};
}
