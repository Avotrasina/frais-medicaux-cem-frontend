
import { FactureGlobaleTable } from "../features/invoice";
import { AddRowButton, LoadingState, PageHeader, ToastViewport } from "../components/ui";
import useFactureGlobaleRows from "../features/invoice/hooks/useFactureGlobaleRows";
import useScrollToAddInvoiceRow from "../features/invoice/hooks/useScrollToAddInvoiceRow";

export default function FactureGlobalePage() {
	const { rows, addRowId, isLoaded, updateCell } = useFactureGlobaleRows();
	const { containerRef, addRowRef, focusAddRow } = useScrollToAddInvoiceRow(isLoaded);

	return (
		<>
			<ToastViewport />
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
							containerRef={containerRef}
							addRowRef={addRowRef}
							onCellChange={updateCell}
						/>
					) : (
						<LoadingState message="Chargement des données…" />
					)}
				</section>
			</div>
			{isLoaded && <div className="fixed bottom-12 right-8 z-20">
				<AddRowButton ariaLabel="Ajouter une ligne" title="Ajouter une ligne" variant="red" onClick={focusAddRow} />
			</div>}
		</>
	);
}
