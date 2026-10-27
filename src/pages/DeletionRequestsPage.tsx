import { Check, RefreshCw, X } from "lucide-react";
import { useCallback, useState } from "react";
import { ConfirmDialog } from "../components/ConfirmDialog";
import { DataTable, type Column } from "../components/DataTable";
import { ErrorBlock, LoadingBlock } from "../components/Feedback";
import { PageHeader } from "../components/PageHeader";
import { ToastViewport } from "../components/Toast";
import { useAsyncLoader } from "../hooks/useAsyncLoader";
import {
	listDeletionRequests,
	rejectDeletion,
	validateDeletion,
	type DeletionRequest,
	type DeletionResource,
} from "../services/deletions";
import { errorMessage } from "../utils/errors";
import { notify } from "../utils/notify";

const RESOURCE_LABELS: Record<DeletionResource, string> = {
	agent: "Agent",
	spouse: "Conjoint",
	child: "Enfant",
	provider: "Prestataire",
	providerCategory: "Catégorie prestataire",
	agentCategory: "Catégorie agent",
	location: "Lieu",
	agency: "Agence",
	direction: "Direction",
	service: "Service",
};

export default function DeletionRequestsPage() {
	const [requests, setRequests] = useState<DeletionRequest[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [busyId, setBusyId] = useState<string | null>(null);
	const [validationTarget, setValidationTarget] =
		useState<DeletionRequest | null>(null);

	const fetchRequests = useCallback(async (isStale: () => boolean) => {
		try {
			const rows = await listDeletionRequests();
			if (isStale()) return;
			setRequests(rows);
			setError(null);
		} catch (caught) {
			if (isStale()) return;
			setRequests([]);
			setError(
				errorMessage(caught, "Impossible de charger les demandes de suppression."),
			);
		} finally {
			if (!isStale()) setLoading(false);
		}
	}, []);

	const refresh = useCallback(async () => {
		setLoading(true);
		setError(null);
		await fetchRequests(() => false);
	}, [fetchRequests]);

	useAsyncLoader(fetchRequests);

	async function handleDecision(
		request: DeletionRequest,
		decision: "validate" | "reject",
	): Promise<void> {
		setBusyId(request.id);
		try {
			if (decision === "validate") {
				await validateDeletion(request.resource, request.resourceId);
				notify("Suppression validée.");
			} else {
				await rejectDeletion(request.resource, request.resourceId);
				notify("Demande de suppression rejetée.");
			}
			setValidationTarget(null);
			await fetchRequests(() => false);
		} catch (caught) {
			notify(errorMessage(caught, "Traitement de la demande impossible."), "error");
		} finally {
			setBusyId(null);
		}
	}

	const columns: Column<DeletionRequest>[] = [
		{
			key: "resource",
			label: "Type",
			render: (row) => RESOURCE_LABELS[row.resource],
		},
		{ key: "name", label: "Élément" },
		{
			key: "detail",
			label: "Identifiant",
			render: (row) => <span className="font-mono text-xs">{row.detail}</span>,
		},
	];

	return (
		<>
			<ToastViewport />
			<PageHeader
				title="Demandes de suppression"
				description="Les suppressions sont différées : validez une demande pour appliquer la suppression ou rejetez-la pour conserver l’enregistrement."
				actions={
					<button
						className="btn-secondary"
						onClick={() => void refresh()}
						disabled={loading}
					>
						<RefreshCw size={16} /> Actualiser
					</button>
				}
			/>

			<div className="mt-4 space-y-4">
				{loading && <LoadingBlock label="Chargement des demandes…" />}
				{error && <ErrorBlock message={error} onRetry={() => void refresh()} />}
				{!loading && !error && (
					<DataTable
						rows={requests}
						columns={columns}
						empty="Aucune demande de suppression en attente."
						rowActions={(row) => (
							<>
								<button
									className="btn-ghost text-emerald-700"
									title="Valider la suppression"
									aria-label={`Valider la suppression de ${row.name}`}
									disabled={busyId === row.id}
									onClick={() => setValidationTarget(row)}
								>
									<Check size={16} />
								</button>
								<button
									className="btn-ghost text-slate-600"
									title="Rejeter la demande"
									aria-label={`Rejeter la demande de ${row.name}`}
									disabled={busyId === row.id}
									onClick={() => void handleDecision(row, "reject")}
								>
									<X size={16} />
								</button>
							</>
						)}
					/>
				)}
			</div>

			<ConfirmDialog
				open={Boolean(validationTarget)}
				title="Valider la suppression"
				confirmLabel={
					busyId === validationTarget?.id ? "Validation…" : "Valider"
				}
				confirmDisabled={busyId === validationTarget?.id}
				message={
					validationTarget
						? `Confirmer la suppression de ${validationTarget.name} (${RESOURCE_LABELS[validationTarget.resource]}) ? Cette action ne peut pas être annulée.`
						: ""
				}
				onCancel={() => setValidationTarget(null)}
				onConfirm={() => {
					if (validationTarget) {
						void handleDecision(validationTarget, "validate");
					}
				}}
			/>
		</>
	);
}
