import { useState } from "react";
import { Plus, Save } from "lucide-react";
import { LoadingState, PageHeader } from "../components/ui";
import T5XConstraintsTable from "../features/t5x/components/T5XConstraintsTable";
import T5XTypesTable from "../features/t5x/components/T5XTypesTable";
import useT5XActs from "../features/t5x/hooks/useT5XActs";
import useT5XCategories from "../features/t5x/hooks/useT5XCategories";
import useScrollToT5XAddRow, { type T5XTableKey } from "../features/t5x/hooks/useScrollToT5XAddRow";

export default function T5XConfigurationPage() {
	const [activeTable, setActiveTable] = useState<"categories" | "actes">("categories");
	const categoryTable = useT5XCategories();
	const actTable = useT5XActs();
	const isLoading = categoryTable.isLoading || actTable.isLoading;
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
					className={`rounded-lg px-4 py-2 text-sm font-semibold transition ${activeTable === "categories" ? "bg-red-600 text-white shadow-sm" : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-100"}`}
					onClick={() => setActiveTable("categories")}
				>
					Catégories acte
				</button>
				<button
					type="button"
					role="tab"
					aria-selected={activeTable === "actes"}
					className={`rounded-lg px-4 py-2 text-sm font-semibold transition ${activeTable === "actes" ? "bg-red-600 text-white shadow-sm" : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-100"}`}
					onClick={() => setActiveTable("actes")}
				>
					Actes
				</button>
			</div>
			<section className="panel flex min-h-0 flex-1 flex-col overflow-hidden">
				{isLoading ? (
					<LoadingState message="Chargement des données..." />
				) : activeTable === "categories" ? (
					<T5XTypesTable
						rows={categoryTable.rows}
						addRowId={categoryTable.addRowId}
						containerRef={categoriesContainerRef}
						addRowRef={categoriesAddRowRef}
						onCellChange={categoryTable.updateCell}
					/>
				) : (
					<T5XConstraintsTable
						rows={actTable.rows}
						categories={actTable.categories}
						addRowId={actTable.addRowId}
						containerRef={actsContainerRef}
						addRowRef={actsAddRowRef}
						onCellChange={actTable.updateCell}
					/>
				)}
			</section>
		</div>
		{!isLoading && (
			<div className="fixed bottom-12 right-8 z-20 flex items-center gap-3">
				<button
					type="button"
					className="flex h-14 w-14 items-center justify-center rounded-full bg-slate-900 text-white shadow-lg transition hover:bg-slate-800 focus:outline-none focus:ring-4 focus:ring-slate-300 disabled:cursor-not-allowed disabled:bg-blue-700 disabled:text-white disabled:opacity-100"
					aria-label="Enregistrer la ligne"
					title="Enregistrer la ligne"
					disabled={activeTable === "categories" ? !categoryTable.canSaveRow : !actTable.canSaveRow}
					onClick={activeTable === "categories" ? categoryTable.saveAddRow : actTable.saveAddRow}
				>
					<Save size={23} strokeWidth={2.4} />
				</button>
				<button
					type="button"
					className="flex h-14 w-14 items-center justify-center rounded-full bg-slate-900 text-white shadow-lg transition hover:bg-slate-800 focus:outline-none focus:ring-4 focus:ring-slate-300"
					aria-label="Aller à la ligne d’ajout"
					title="Aller à la ligne d’ajout"
					onClick={() => focusAddRow(tableKey)}
				>
					<Plus size={26} strokeWidth={2.5} />
				</button>
			</div>
		)}
		</>
	);
}
