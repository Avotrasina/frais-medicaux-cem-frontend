import { useMemo, useState } from "react";
import {
	AddRowButton,
	CancelRowButton,
	ConfirmDialog,
	DeleteRowButton,
	ErrorBlock,
	LoadingState,
	PageHeader,
	SaveRowButton,
} from "../components/ui";
import T5XActsTable from "../features/t5x/components/T5XActsTable";
import T5XTypesTable from "../features/t5x/components/T5XCategoriesTable";
import useT5XActs from "../features/t5x/hooks/useT5XActs";
import useT5XCategories from "../features/t5x/hooks/useT5XCategories";
import useT5XPlafonds from "../features/t5x/hooks/useT5XPlafonds";
import useScrollToT5XAddRow, { type T5XTableKey } from "../features/t5x/hooks/useScrollToT5XAddRow";
import { hasCategoryConstraint } from "../features/t5x/utils/t5xConstraintRules";

export default function T5XConfigurationPage() {
	const [activeTable, setActiveTable] = useState<"categories" | "actes">("categories");
	const [isSaveConfirmationOpen, setIsSaveConfirmationOpen] = useState(false);
	const [isConstraintResetOpen, setIsConstraintResetOpen] = useState(false);
	const [isDeleteConfirmationOpen, setIsDeleteConfirmationOpen] = useState(false);
	const [actionError, setActionError] = useState<string | null>(null);
	const plafonds = useT5XPlafonds();
	const categoryTable = useT5XCategories();
	const categories = useMemo(
		() => categoryTable.rows
			.filter((row) => row.id !== categoryTable.addRowId && row.nom.trim())
			.map(({ id, nom, typeContrainte, plafondActe, plafondAn, nombreSeances }) => ({
				id, nom, typeContrainte, plafondActe, plafondAn, nombreSeances,
			})),
		[categoryTable.addRowId, categoryTable.rows],
	);
	const actTable = useT5XActs(categories, plafonds.index);
	const isLoading = categoryTable.isLoading || actTable.isLoading;
	const loadError = categoryTable.loadError ?? actTable.loadError;
	const reloadTables = async (silent = false) => {
		await Promise.all([
			categoryTable.reload(silent),
			actTable.reload(silent),
			plafonds.reload(),
		]);
	};
	const activeEditor = activeTable === "categories" ? categoryTable : actTable;
	const hasActiveRow = categoryTable.activeRowId !== null || actTable.activeRowId !== null;
	const tableKey: T5XTableKey = activeTable === "categories" ? "categories" : "acts";
	const activeAddRowId = activeTable === "categories" ? categoryTable.addRowId : actTable.addRowId;
	const activeRowId = activeTable === "categories" ? categoryTable.activeRowId : actTable.activeRowId;
	const selectedRowId = activeTable === "categories" ? categoryTable.selectedRowId : actTable.selectedRowId;
	const {
		categoriesContainerRef,
		categoriesAddRowRef,
		actsContainerRef,
		actsAddRowRef,
		focusAddRow,
	} = useScrollToT5XAddRow(!isLoading, tableKey, activeAddRowId);

	const editingCategory = activeTable === "categories"
		? categoryTable.rows.find((row) => row.id === categoryTable.activeRowId) ?? null
		: null;
	const targetRowId = selectedRowId ?? activeRowId;
	const targetCategory = activeTable === "categories"
		? categoryTable.rows.find((row) => row.id === targetRowId) ?? null
		: null;
	const targetAct = activeTable === "actes"
		? actTable.rows.find((row) => row.id === targetRowId) ?? null
		: null;

	const constraintReset = useMemo(() => {
		if (!editingCategory || !hasCategoryConstraint(editingCategory)) return null;
		const acteIds = actTable.rows
			.filter((row) => row.contraintePropre && row.categorieId === editingCategory.id)
			.map((row) => row.id);
		if (acteIds.length === 0) return null;
		return { count: acteIds.length, categorieNom: editingCategory.nom };
	}, [actTable.rows, editingCategory]);

	const actesLiees = useMemo(() => {
		if (!targetCategory) return [];
		return actTable.rows.filter((row) => row.categorieId === targetCategory.id);
	}, [actTable.rows, targetCategory]);
	const canDelete = targetRowId !== null && targetRowId !== activeAddRowId;

	const deleteMessage = useMemo(() => {
		if (targetCategory) {
			const nombre = actesLiees.length;
			const avecContrainte = actesLiees.filter((row) => row.contraintePropre).length;
			const liste = actesLiees
				.map((row) => `${row.code} — ${row.nom}`)
				.join(", ");
			return nombre === 0
				? `La suppression de la catégorie « ${targetCategory.nom} » est irréversible : la catégorie et sa contrainte seront définitivement supprimées.`
				: `La suppression de la catégorie « ${targetCategory.nom} » est irréversible : elle supprimera définitivement les ${nombre} acte(s) rattachés (${liste}) ainsi que leurs contraintes${avecContrainte > 0 ? ` (${avecContrainte} acte(s) portent leur propre contrainte)` : ""}. Si un de ces actes est utilisé dans un suivi ou une facture, la suppression sera refusée.`;
		}
		if (targetAct) {
			return `La suppression de l’acte « ${targetAct.code} — ${targetAct.nom} » est irréversible : l’acte et ses contraintes seront définitivement supprimés.`;
		}
		return "La suppression de cette ligne est irréversible.";
	}, [actesLiees, targetAct, targetCategory]);

	const handleTabChange = (table: "categories" | "actes") => {
		setActiveTable(table);
		categoryTable.resetSelection();
		actTable.resetSelection();
	};

	const handleSaveClick = () => {
		if (constraintReset) {
			setIsConstraintResetOpen(true);
			return;
		}
		setIsSaveConfirmationOpen(true);
	};

	const handleDelete = async () => {
		if (targetRowId === null) return;
		try {
			if (activeTable === "categories") await categoryTable.deleteRow(targetRowId);
			else await actTable.deleteRow(targetRowId);
			setIsDeleteConfirmationOpen(false);
			setActionError(null);
			if (activeEditor.activeRowId !== null) activeEditor.cancelActiveRow();
			categoryTable.resetSelection();
			actTable.resetSelection();
			await reloadTables(true);
		} catch (error) {
			setActionError(
				error instanceof Error ? error.message : "La suppression a échoué.",
			);
		}
	};

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
				if (saved) {
					setIsSaveConfirmationOpen(false);
					await reloadTables(true);
				}
			}}
		/>
		<ConfirmDialog
			open={isConstraintResetOpen}
			title="Contrainte de la catégorie"
			confirmLabel="Poser la contrainte"
			confirmDisabled={activeEditor.isSaving}
			message={constraintReset
				? `La catégorie « ${constraintReset.categorieNom} » va porter une contrainte : les contraintes propres de ${constraintReset.count} acte(s) seront effacées. Cette opération est appliquée côté serveur en une seule transaction.`
				: ""}
			onCancel={() => setIsConstraintResetOpen(false)}
			onConfirm={async () => {
				const saved = await activeEditor.saveActiveRow();
				if (saved) {
					setIsConstraintResetOpen(false);
					await reloadTables(true);
				}
			}}
		/>
		<ConfirmDialog
			open={isDeleteConfirmationOpen}
			title="Confirmer la suppression"
			confirmLabel="Supprimer"
			confirmDisabled={activeEditor.isSaving}
			message={deleteMessage}
			onCancel={() => setIsDeleteConfirmationOpen(false)}
			onConfirm={handleDelete}
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
					onClick={() => handleTabChange("categories")}
				>
					Catégories acte
				</button>
				<button
					type="button"
					role="tab"
					aria-selected={activeTable === "actes"}
					disabled={hasActiveRow && activeTable !== "actes"}
					className={`rounded-lg px-4 py-2 text-sm font-semibold transition ${activeTable === "actes" ? "bg-red-600 text-white shadow-sm" : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-100"}`}
					onClick={() => handleTabChange("actes")}
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
				{actionError && (
					<div className="p-3 pb-0">
						<ErrorBlock message={actionError} />
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
							selectedRowId={categoryTable.selectedRowId}
							onRowSelect={categoryTable.selectRow}
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
							selectedRowId={actTable.selectedRowId}
							onRowSelect={actTable.selectRow}
							containerRef={actsContainerRef}
							addRowRef={actsAddRowRef}
							onCellChange={actTable.updateCell}
						/>
					</>
				)}
				{!isLoading && (
					<div className="flex shrink-0 items-center justify-end gap-3 border-t border-slate-200 bg-white px-4 py-3">
						<DeleteRowButton
							ariaLabel="Supprimer la ligne sélectionnée"
							title="Supprimer la ligne sélectionnée"
							disabled={!canDelete}
							onClick={() => setIsDeleteConfirmationOpen(true)}
						/>						<SaveRowButton
							disabled={!activeEditor.canSaveRow || activeEditor.isSaving}
							onClick={handleSaveClick}
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
			</section>
		</div>
		</>
	);
}
