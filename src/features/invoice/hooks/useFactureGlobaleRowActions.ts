import { useCallback } from "react";
import type { FactureGlobaleRow } from "../types/invoiceTable";
import type { UpdateFactureGlobaleCell, ValidationRole } from "../types/invoiceRowActions";

export default function useFactureGlobaleRowActions(
	rows: FactureGlobaleRow[],
	updateCell: UpdateFactureGlobaleCell,
) {
	const hasRow = useCallback((rowId: number) => {
		return Number.isInteger(rowId) && rows.some((row) => row.id === rowId);
	}, [rows]);

	const requestValidation = useCallback((
		rowId: number,
		validationDate: string,
		validationRole: ValidationRole,
	) => {
		if (!hasRow(rowId)) return false;
		if (!validationDate) return false;
		updateCell(rowId, "dateValidation", validationDate);
		updateCell(rowId, "pourQuiValidation", validationRole);
		updateCell(rowId, "parQuiValidationFinale", "Validation manuelle");
		return true;
	}, [hasRow, updateCell]);

	const validateReviewedInvoice = useCallback((rowId: number) => {
		if (!hasRow(rowId)) return false;
		updateCell(rowId, "dateValidation", new Date().toISOString().slice(0, 10));
		updateCell(rowId, "pourQuiValidation", "Chef");
		return true;
	}, [hasRow, updateCell]);

	const rejectReviewedInvoice = useCallback((rowId: number, correctionComment: string) => {
		if (!hasRow(rowId)) return false;
		const comment = correctionComment.trim();
		if (!comment) return false;
		updateCell(rowId, "remarques2", comment);
		return true;
	}, [hasRow, updateCell]);

	const registerInvoiceExit = useCallback((
		rowId: number,
		sortieDate: string,
		serviceSortie: string,
	) => {
		if (!hasRow(rowId)) return false;
		const service = serviceSortie.trim();
		if (!sortieDate || !service) return false;
		updateCell(rowId, "dateSortie", sortieDate);
		updateCell(rowId, "serviceSortie", service);
		return true;
	}, [hasRow, updateCell]);

	return {
		requestValidation,
		validateReviewedInvoice,
		rejectReviewedInvoice,
		registerInvoiceExit,
	};
}
