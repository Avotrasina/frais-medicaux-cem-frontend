
import { useState } from "react";
import { FactureGlobaleTable } from "../features/invoice";
import { AddRowButton, CancelRowButton, ConfirmDialog, ErrorBlock, LoadingState, PageHeader, SaveRowButton, ToastViewport } from "../components/ui";
import InvoiceFloatingCalculator from "../features/invoice/components/ui/InvoiceFloatingCalculator";
import useFactureGlobaleRows from "../features/invoice/hooks/useFactureGlobaleRows";
import useInvoiceRowEditing from "../features/invoice/hooks/useInvoiceRowEditing";
import useScrollToAddInvoiceRow from "../features/invoice/hooks/useScrollToAddInvoiceRow";

export default function FactureGlobalePage() {
	const [isSaveConfirmationOpen, setIsSaveConfirmationOpen] = useState(false);
	const { rows, addRowId, isLoaded, loadError, reload, updateCell, refreshRows, restoreRow } = useFactureGlobaleRows();
	const rowEditing = useInvoiceRowEditing(rows, addRowId, updateCell, restoreRow, refreshRows);
	const { containerRef, addRowRef, focusAddRow } = useScrollToAddInvoiceRow(isLoaded);

	return (
		<>
			<ToastViewport />
			<ConfirmDialog
				open={isSaveConfirmationOpen}
				title="Confirmer l’enregistrement"
				confirmLabel="Enregistrer"
				confirmDisabled={rowEditing.isSaving}
				variant="primary"
				message="Voulez-vous vraiment enregistrer les modifications?"
				onCancel={() => setIsSaveConfirmationOpen(false)}
				onConfirm={async () => {
					const saved = await rowEditing.saveActiveRow();
					if (saved) setIsSaveConfirmationOpen(false);
				}}
			/>
			<div className="flex h-[calc(100dvh-13rem)] min-h-[24rem] flex-col lg:h-[calc(100dvh-14rem)]">
				<PageHeader
					title="Factures globales"
					description="Suivi des factures, des montants pris en charge et de leur circuit de validation. Cliquez sur une cellule pour la modifier."
				/>
				{rowEditing.saveError && (
					<p role="alert" className="mb-2 rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700">
						{rowEditing.saveError}
					</p>
				)}
				<section className="panel flex min-h-0 flex-1 flex-col overflow-hidden">
					{loadError ? (
						<ErrorBlock
							message={loadError}
							onRetry={async () => {
								if (await reload()) rowEditing.clearSaveError();
							}}
						/>
					) : isLoaded ? (
						<FactureGlobaleTable
							rows={rows}
							addRowId={addRowId}
							activeRowId={rowEditing.activeRowId}
							containerRef={containerRef}
							addRowRef={addRowRef}
							onCellChange={rowEditing.onCellChange}
						/>
					) : (
						<LoadingState message="Chargement des données…" />
					)}
				</section>
			</div>
			{isLoaded && <>
				<InvoiceFloatingCalculator />
				<div className="fixed bottom-12 right-[17rem] z-20">
					<CancelRowButton
						ariaLabel="Réinitialiser la ligne active"
						title="Réinitialiser la ligne active"
						disabled={!rowEditing.hasActiveRow || rowEditing.isSaving}
						onClick={rowEditing.cancelActiveRow}
					/>
				</div>
				<div className="fixed bottom-12 right-48 z-20">
					<SaveRowButton
						ariaLabel="Enregistrer les modifications de la ligne"
						title="Enregistrer les modifications"
						disabled={!rowEditing.canSave || rowEditing.isSaving}
						onClick={() => setIsSaveConfirmationOpen(true)}
					/>
				</div>
				<div className="fixed bottom-12 right-8 z-20">
					<AddRowButton
						ariaLabel="Ajouter une ligne"
						title="Ajouter une ligne"
						disabled={rowEditing.hasActiveRow}
						onClick={focusAddRow}
					/>
				</div>
			</>}
		</>
	);
}
