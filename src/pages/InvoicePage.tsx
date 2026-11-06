
import { useMemo, useState } from "react";
import { X } from "lucide-react";
import { FactureGlobaleTable } from "../features/invoice";
import { AddRowButton, CancelRowButton, ConfirmDialog, ErrorBlock, LoadingState, PageHeader, SaveRowButton, ToastViewport } from "../components/ui";
import InvoiceFloatingCalculator from "../features/invoice/components/ui/InvoiceFloatingCalculator";
import useFactureGlobaleRows from "../features/invoice/hooks/useFactureGlobaleRows";
import useFactureGlobaleRowActions from "../features/invoice/hooks/useFactureGlobaleRowActions";
import useInvoiceRowEditing from "../features/invoice/hooks/useInvoiceRowEditing";
import useScrollToAddInvoiceRow from "../features/invoice/hooks/useScrollToAddInvoiceRow";
import { useAuth } from "../features/auth";

const validationRoles = ["Adjoint", "Chef"] as const;

type ConfirmableRowAction = "requestValidation" | "reviewValidate" | "reviewReject" | "sortie";

const rowActionConfirmation: Record<ConfirmableRowAction, { title: string; confirmLabel: string; message: string }> = {
	requestValidation: {
		title: "Confirmer l’envoi",
		confirmLabel: "Envoyer",
		message: "Voulez-vous vraiment envoyer cette demande de validation ?",
	},
	reviewValidate: {
		title: "Confirmer la validation",
		confirmLabel: "Valider",
		message: "Voulez-vous vraiment valider cette facture ?",
	},
	reviewReject: {
		title: "Confirmer le rejet",
		confirmLabel: "Rejeter",
		message: "Voulez-vous vraiment rejeter cette facture et demander une correction ?",
	},
	sortie: {
		title: "Confirmer la sortie",
		confirmLabel: "Confirmer",
		message: "Voulez-vous vraiment confirmer la sortie de cette facture ?",
	},
};

