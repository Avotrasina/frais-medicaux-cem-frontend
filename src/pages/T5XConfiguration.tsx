import { useMemo, useState } from "react";
import { AddRowButton, CancelRowButton, ConfirmDialog, ErrorBlock, LoadingState, PageHeader, SaveRowButton } from "../components/ui";
import T5XActsTable from "../features/t5x/components/T5XActsTable";
import T5XTypesTable from "../features/t5x/components/T5XCategoriesTable";
import useT5XActs from "../features/t5x/hooks/useT5XActs";
import useT5XCategories from "../features/t5x/hooks/useT5XCategories";
import useScrollToT5XAddRow, { type T5XTableKey } from "../features/t5x/hooks/useScrollToT5XAddRow";

export default function T5XConfigurationPage() {
	const [activeTable, setActiveTable] = useState<"categories" | "actes">("categories");
	const [isSaveConfirmationOpen, setIsSaveConfirmationOpen] = useState(false);
	const categoryTable = useT5XCategories();
	const categories = useMemo(
		() => categoryTable.rows
			.filter((row) => row.id !== categoryTable.addRowId && row.nom.trim())
			.map(({ id, nom }) => ({ id, nom })),
		[categoryTable.addRowId, categoryTable.rows],
	);
	const actTable = useT5XActs(categories);
	const isLoading = categoryTable.isLoading || actTable.isLoading;
	const loadError = categoryTable.loadError ?? actTable.loadError;
	const reloadTables = async () => {
		await Promise.all([categoryTable.reload(), actTable.reload()]);
	};
	const activeEditor = activeTable === "categories" ? categoryTable : actTable;
	const hasActiveRow = categoryTable.activeRowId !== null || actTable.activeRowId !== null;
	const tableKey: T5XTableKey = activeTable === "categories" ? "categories" : "acts";
	const activeAddRowId = activeTable === "categories" ? categoryTable.addRowId : actTable.addRowId;
	const {
		categoriesContainerRef,
		categoriesAddRowRef,
		actsContainerRef,
		actsAddRowRef,
		focusAddRow,
	} = useScrollToT5XAddRow(!isLoading, tableKey, activeAddRowId);

	return (
		<>
		<ConfirmDialog
			open={isSaveConfirmationOpen}
			title="Confirmer l’enregistrement"
			confirmLabel="Enregistrer"
			confirmDisabled={activeEditor.isSaving}
			variant="primary"
			message={activeEditor.activeRowId === activeAddRowId
				? "Voulez-vous vraiment ajouter cette ligne ?"
				: "Voulez-vous vraiment enregistrer les modifications de cette ligne ?"}
			onCancel={() => setIsSaveConfirmationOpen(false)}
			onConfirm={async () => {
				const saved = await activeEditor.saveActiveRow();
				if (saved) setIsSaveConfirmationOpen(false);
			}}
		/>
		<div className="flex h-[calc(100dvh-10rem)] min-h-[24rem] flex-col">
			<PageHeader
				title="Gestion des prestations/actes"
				description="Gérez les prestations / actes et leurs catégories. Vous pouvez ajouter, modifier ou supprimer des entrées dans les tableaux ci-dessous."
			/>
			<div className="mb-4 flex flex-wrap gap-2" role="tablist" aria-label="Tableaux de configuration T5">
				<button
					type="button"
					role="tab"
					aria-selected={activeTable === "categories"}
					disabled={hasActiveRow && activeTable !== "categories"}
					className={`rounded-lg px-4 py-2 text-sm font-semibold transition ${activeTable === "categories" ? "bg-red-600 text-white shadow-sm" : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-100"}`}
					onClick={() => setActiveTable("categories")}
				>
					Catégories acte
				</button>
				<button
					type="button"
					role="tab"
					aria-selected={activeTable === "actes"}
					disabled={hasActiveRow && activeTable !== "actes"}
					className={`rounded-lg px-4 py-2 text-sm font-semibold transition ${activeTable === "actes" ? "bg-red-600 text-white shadow-sm" : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-100"}`}
					onClick={() => setActiveTable("actes")}
				>
					Actes
				</button>
			</div>
			<section className="panel flex min-h-0 flex-1 flex-col overflow-hidden">
				{loadError && (
					<div className="p-3 pb-0">
						<ErrorBlock
							message={loadError}
							onRetry={() => void reloadTables()}
						/>
					</div>
				)}
				{isLoading ? (
					<LoadingState message="Chargement des données..." />
				) : activeTable === "categories" ? (
					<>
						{categoryTable.saveError && <ErrorBlock message={categoryTable.saveError} />}
						<T5XTypesTable
							rows={categoryTable.rows}
							addRowId={categoryTable.addRowId}
							activeRowId={categoryTable.activeRowId}
							containerRef={categoriesContainerRef}
							addRowRef={categoriesAddRowRef}
							onCellChange={categoryTable.updateCell}
						/>
					</>
				) : (
					<>
						{actTable.saveError && <ErrorBlock message={actTable.saveError} />}
						<T5XActsTable
							rows={actTable.rows}
							categories={actTable.categories}
							addRowId={actTable.addRowId}
							activeRowId={actTable.activeRowId}
							containerRef={actsContainerRef}
							addRowRef={actsAddRowRef}
							onCellChange={actTable.updateCell}
						/>
					</>
				)}
			</section>
		</div>
		{!isLoading && (
			<div className="fixed bottom-12 right-8 z-20 flex items-center gap-3">
				<SaveRowButton
					disabled={!activeEditor.canSaveRow || activeEditor.isSaving}
					onClick={() => setIsSaveConfirmationOpen(true)}
				/>
				<CancelRowButton
					ariaLabel="Annuler les modifications de la ligne active"
					title="Annuler les modifications de la ligne active"
					disabled={activeEditor.activeRowId === null || activeEditor.isSaving}
					onClick={activeEditor.cancelActiveRow}
				/>
				<AddRowButton disabled={activeEditor.activeRowId !== null} onClick={() => focusAddRow(tableKey)} />
			</div>
		)}
		</>
	);
}
