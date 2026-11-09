import { useCallback, useEffect, useRef, useState } from "react";
import AddRowButton from "../components/ui/AddRowButton";
import CancelRowButton from "../components/ui/CancelRowButton";
import { ConfirmDialog } from "../components/ui/ConfirmDialog";
import { ErrorBlock } from "../components/ui/Feedback";
import LoadingState from "../components/ui/LoadingState";
import { PageHeader } from "../components/ui/PageHeader";
import SaveRowButton from "../components/ui/SaveRowButton";
import T6Table from "../features/t6/components/T6Table";
import useT6CodeAutofill from "../features/t6/hooks/useT6CodeAutofill";
import useT6IdpAutofill from "../features/t6/hooks/useT6IdpAutofill";
import useT6RefSocialAutofill from "../features/t6/hooks/useT6RefSocialAutofill";
import useT6RowEditing from "../features/t6/hooks/useT6RowEditing";
import useT6Rows from "../features/t6/hooks/useT6Rows";
import type { T6CellValue, T6EditableKey } from "../features/t6/types/t6Row";

export default function T6Page() {
	const [isSaveConfirmationOpen, setIsSaveConfirmationOpen] = useState(false);
	const containerRef = useRef<HTMLDivElement>(null);
	const addRowRef = useRef<HTMLTableRowElement>(null);
	const { rows, addRowId, isLoading, isLoaded, loadError, reload, updateCell, restoreRow, persistRow } = useT6Rows();
	const rowEditing = useT6RowEditing(rows, addRowId, updateCell, restoreRow, persistRow);
	const editCell = rowEditing.onCellChange;
	const activeRowId = rowEditing.activeRowId;
	const cancelRowAction = rowEditing.cancelActiveRow;
	const {
		fill: fillByRefSocial,
		cancelRow: cancelRefSocial,
		loadingCells: refSocialLoadingCells,
		error: refSocialError,
	} = useT6RefSocialAutofill(updateCell);
	const {
		fill: fillByIdp,
		cancelRow: cancelIdp,
		loadingCells: idpLoadingCells,
		error: idpError,
	} = useT6IdpAutofill(updateCell);
	const {
		fill: fillByCode,
		cancelRow: cancelCode,
		loadingCells: codeLoadingCells,
		error: codeError,
	} = useT6CodeAutofill(updateCell);
	const loadingCells = new Set([
		...refSocialLoadingCells,
		...idpLoadingCells,
		...codeLoadingCells,
	]);
	const autofillError = refSocialError ?? idpError ?? codeError;
	const handleCellChange = useCallback((rowId: number, key: T6EditableKey, value: T6CellValue) => {
		editCell(rowId, key, value);
		if (typeof value !== "string") return;
		if (key === "refSocial") void fillByRefSocial(rowId, value);
		if (key === "idp") void fillByIdp(rowId, value);
		if (key === "code") void fillByCode(rowId, value);
	}, [editCell, fillByCode, fillByIdp, fillByRefSocial]);
	const { beginAddRow } = rowEditing;
	const cancelActiveRow = useCallback(() => {
		if (activeRowId !== null) {
			cancelRefSocial(activeRowId);
			cancelIdp(activeRowId);
			cancelCode(activeRowId);
		}
		cancelRowAction();
	}, [activeRowId, cancelCode, cancelIdp, cancelRefSocial, cancelRowAction]);

	useEffect(() => {
		if (isLoading || loadError || !containerRef.current) return;
		containerRef.current.scrollTop = containerRef.current.scrollHeight;
		addRowRef.current?.focus({ preventScroll: true });
	}, [isLoading, loadError]);

	const startAddRow = useCallback(() => {
		beginAddRow();
		addRowRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "nearest" });
	}, [beginAddRow]);

	return (
		<>
			<ConfirmDialog
				open={isSaveConfirmationOpen}
				title="Confirmer l’enregistrement"
				confirmLabel="Enregistrer"
				confirmDisabled={rowEditing.isSaving || loadingCells.size > 0}
				variant="primary"
				message="Voulez-vous vraiment enregistrer les modifications de cette ligne ?"
				onCancel={() => setIsSaveConfirmationOpen(false)}
				onConfirm={async () => {
					if (await rowEditing.saveActiveRow()) setIsSaveConfirmationOpen(false);
				}}
			/>
			<div className="flex h-[calc(100dvh-13rem)] min-h-[24rem] flex-col lg:h-[calc(100dvh-14rem)]">
				<PageHeader
					title="Retenues sur salaire"
					description="Consultez et filtrez les retenues sur salaire. Cliquez sur une cellule modifiable pour éditer sa ligne, puis enregistrez-la."
				/>
				{autofillError && (
					<p role="alert" className="mb-2 rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700">
						{autofillError}
					</p>
				)}
				{rowEditing.saveError && (
					<p role="alert" className="mb-2 rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700">
						{rowEditing.saveError}
					</p>
				)}
				<section className="panel flex min-h-0 flex-1 flex-col overflow-hidden">
					{loadError ? (
						<ErrorBlock message={loadError} onRetry={async () => {
							if (await reload()) rowEditing.clearSaveError();
						}} />
					) : isLoaded ? (
						<T6Table
							rows={rows}
							addRowId={addRowId}
							activeRowId={rowEditing.activeRowId}
							containerRef={containerRef}
							addRowRef={addRowRef}
							loadingCells={loadingCells}
							onAddRow={startAddRow}
							onCellChange={handleCellChange}
						/>
					) : (
						<LoadingState message="Chargement des données…" />
					)}
				</section>
			</div>
			{isLoaded && !loadError && (
				<div className="fixed bottom-12 right-8 z-30 flex items-center gap-3">
					<CancelRowButton
						ariaLabel="Annuler les modifications de la ligne T6"
						title="Annuler les modifications"
						disabled={!rowEditing.hasActiveRow || rowEditing.isSaving}
						onClick={cancelActiveRow}
					/>
					<SaveRowButton
						ariaLabel="Enregistrer la ligne T6"
						title="Enregistrer la ligne"
						disabled={!rowEditing.canSave || rowEditing.isSaving || loadingCells.size > 0}
						onClick={() => setIsSaveConfirmationOpen(true)}
					/>
					<AddRowButton
						ariaLabel="Ajouter une retenue T6"
						title="Ajouter une retenue T6"
						disabled={rowEditing.hasActiveRow}
						onClick={startAddRow}
					/>
				</div>
			)}
		</>
	);
}