export default function FactureGlobalePage() {
	const [isSaveConfirmationOpen, setIsSaveConfirmationOpen] = useState(false);
	const [confirmableRowAction, setConfirmableRowAction] = useState<ConfirmableRowAction | null>(null);
	const [openRowAction, setOpenRowAction] = useState<"validate" | "review" | "sortie" | null>(null);
	const [validationDate, setValidationDate] = useState("");
	const [validationRole, setValidationRole] = useState<(typeof validationRoles)[number]>(validationRoles[0]);
	const [reviewAction, setReviewAction] = useState<"correct" | null>(null);
	const [correctionComment, setCorrectionComment] = useState("");
	const [sortieDate, setSortieDate] = useState("");
	const [serviceSortie, setServiceSortie] = useState("");
	const { role } = useAuth();
	const canEditRows = role !== "Y";
	const { rows, addRowId, selectedRowId, selectRow, isLoaded, loadError, reload, updateCell, refreshRows, restoreRow } = useFactureGlobaleRows();
	const rowActions = useFactureGlobaleRowActions(rows, updateCell);
	const rowEditing = useInvoiceRowEditing(rows, addRowId, updateCell, restoreRow, refreshRows, canEditRows);
	const { containerRef, addRowRef, focusAddRow } = useScrollToAddInvoiceRow(isLoaded);
	const activeRow = useMemo(
		() => rows.find((row) => row.id === selectedRowId) ?? null,
		[rows, selectedRowId],
	);
	const canActOnSelectedRow = selectedRowId !== null && activeRow !== null && !rowEditing.hasActiveRow;

	function resetValidationForm() {
		setValidationDate("");
		setValidationRole(validationRoles[0]);
	}

	function resetReviewForm() {
		setCorrectionComment("");
	}

	function resetSortieForm() {
		setSortieDate("");
		setServiceSortie("");
	}

	function applyValidationToRow() {
		if (!activeRow || !rowActions.requestValidation(activeRow.id, validationDate, validationRole)) return;
		resetValidationForm();
		setOpenRowAction(null);
	}

	function applyReviewDecision() {
		if (!activeRow || reviewAction !== "correct" || !rowActions.rejectReviewedInvoice(activeRow.id, correctionComment)) return;
		resetReviewForm();
		setReviewAction(null);
		setOpenRowAction(null);
	}

	function validateReviewedRow() {
		if (!activeRow || !rowActions.validateReviewedInvoice(activeRow.id)) return;
		setOpenRowAction(null);
	}

	function applySortieDecision() {
		if (!activeRow || !rowActions.registerInvoiceExit(activeRow.id, sortieDate, serviceSortie)) return;
		resetSortieForm();
		setOpenRowAction(null);
	}

	function closeRowAction() {
		setOpenRowAction(null);
		setReviewAction(null);
		resetValidationForm();
		resetReviewForm();
		resetSortieForm();
	}

	function confirmRowAction() {
		if (!confirmableRowAction) return;
		switch (confirmableRowAction) {
			case "requestValidation":
				applyValidationToRow();
				break;
			case "reviewValidate":
				validateReviewedRow();
				break;
			case "reviewReject":
				applyReviewDecision();
				break;
			case "sortie":
				applySortieDecision();
				break;
		}
		setConfirmableRowAction(null);
	}

	return (
		<>
			<ToastViewport />
			<ConfirmDialog
				open={confirmableRowAction !== null}
				title={confirmableRowAction ? rowActionConfirmation[confirmableRowAction].title : "Confirmation"}
				confirmLabel={confirmableRowAction ? rowActionConfirmation[confirmableRowAction].confirmLabel : "Confirmer"}
				variant="primary"
				message={confirmableRowAction ? rowActionConfirmation[confirmableRowAction].message : ""}
				onCancel={() => setConfirmableRowAction(null)}
				onConfirm={confirmRowAction}
			/>
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
					description={canEditRows
						? "Suivi des factures, des montants pris en charge et de leur circuit de validation. Cliquez sur une cellule autorisée pour la modifier."
						: "Consultation des factures et de leur circuit de validation. Les données sont en lecture seule."}
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
							selectedRowId={selectedRowId}
							containerRef={containerRef}
							addRowRef={addRowRef}
							onRowSelect={(rowId) => {
								if (rowEditing.hasActiveRow && rowEditing.activeRowId !== rowId) return;
								selectRow(rowId);
							}}
							onCellChange={rowEditing.onCellChange}
						/>
					) : (
						<LoadingState message="Chargement des données…" />
					)}
				</section>
			</div>
			{isLoaded && <>
				{canEditRows && (
					<div className="fixed bottom-12 right-8 z-30 flex items-center gap-3">
						{canActOnSelectedRow && (
							<button
								type="button"
								className="inline-flex items-center justify-center rounded-full bg-slate-900 px-5 py-3 text-sm font-semibold text-white shadow-lg hover:bg-slate-800"
								onClick={() => {
									resetValidationForm();
									setOpenRowAction("validate");
								}}
							>
								A Valider
							</button>
						)}
						<CancelRowButton
							ariaLabel="Réinitialiser la ligne active"
							title="Réinitialiser la ligne active"
							disabled={!rowEditing.hasActiveRow || rowEditing.isSaving}
							onClick={rowEditing.cancelActiveRow}
						/>
						<SaveRowButton
							ariaLabel="Enregistrer la ligne active"
							title="Enregistrer la ligne active"
							disabled={!rowEditing.canSave || rowEditing.isSaving}
							onClick={() => setIsSaveConfirmationOpen(true)}
						/>
						<AddRowButton
							disabled={rowEditing.hasActiveRow}
							onClick={focusAddRow}
						/>
						<InvoiceFloatingCalculator />
					</div>
				)}
				{!canEditRows && canActOnSelectedRow && (
					<div className="fixed bottom-12 right-8 z-30 flex gap-3">
						<button type="button" className="inline-flex items-center justify-center rounded-full bg-slate-900 px-5 py-3 text-sm font-semibold text-white shadow-lg hover:bg-slate-800" onClick={() => {
							setReviewAction(null);
							setOpenRowAction("review");
						}}>Evaluer</button>
						<button type="button" className="inline-flex items-center justify-center rounded-full bg-white px-5 py-3 text-sm font-semibold text-slate-800 shadow-lg ring-1 ring-slate-200 hover:bg-slate-50" onClick={() => {
							resetSortieForm();
							setOpenRowAction("sortie");
						}}>Sortir</button>
					</div>
				)}
				{canEditRows && canActOnSelectedRow && openRowAction === "validate" && (
					<div className="fixed bottom-28 right-8 z-40 w-[340px] rounded-2xl border border-slate-200 bg-white p-4 shadow-2xl">
						<button type="button" aria-label="Fermer" className="absolute right-3 top-3 rounded-full p-1 text-slate-500 hover:bg-slate-100 hover:text-slate-900" onClick={closeRowAction}><X size={18} /></button>
						<h3 className="mb-3 pr-8 text-sm font-bold text-slate-900">Demande de validation</h3>
						<div className="space-y-3">
							<label className="block text-xs font-semibold uppercase tracking-wide text-slate-500">
								Date de la demande
								<input type="date" value={validationDate} onChange={(event) => setValidationDate(event.target.value)} className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm" />
							</label>
							<label className="block text-xs font-semibold uppercase tracking-wide text-slate-500">
								Par qui
								<select value={validationRole} onChange={(event) => setValidationRole(event.target.value as (typeof validationRoles)[number])} className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm">
									{validationRoles.map((roleLabel) => (
										<option key={roleLabel} value={roleLabel}>{roleLabel}</option>
									))}
								</select>
							</label>
						</div>
						<div className="mt-4 flex justify-end gap-2">
							<button type="button" className="btn-secondary" onClick={resetValidationForm}>Réinitialiser</button>
							<button type="button" className="btn-primary" onClick={() => setConfirmableRowAction("requestValidation")} disabled={!validationDate}>OK</button>
						</div>
					</div>
				)}
				{!canEditRows && canActOnSelectedRow && openRowAction === "review" && reviewAction === "correct" && (
					<div className="fixed bottom-28 right-8 z-40 w-[340px] rounded-2xl border border-slate-200 bg-white p-4 shadow-2xl">
						<button type="button" aria-label="Fermer" className="absolute right-3 top-3 rounded-full p-1 text-slate-500 hover:bg-slate-100 hover:text-slate-900" onClick={closeRowAction}><X size={18} /></button>
						<h3 className="mb-3 pr-8 text-sm font-bold text-slate-900">Rejeter la ligne</h3>
						<label className="block text-xs font-semibold uppercase tracking-wide text-slate-500">
							Remarques
							<textarea value={correctionComment} onChange={(event) => setCorrectionComment(event.target.value)} rows={3} className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm" placeholder="Décrivez la correction demandée…" />
						</label>
						<div className="mt-4 flex justify-end gap-2">
							<button type="button" className="btn-secondary" onClick={resetReviewForm}>Réinitialiser</button>
							<button type="button" className="btn-primary" onClick={() => setConfirmableRowAction("reviewReject")} disabled={!correctionComment.trim()}>OK</button>
						</div>
					</div>
				)}
				{!canEditRows && canActOnSelectedRow && openRowAction === "review" && !reviewAction && (
					<div className="fixed bottom-28 right-8 z-40 w-[340px] rounded-2xl border border-slate-200 bg-white p-4 shadow-2xl">
						<button type="button" aria-label="Fermer" className="absolute right-3 top-3 rounded-full p-1 text-slate-500 hover:bg-slate-100 hover:text-slate-900" onClick={closeRowAction}><X size={18} /></button>
						<h3 className="mb-3 pr-8 text-sm font-bold text-slate-900">Choisir une action</h3>
						<div className="flex gap-2">
							<button type="button" className="btn-primary flex-1" onClick={() => setConfirmableRowAction("reviewValidate")}>Valider</button>
							<button type="button" className="btn-secondary flex-1" onClick={() => setReviewAction("correct")}>Rejeter</button>
						</div>
					</div>
				)}
				{!canEditRows && canActOnSelectedRow && openRowAction === "sortie" && (
					<div className="fixed bottom-28 right-8 z-40 w-[340px] rounded-2xl border border-slate-200 bg-white p-4 shadow-2xl">
						<button type="button" aria-label="Fermer" className="absolute right-3 top-3 rounded-full p-1 text-slate-500 hover:bg-slate-100 hover:text-slate-900" onClick={closeRowAction}><X size={18} /></button>
						<h3 className="mb-3 pr-8 text-sm font-bold text-slate-900">Sortie</h3>
						<div className="space-y-3">
							<label className="block text-xs font-semibold uppercase tracking-wide text-slate-500">
								Date de sortie
								<input type="date" value={sortieDate} onChange={(event) => setSortieDate(event.target.value)} className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm" />
							</label>
							<label className="block text-xs font-semibold uppercase tracking-wide text-slate-500">
								Service de sortie
								<input type="text" value={serviceSortie} onChange={(event) => setServiceSortie(event.target.value)} className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm" placeholder="SCTRL" />
							</label>
						</div>
						<div className="mt-4 flex justify-end gap-2">
							<button type="button" className="btn-secondary" onClick={resetSortieForm}>Réinitialiser</button>
							<button type="button" className="btn-primary" onClick={() => setConfirmableRowAction("sortie")} disabled={!sortieDate || !serviceSortie.trim()}>OK</button>
						</div>
					</div>
				)}
			</>}
		</>
	);
}
