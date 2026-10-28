import { IdCard, Plus, RefreshCw, Search } from "lucide-react";
import { useCallback, useMemo, useRef, useState, type FormEvent } from "react";
import { AgentForm } from "../features/agents/components/AgentForm";
import { ConfirmDialog } from "../components/ui/ConfirmDialog";
import { DataTable, type Column } from "../components/ui/DataTable";
import { ErrorBlock, LoadingBlock } from "../components/ui/Feedback";
import { FileField } from "../components/ui/form";
import { ImageThumb } from "../components/ui/ImageThumb";
import { Modal } from "../components/ui/Modal";
import { PageHeader } from "../components/ui/PageHeader";
import { ToastViewport } from "../components/ui/Toast";
import { useReferentials } from "../features/referentials/hooks/useReferentials";
import { useAsyncLoader } from "../hooks/useAsyncLoader";
import {
	createAgent,
	listAgents,
	listAgentsFiltered,
	searchAgentsByFirstName,
	searchAgentsByLastName,
	requestAgentDeletion,
	updateAgentCard,
	updateAgentInformation,
} from "../features/agents/services/agents";
import { resolveAgentCardUrl } from "../services/api";
import type {
	AgentItem,
	AgentStructureFilter,
	CreateAgentInput,
	UpdateAgentInput,
} from "../types/api";
import { errorMessage } from "../utils/errors";
import { validateImageFile } from "../utils/image";
import { notify } from "../utils/notify";
import { formatDate, labelSexe, labelStatutPEC, orDash } from "../utils/format";

/** The table needs a stable key: the matricule plays that role for agents. */
type AgentRow = AgentItem & { id: string };

type FilterMode = "all" | "active" | "retired" | "agence" | "direction";
type SearchMode = "last" | "first";

function nextMatriculeSuggestion(agentList: AgentItem[]): string | null {
	const matricules = agentList
		.map((agent) => String(agent.matricule).trim())
		.filter((matricule) => /^[0-9]+$/.test(matricule))
		.map(Number)
		.filter(Number.isSafeInteger);
	const next = (matricules.length ? Math.max(...matricules) : 0) + 1;
	return Number.isSafeInteger(next) ? String(next) : null;
}

