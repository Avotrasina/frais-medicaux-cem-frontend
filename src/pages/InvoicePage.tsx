
import { useState } from "react";
import { FactureGlobaleTable } from "../features/invoice";
import { AddRowButton, CancelRowButton, ConfirmDialog, LoadingState, PageHeader, SaveRowButton, ToastViewport } from "../components/ui";
import InvoiceFloatingCalculator from "../features/invoice/components/ui/InvoiceFloatingCalculator";
import useFactureGlobaleRows from "../features/invoice/hooks/useFactureGlobaleRows";
import useInvoiceRowEditing from "../features/invoice/hooks/useInvoiceRowEditing";
import useScrollToAddInvoiceRow from "../features/invoice/hooks/useScrollToAddInvoiceRow";

export default function FactureGlobalePage() {
	const [isSaveConfirmationOpen, setIsSaveConfirmationOpen] = useState(false);
	const { rows, addRowId, isLoaded, updateCell, restoreRow } = useFactureGlobaleRows();
	const rowEditing = useInvoiceRowEditing(rows, addRowId, updateCell, restoreRow);
	const { containerRef, addRowRef, focusAddRow } = useScrollToAddInvoiceRow(isLoaded);

	return (
		<>
			<ToastViewport />
			<ConfirmDialog
				open={isSaveConfirmationOpen}
				title="Confirmer l’enregistrement"
				confirmLabel="Enregistrer"
				variant="primary"
				message="Voulez-vous vraiment enregistrer les modifications?"
				onCancel={() => setIsSaveConfirmationOpen(false)}
				onConfirm={() => {
					void rowEditing.saveActiveRow();
					setIsSaveConfirmationOpen(false);
				}}
			/>
			<div className="flex h-[calc(100dvh-13rem)] min-h-[24rem] flex-col lg:h-[calc(100dvh-14rem)]">
				<PageHeader
					title="Factures globales"
					description="Suivi des factures, des montants pris en charge et de leur circuit de validation. Cliquez sur une cellule pour la modifier."
				/>
				<section className="panel flex min-h-0 flex-1 flex-col overflow-hidden">
					{isLoaded ? (
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
						ariaLabel="Annuler les modifications de la ligne"
						title="Annuler les modifications"
						disabled={!rowEditing.canSave}
						onClick={rowEditing.cancelActiveRow}
					/>
				</div>
				<div className="fixed bottom-12 right-48 z-20">
					<SaveRowButton
						ariaLabel="Enregistrer les modifications de la ligne"
						title="Enregistrer les modifications"
						disabled={!rowEditing.canSave}
						onClick={() => setIsSaveConfirmationOpen(true)}
					/>
				</div>
				<div className="fixed bottom-12 right-8 z-20">
					<AddRowButton
						ariaLabel="Ajouter une ligne"
						title="Ajouter une ligne"
						disabled={rowEditing.canSave}
						onClick={focusAddRow}
					/>
				</div>
			</>}
		</>
	);
}