export default function AgentPage() {
	const referentials = useReferentials();

	const [agents, setAgents] = useState<AgentRow[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	const [mode, setMode] = useState<FilterMode>("all");
	const [codeAgence, setCodeAgence] = useState("");
	const [codeDirection, setCodeDirection] = useState("");
	const [codeService, setCodeService] = useState("");

	const [searchMode, setSearchMode] = useState<SearchMode>("last");
	const [searchDraft, setSearchDraft] = useState("");
	const [appliedSearch, setAppliedSearch] = useState("");

	const [createOpen, setCreateOpen] = useState(false);
	const [suggestedMatricule, setSuggestedMatricule] = useState<string | null>(
		null,
	);
	const [matriculeSuggestionLoading, setMatriculeSuggestionLoading] =
		useState(false);
	const suggestionRequestId = useRef(0);
	const [editTarget, setEditTarget] = useState<AgentRow | null>(null);
	const [cardTarget, setCardTarget] = useState<AgentRow | null>(null);
	const [cardPreviewTarget, setCardPreviewTarget] = useState<AgentRow | null>(
		null,
	);
	const [cardPreviewError, setCardPreviewError] = useState(false);
	const [cardFile, setCardFile] = useState<File | null>(null);
	const [cardError, setCardError] = useState<string | null>(null);
	const [deleteTarget, setDeleteTarget] = useState<AgentRow | null>(null);
	const [submitting, setSubmitting] = useState(false);

	/**
	 * Reads the agent list according to the active filter or search.
	 * No state is written before the first `await`, which keeps the effect
	 * below free of synchronous renders. Every write is guarded by `isStale()`,
	 * so changing the filter twice in a row cannot let the first response
	 * overwrite the second one.
	 */
	const fetchAgents = useCallback(
		async (isStale: () => boolean) => {
			try {
				let rows: AgentItem[];

				if (appliedSearch) {
					rows =
						searchMode === "last"
							? await searchAgentsByLastName(appliedSearch)
							: await searchAgentsByFirstName(appliedSearch);
				} else if (
					(mode === "agence" && !codeAgence) ||
					(mode === "direction" && !codeDirection)
				) {
					rows = [];
				} else if (mode === "active") {
					rows = (await listAgents()).filter(
						(agent) => agent.backOfficeFrontOffice !== "RETRAITE",
					);
				} else {
					const filter: AgentStructureFilter = {};
					if (mode === "retired") filter.backOfficeFrontOffice = "RETRAITE";
					else if (mode === "agence" && codeAgence)
						filter.codeAgence = codeAgence;
					else if (mode === "direction" && codeDirection) {
						filter.codeDirection = codeDirection;
						if (codeService) filter.codeService = codeService;
					}
					rows =
						Object.keys(filter).length > 0
							? await listAgentsFiltered(filter)
							: await listAgents();
				}

				if (isStale()) return;
				setAgents(rows.map((agent) => ({ ...agent, id: agent.matricule })));
				setError(null);
			} catch (caught) {
				if (isStale()) return;
				setAgents([]);
				setError(errorMessage(caught, "Impossible de charger les agents."));
			} finally {
				if (!isStale()) setLoading(false);
			}
		},
		[appliedSearch, searchMode, mode, codeAgence, codeDirection, codeService],
	);

	/** Manual refresh: re-displays the spinner before loading again. */
	const refresh = useCallback(async () => {
		setLoading(true);
		setError(null);
		await fetchAgents(() => false);
	}, [fetchAgents]);

	async function openCreateForm(): Promise<void> {
		const requestId = ++suggestionRequestId.current;
		setSuggestedMatricule(null);
		setMatriculeSuggestionLoading(true);
		setCreateOpen(true);
		try {
			const allAgents = await listAgents();
			if (requestId !== suggestionRequestId.current) return;
			setSuggestedMatricule(nextMatriculeSuggestion(allAgents));
		} catch (caught) {
			if (requestId === suggestionRequestId.current) {
				notify(
					errorMessage(caught, "Suggestion du matricule indisponible."),
					"error",
				);
			}
		} finally {
			if (requestId === suggestionRequestId.current) {
				setMatriculeSuggestionLoading(false);
			}
		}
	}

	function closeCreateForm(): void {
		suggestionRequestId.current += 1;
		setCreateOpen(false);
		setMatriculeSuggestionLoading(false);
	}

	useAsyncLoader(fetchAgents);

	const summary = useMemo(() => {
		const retraites = agents.filter(
			(agent) => agent.backOfficeFrontOffice === "RETRAITE",
		).length;
		return {
			total: agents.length,
			retraites,
			actifs: agents.length - retraites,
		};
	}, [agents]);

	const agenceOptions = referentials.agences.map((agence) => ({
		value: agence.codeAgence,
		label: `${agence.nomAgence} (${agence.codeAgence})`,
	}));
	const directionOptions = referentials.directions.map((direction) => ({
		value: direction.codeDirection,
		label: direction.nom,
	}));
	const serviceOptions = referentials.services
		.filter(
			(service) => !codeDirection || service.codeDirection === codeDirection,
		)
		.map((service) => ({
			value: service.codeService,
			label: `${service.nom} (${service.codeService})`,
		}));
	const serviceByCode = new Map(
		referentials.services.map((service) => [service.codeService, service]),
	);
	const directionByCode = new Map(
		referentials.directions.map((direction) => [
			direction.codeDirection,
			direction,
		]),
	);
	const agenceByCode = new Map(
		referentials.agences.map((agence) => [agence.codeAgence, agence]),
	);

	const columns: Column<AgentRow>[] = [
		{
			key: "matricule",
			label: "IM",
			render: (row) => (
				<span className="font-mono text-xs font-bold">
					{String(row.matricule).padStart(3, "0")}
				</span>
			),
		},
		{
			key: "nomComplet",
			label: "NOM et PRENOM AGENT",
			render: (row) => `${row.nom} ${row.prenom}`,
		},
		{ key: "nom", label: "Nom Agent" },
		{ key: "prenom", label: "Prénom Agent" },
		{
			key: "fonction",
			label: "Fonction",
			render: (row) => orDash(row.fonction),
		},
		{
			key: "statutPEC",
			label: "Statut PEC",
			render: (row) => labelStatutPEC(row.statutPEC),
		},
		{
			key: "sexe",
			label: "Sexe",
			render: (row) => labelSexe(row.sexe),
		},
		{
			key: "categorieID",
			label: "Catégorie",
			render: (row) => orDash(row.categorieID),
		},
		{
			key: "backOfficeFrontOffice",
			label: "Back_O & Front_O",
			render: (row) => row.backOfficeFrontOffice,
		},
		{
			key: "codeDirection",
			label: "Cod_Dir",
			render: (row) => {
				if (row.backOfficeFrontOffice === "AGENCE") return "AGENCE";
				if (row.backOfficeFrontOffice === "RETRAITE") return "RET";
				return row.structureID ?? "—";
			},
		},
		{
			key: "direction",
			label: "Direction",
			render: (row) => {
				if (row.backOfficeFrontOffice === "RETRAITE") return "RETRAITE";
				if (row.backOfficeFrontOffice === "AGENCE") return "AGENCE";
				const codeDirection = serviceByCode.get(
					row.codeService ?? "",
				)?.codeDirection;
				return (
					directionByCode.get(row.structureID ?? codeDirection ?? "")?.nom ??
					"—"
				);
			},
		},
		{
			key: "codeService",
			label: "Cod_Serv / Cod_Agc",
			render: (row) => {
				if (row.statutPEC === "DIRECTEUR") return "DIRECTEUR";
				if (row.backOfficeFrontOffice === "RETRAITE") return "RET";
				return row.backOfficeFrontOffice === "DIRECTION"
					? orDash(row.codeService)
					: orDash(row.structureID);
			},
		},
		{
			key: "serviceAgence",
			label: "SERVICE / Agence",
			render: (row) => {
				if (row.backOfficeFrontOffice === "RETRAITE") return "RETRAITE";
				if (row.statutPEC === "DIRECTEUR") return "-";
				if (row.backOfficeFrontOffice === "DIRECTION") {
					return serviceByCode.get(row.codeService ?? "")?.nom ?? "—";
				}
				const codeAgence = row.structureID;
				if (!codeAgence) return "—";
				const nomAgence = agenceByCode.get(codeAgence)?.nomAgence;
				return nomAgence ? `${codeAgence} ${nomAgence}` : codeAgence;
			},
		},
		{
			key: "dateNaissance",
			label: "Date_Naissance",
			render: (row) => formatDate(row.dateNaissance),
		},
		{
			key: "dateEntree",
			label: "Date_Entrée",
			render: (row) => formatDate(row.dateEntree),
		},
		{
			key: "observationMatricule",
			label: "ObsIM",
			render: (row) => orDash(row.observationMatricule),
		},
		{
			key: "carte",
			label: "Carte",
			render: (row) => {
				const card = (
					<ImageThumb
						path={row.carteProfessionnellePath}
						name={`${row.nom} ${row.prenom}`}
						agentMatricule={row.matricule}
						size={40}
					/>
				);
				return row.carteProfessionnellePath ? (
					<button
						type="button"
						className="rounded-lg p-0 transition hover:ring-2 hover:ring-red-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-600"
						aria-label={`Afficher la carte professionnelle de ${row.nom} ${row.prenom}`}
						aria-haspopup="dialog"
						onClick={() => {
							setCardPreviewError(false);
							setCardPreviewTarget(row);
						}}
					>
						{card}
					</button>
				) : (
					card
				);
			},
		},
		{ key: "parQui", label: "ParQui", render: () => "—" },
	];

	async function handleCreate(
		input: CreateAgentInput,
		image: File,
	): Promise<void> {
		setSubmitting(true);
		try {
			await createAgent(input, image);
			notify("Agent créé avec succès.");
			setCreateOpen(false);
			await fetchAgents(() => false);
		} catch (caught) {
			notify(errorMessage(caught, "Création impossible."), "error");
		} finally {
			setSubmitting(false);
		}
	}

	async function handleUpdate(
		matricule: string,
		input: UpdateAgentInput,
	): Promise<void> {
		setSubmitting(true);
		try {
			await updateAgentInformation(matricule, input);
			notify("Agent mis à jour.");
			setEditTarget(null);
			await fetchAgents(() => false);
		} catch (caught) {
			notify(errorMessage(caught, "Mise à jour impossible."), "error");
		} finally {
			setSubmitting(false);
		}
	}

	async function handleCardReplace(): Promise<void> {
		if (!cardTarget) return;
		if (!cardFile) {
			setCardError("Sélectionnez une image.");
			return;
		}
		const fileError = validateImageFile(cardFile);
		if (fileError) {
			setCardError(fileError);
			return;
		}
		setSubmitting(true);
		try {
			await updateAgentCard(cardTarget.matricule, cardFile);
			notify("Carte professionnelle remplacée.");
			setCardTarget(null);
			setCardFile(null);
			setCardError(null);
			await fetchAgents(() => false);
		} catch (caught) {
			notify(errorMessage(caught, "Remplacement impossible."), "error");
		} finally {
			setSubmitting(false);
		}
	}

	async function handleDelete(): Promise<void> {
		if (!deleteTarget) return;
		setSubmitting(true);
		try {
			await requestAgentDeletion(deleteTarget.matricule);
			notify("Demande de suppression envoyée.");
			setDeleteTarget(null);
			await fetchAgents(() => false);
		} catch (caught) {
			notify(
				errorMessage(caught, "Demande de suppression impossible."),
				"error",
			);
		} finally {
			setSubmitting(false);
		}
	}

	return (
		<>
			<ToastViewport />
			<PageHeader
				title="Gestion des Agents"
				description="Créez, consultez et modifiez les agents. Les suppressions sont soumises à validation ; la carte professionnelle est gérée séparément."
				actions={
					<>
						<button className="btn-secondary" onClick={() => void refresh()}>
							<RefreshCw size={16} /> Actualiser
						</button>
						<button
							className="btn-primary"
							onClick={() => void openCreateForm()}
						>
							<Plus size={16} /> Nouvel agent
						</button>
					</>
				}
			/>

			<div className="panel mb-4 space-y-3 p-4">
				<form
					className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_auto]"
					onSubmit={(event: FormEvent) => {
						event.preventDefault();
						const next = searchDraft.trim();
						if (next === appliedSearch) return;
						setLoading(true);
						if (next) {
							setMode("all");
							setCodeAgence("");
							setCodeDirection("");
							setCodeService("");
						}
						setAppliedSearch(next);
					}}
				>
					<div className="grid gap-3 sm:grid-cols-[140px_minmax(0,1fr)]">
						<select
							className="field"
							value={searchMode}
							onChange={(event) => {
								setLoading(true);
								setSearchMode(event.target.value as SearchMode);
							}}
						>
							<option value="last">Nom</option>
							<option value="first">Prénom</option>
						</select>
						<input
							className="field"
							value={searchDraft}
							placeholder="Rechercher un agent par nom ou prénom…"
							onChange={(event) => setSearchDraft(event.target.value)}
						/>
					</div>
					<div className="flex gap-2">
						<button className="btn-secondary" type="submit">
							<Search size={16} /> Rechercher
						</button>
						{appliedSearch && (
							<button
								type="button"
								className="btn-secondary"
								onClick={() => {
									setSearchDraft("");
									setLoading(true);
									setAppliedSearch("");
								}}
							>
								Effacer
							</button>
						)}
					</div>
				</form>

				<div className="grid gap-3 sm:grid-cols-3">
					<div>
						<label className="label">Filtre</label>
						<select
							className="field"
							value={mode}
							disabled={Boolean(appliedSearch)}
							onChange={(event) => {
								const next = event.target.value as FilterMode;
								if (next === mode) return;
								setLoading(true);
								setMode(next);
							}}
						>
							<option value="all">Tous les agents</option>
							<option value="active">Agents actifs</option>
							<option value="retired">Agents retraités</option>
							<option value="agence">Par agence</option>
							<option value="direction">Par direction / service</option>
						</select>
					</div>
					{mode === "agence" && (
						<div>
							<label className="label">Agence</label>
							<select
								className="field"
								value={codeAgence}
								disabled={Boolean(appliedSearch) || referentials.loading}
								onChange={(event) => {
									setLoading(true);
									setCodeAgence(event.target.value);
								}}
							>
								<option value="">-- Choisir une agence --</option>
								{agenceOptions.map((option) => (
									<option key={option.value} value={option.value}>
										{option.label}
									</option>
								))}
							</select>
						</div>
					)}
					{mode === "direction" && (
						<>
							<div>
								<label className="label">Direction</label>
								<select
									className="field"
									value={codeDirection}
									disabled={Boolean(appliedSearch) || referentials.loading}
									onChange={(event) => {
										setLoading(true);
										setCodeDirection(event.target.value);
										setCodeService("");
									}}
								>
									<option value="">-- Choisir une direction --</option>
									{directionOptions.map((option) => (
										<option key={option.value} value={option.value}>
											{option.label}
										</option>
									))}
								</select>
							</div>
							<div>
								<label className="label">Service (optionnel)</label>
								<select
									className="field"
									value={codeService}
									disabled={
										!codeDirection ||
										Boolean(appliedSearch) ||
										referentials.loading
									}
									onChange={(event) => {
										setLoading(true);
										setCodeService(event.target.value);
									}}
								>
									<option value="">-- Tous les services --</option>
									{serviceOptions.map((option) => (
										<option key={option.value} value={option.value}>
											{option.label}
										</option>
									))}
								</select>
							</div>
						</>
					)}
				</div>

				<p className="text-xs text-slate-400">
					{summary.total} agent(s) affiché(s) — {summary.actifs} actif(s),{" "}
					{summary.retraites} retraité(s).
				</p>
			</div>

			<div className="mt-4 space-y-4">
				{loading && <LoadingBlock label="Chargement des agents…" />}
				{error && <ErrorBlock message={error} onRetry={() => void refresh()} />}

				{!loading && !error && (
					<DataTable
						rows={agents}
						columns={columns}
						empty={
							mode === "agence" && !codeAgence
								? "Choisissez une agence pour afficher les agents."
								: mode === "direction" && !codeDirection
									? "Choisissez une direction pour afficher les agents."
									: "Aucun agent pour ces critères."
						}
						onEdit={(row) => setEditTarget(row)}
						onDelete={(row) => setDeleteTarget(row)}
						rowActions={(row) => (
							<button
								className="btn-ghost"
								title="Remplacer la carte professionnelle"
								onClick={() => {
									setCardTarget(row);
									setCardFile(null);
									setCardError(null);
								}}
							>
								<IdCard size={15} />
							</button>
						)}
					/>
				)}
			</div>

			<Modal
				open={createOpen}
				title="Nouvel agent"
				description="L'agent, sa personne et son bénéficiaire sont créés en une seule transaction."
				onClose={closeCreateForm}
			>
				<AgentForm
					mode="create"
					referentials={referentials}
					suggestedMatricule={suggestedMatricule}
					matriculeSuggestionLoading={matriculeSuggestionLoading}
					submitting={submitting}
					onCreate={handleCreate}
					onUpdate={handleUpdate}
					onCancel={closeCreateForm}
				/>
			</Modal>

			<Modal
				open={Boolean(editTarget)}
				title={`Modifier l'agent ${editTarget?.matricule ?? ""}`}
				description="Seuls les champs modifiés sont transmis. Un champ laissé vide n'est pas effacé."
				onClose={() => setEditTarget(null)}
			>
				{editTarget && (
					<AgentForm
						key={editTarget.matricule}
						mode="edit"
						agent={editTarget}
						referentials={referentials}
						submitting={submitting}
						onCreate={handleCreate}
						onUpdate={handleUpdate}
						onCancel={() => setEditTarget(null)}
					/>
				)}
			</Modal>

			<Modal
				open={Boolean(cardTarget)}
				title="Remplacer la carte professionnelle"
				description={
					cardTarget
						? `Agent ${cardTarget.matricule} — ${cardTarget.nom} ${cardTarget.prenom}`
						: ""
				}
				onClose={() => setCardTarget(null)}
				width="max-w-lg"
			>
				<div className="space-y-4">
					{cardError && <ErrorBlock message={cardError} />}
					<FileField
						label="Nouvelle carte"
						file={cardFile}
						onFile={setCardFile}
						required
					/>
					<div className="flex justify-end gap-2">
						<button
							className="btn-secondary"
							onClick={() => setCardTarget(null)}
							disabled={submitting}
						>
							Annuler
						</button>
						<button
							className="btn-primary"
							onClick={() => void handleCardReplace()}
							disabled={submitting}
						>
							{submitting ? "Envoi…" : "Remplacer"}
						</button>
					</div>
				</div>
			</Modal>

			<Modal
				open={Boolean(cardPreviewTarget)}
				title="Carte professionnelle"
				description={
					cardPreviewTarget
						? `${cardPreviewTarget.nom} ${cardPreviewTarget.prenom} · IM ${cardPreviewTarget.matricule}`
						: undefined
				}
				onClose={() => setCardPreviewTarget(null)}
				width="max-w-5xl"
			>
				{cardPreviewTarget && (
					<div className="flex min-h-[40vh] items-center justify-center rounded-xl bg-slate-200 p-4 sm:p-6">
						{cardPreviewError ? (
							<ErrorBlock message="Impossible de charger la carte professionnelle." />
						) : (
							<img
								src={resolveAgentCardUrl(cardPreviewTarget.matricule)}
								alt={`Carte professionnelle de ${cardPreviewTarget.nom} ${cardPreviewTarget.prenom}`}
								className="block max-h-[72vh] max-w-full rounded-md bg-white object-contain shadow-xl ring-1 ring-slate-300"
								onError={() => setCardPreviewError(true)}
							/>
						)}
					</div>
				)}
			</Modal>

			<ConfirmDialog
				open={Boolean(deleteTarget)}
				title="Confirmer la demande de suppression"
				confirmLabel="Envoyer la demande"
				message={
					deleteTarget
						? `Envoyer une demande de suppression pour l'agent ${deleteTarget.nom} ${deleteTarget.prenom} (${deleteTarget.matricule}) ?`
						: ""
				}
				onCancel={() => setDeleteTarget(null)}
				onConfirm={() => void handleDelete()}
			/>
		</>
	);
}
