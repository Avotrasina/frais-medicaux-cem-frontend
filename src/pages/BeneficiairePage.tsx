import { MessageSquare, Plus, RefreshCw, Search, Trash2 } from "lucide-react";
import { useCallback, useState, type FormEvent } from "react";
import {
	BeneficiaryEditForm,
	BeneficiaryObservationForm,
	FamilyMemberCreateForm,
} from "../features/beneficiaries/components/BeneficiaryForm";
import { Badge } from "../components/ui/Badge";
import { DataTable, type Column } from "../components/ui/DataTable";
import { ErrorBlock, LoadingBlock } from "../components/ui/Feedback";
import { ImageThumb } from "../components/ui/ImageThumb";
import { Modal } from "../components/ui/Modal";
import { PageHeader } from "../components/ui/PageHeader";
import { ToastViewport } from "../components/ui/Toast";
import { useAsyncLoader } from "../hooks/useAsyncLoader";
import { listAgents, updateAgentInformation } from "../features/agents/services/agents";
import {
	getBeneficiaryByIdp,
	listAllBeneficiaries,
	listBeneficiariesByMatricule,
	updateBeneficiaryObservation,
} from "../features/beneficiaries/services/beneficiaries";
import {
	createFamilyMember,
	listFamilyMembers,
	resolveFamilyMember,
	updateFamilyMemberInformation,
} from "../features/beneficiaries/services/family";
import { requestDeletion } from "../features/deletions/services/deletions";
import type {
	AgentItem,
	Beneficiary,
	CreateFamilyMemberInput,
	FamilyKind,
	UpdateFamilyMemberInput,
} from "../types/api";
import { errorMessage, explainKnownBackendDefect } from "../utils/errors";
import { notify } from "../utils/notify";
import {
	formatDate,
	calculateAge,
	labelCodeFamille,
	labelSexe,
	orDash,
} from "../utils/format";

type BeneficiaryRow = Beneficiary & { id: string };

type SearchMode = "matricule" | "idp";

const FAMILLE_TONES: Record<string, "blue" | "green" | "amber"> = {
	AGENT: "blue",
	CONJOINT: "green",
	ENFANT: "amber",
};

export default function BeneficiairePage() {
	const [rows, setRows] = useState<BeneficiaryRow[]>([]);
	const [agents, setAgents] = useState<AgentItem[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [progress, setProgress] = useState<{
		loaded: number;
		total: number;
	} | null>(null);

	const [searchMode, setSearchMode] = useState<SearchMode>("matricule");
	const [searchDraft, setSearchDraft] = useState("");
	const [appliedSearch, setAppliedSearch] = useState("");

	const [createOpen, setCreateOpen] = useState(false);
	const [editTarget, setEditTarget] = useState<BeneficiaryRow | null>(null);
	const [observationTarget, setObservationTarget] =
		useState<BeneficiaryRow | null>(null);
	const [submitting, setSubmitting] = useState(false);

	/**
	 * Loads the beneficiaries of the current view.
	 * No state is written before the first `await`, which keeps the effect
	 * below free of synchronous renders. Every write is guarded by `isStale()`,
	 * so a slow aggregation cannot overwrite a newer search.
	 */
	const fetchBeneficiaries = useCallback(
		async (isStale: () => boolean) => {
			try {
				if (appliedSearch) {
					if (searchMode === "idp") {
						const found = await getBeneficiaryByIdp(appliedSearch);
						if (isStale()) return;
						setRows([{ ...found, id: found.idp }]);
					} else {
						const found = await listBeneficiariesByMatricule(appliedSearch);
						if (isStale()) return;
						setRows(found.map((item) => ({ ...item, id: item.idp })));
					}
					setError(null);
					return;
				}

				// No "list all beneficiaries" route exists: aggregate from agents.
				const agentList = await listAgents();
				if (isStale()) return;
				setAgents(agentList);
				setProgress({ loaded: 0, total: agentList.length });
				const { beneficiaries } = await listAllBeneficiaries(
					agentList.map((agent) => agent.matricule),
					{
						onProgress: (loaded, total) => {
							if (!isStale()) setProgress({ loaded, total });
						},
					},
				);
				if (isStale()) return;
				setRows(beneficiaries.map((item) => ({ ...item, id: item.idp })));
				setError(null);
			} catch (caught) {
				if (isStale()) return;
				setRows([]);
				setError(
					errorMessage(caught, "Impossible de charger les bénéficiaires."),
				);
			} finally {
				if (!isStale()) {
					setProgress(null);
					setLoading(false);
				}
			}
		},
		[appliedSearch, searchMode],
	);

	/** Manual refresh: re-displays the spinner before loading again. */
	const refresh = useCallback(async () => {
		setLoading(true);
		setError(null);
		await fetchBeneficiaries(() => false);
	}, [fetchBeneficiaries]);

	useAsyncLoader(fetchBeneficiaries);

	async function handleCreate(
		kind: FamilyKind,
		input: CreateFamilyMemberInput,
		image: File,
	): Promise<void> {
		setSubmitting(true);
		try {
			await createFamilyMember(kind, input, image);
			notify("Bénéficiaire créé avec succès.");
			setCreateOpen(false);
			await fetchBeneficiaries(() => false);
		} catch (caught) {
			notify(
				explainKnownBackendDefect(
					caught,
					kind === "enfant" ? "enfant" : "generic",
				) ?? errorMessage(caught, "Création impossible."),
				"error",
			);
		} finally {
			setSubmitting(false);
		}
	}

	async function handleEdit(input: UpdateFamilyMemberInput): Promise<void> {
		if (!editTarget) return;
		setSubmitting(true);
		try {
			if (editTarget.codeFamille === "AGENT") {
				await updateAgentInformation(editTarget.matricule, input);
			} else {
				// `/agent-families/<kind>/:id` needs the person id, which is
				// only exposed by the family listing of the agent.
				const members = await listFamilyMembers(editTarget.matricule);
				const member = resolveFamilyMember(members, editTarget);
				if (!member) {
					throw new Error(
						"Identifiant de la personne introuvable : le membre n'apparaît pas dans la famille de l'agent.",
					);
				}
				await updateFamilyMemberInformation(
					editTarget.codeFamille === "CONJOINT" ? "conjoint" : "enfant",
					member.id,
					input,
				);
			}
			notify("Bénéficiaire mis �???  jour.");
			setEditTarget(null);
			await fetchBeneficiaries(() => false);
		} catch (caught) {
			notify(errorMessage(caught, "Mise �???  jour impossible."), "error");
		} finally {
			setSubmitting(false);
		}
	}

	async function handleObservation(observation: string | null): Promise<void> {
		if (!observationTarget) return;
		setSubmitting(true);
		try {
			await updateBeneficiaryObservation(observationTarget.idp, observation);
			notify("Observation enregistrée.");
			setObservationTarget(null);
			await fetchBeneficiaries(() => false);
		} catch (caught) {
			notify(errorMessage(caught, "Enregistrement impossible."), "error");
		} finally {
			setSubmitting(false);
		}
	}

	async function handleFamilyDeletionRequest(row: BeneficiaryRow): Promise<void> {
		if (row.codeFamille === "AGENT") return;
		try {
			const familyMembers = await listFamilyMembers(row.matricule);
			const member = resolveFamilyMember(familyMembers, row);
			if (!member) {
				throw new Error("Identifiant du membre de la famille introuvable.");
			}
			const resource = row.codeFamille === "CONJOINT" ? "spouse" : "child";
			await requestDeletion(resource, member.id);
			notify("Demande de suppression envoyée.");
			await fetchBeneficiaries(() => false);
		} catch (caught) {
			notify(errorMessage(caught, "Demande de suppression impossible."), "error");
		}
	}

	const columns: Column<BeneficiaryRow>[] = [
		{
			key: "idp",
			label: "IDP",
			render: (row) => (
				<span className="font-mono text-xs font-bold">{row.idp}</span>
			),
		},
		{
			key: "nom",
			label: "NOM et PRENOM BENEFICIAIRE",
			render: (row) => `${row.nom} ${row.prenom}`,
		},
		{
			key: "codeFamille",
			label: "Code_Fam",
			render: (row) => (
				<Badge tone={FAMILLE_TONES[row.codeFamille] ?? "slate"}>
					{labelCodeFamille(row.codeFamille)}
				</Badge>
			),
		},
		{
			key: "dateNaissance",
			label: "Né(e) le",
			render: (row) => formatDate(row.dateNaissance),
		},
		{ key: "sexe", label: "Sexe", render: (row) => labelSexe(row.sexe) },
		{
			key: "observationIDP",
			label: "Obs IDP",
			className: "max-w-[280px] whitespace-normal",
			render: (row) => (
				<span className="text-xs text-slate-600">
					{orDash(row.observationIDP)}
				</span>
			),
		},
		{
			key: "age",
			label: "Age",
			render: (row) => orDash(calculateAge(row.dateNaissance)),
		},
		{
			key: "matricule",
			label: "IM",
			render: (row) => (
				<span className="font-mono text-xs">{row.matricule}</span>
			),
		},
		{
			key: "carte",
			label: "Carte",
			render: (row) => (
				<ImageThumb
					path={row.carteSocialePath ?? row.carteProfessionnellePath}
					name={`${row.nom} ${row.prenom}`}
					agentMatricule={
						row.codeFamille === "AGENT" ? row.matricule : undefined
					}
					familyMember={row.codeFamille === "AGENT" ? undefined : row}
					size={40}
				/>
			),
		},
	];

	return (
		<>
			<ToastViewport />
			<PageHeader
				title="Gestion des Bénéficiaires"
				description="Bénéficiaires (IDP) rattachés aux agents : consultation, mise �???  jour de l'état civil et de l'observation."
				actions={
					<>
						<button className="btn-secondary" onClick={() => void refresh()}>
							<RefreshCw size={16} /> Actualiser
						</button>
						<button
							className="btn-primary"
							onClick={() => setCreateOpen(true)}
							disabled={agents.length === 0}
							title={
								agents.length === 0
									? "Chargez d'abord la liste des agents"
									: undefined
							}
						>
							<Plus size={16} /> Nouveau bénéficiaire
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
						setAppliedSearch(next);
					}}
				>
					<div className="grid gap-3 sm:grid-cols-[180px_minmax(0,1fr)]">
						<select
							className="field"
							value={searchMode}
							onChange={(event) => {
								const next = event.target.value as SearchMode;
								if (next === searchMode) return;
								setLoading(true);
								setSearchMode(next);
							}}
						>
							<option value="matricule">Par matricule agent</option>
							<option value="idp">Par IDP</option>
						</select>
						<input
							className="field"
							value={searchDraft}
							placeholder={searchMode === "idp" ? "Ex. 012AGT001" : "Ex. M1234"}
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
				<p className="text-xs text-slate-400">
					{appliedSearch
						? `Recherche ${searchMode === "idp" ? "par IDP" : "par matricule"} : ${appliedSearch}`
						: `${rows.length} bénéficiaire(s) chargé(s) �???  partir de ${agents.length} agent(s).`}
				</p>
			</div>

			<div className="mt-4 space-y-4">
				{loading && (
					<LoadingBlock
						label={
							progress
								? `Chargement des bénéficiaires… ${progress.loaded}/${progress.total} agent(s)`
								: "Chargement des bénéficiaires…"
						}
					/>
				)}
				{error && <ErrorBlock message={error} onRetry={() => void refresh()} />}

				{!loading && !error && (
					<DataTable
						rows={rows}
						columns={columns}
						empty="Aucun bénéficiaire pour cette recherche."
						onEdit={(row) => setEditTarget(row)}
						rowActions={(row) => (
							<>
								<button
									className="btn-ghost"
									title="Modifier l'observation"
									aria-label={`Modifier l'observation de ${row.nom} ${row.prenom}`}
									onClick={() => setObservationTarget(row)}
								>
									<MessageSquare size={15} />
								</button>
								{row.codeFamille !== "AGENT" && (
									<button
										className="btn-ghost text-red-600"
										title="Demander la suppression"
										aria-label={`Demander la suppression de ${row.nom} ${row.prenom}`}
										onClick={() => void handleFamilyDeletionRequest(row)}
									>
										<Trash2 size={15} />
									</button>
								)}
							</>
						)}
					/>
				)}
			</div>

			<Modal
				open={createOpen}
				title="Nouveau bénéficiaire"
				description="Un bénéficiaire est créé en tant que conjoint ou enfant d'un agent."
				onClose={() => setCreateOpen(false)}
			>
				<FamilyMemberCreateForm
					agents={agents}
					submitting={submitting}
					onSubmit={handleCreate}
					onCancel={() => setCreateOpen(false)}
				/>
			</Modal>

			<Modal
				open={Boolean(editTarget)}
				title={`Modifier ${editTarget?.nom ?? ""} ${editTarget?.prenom ?? ""}`}
				description="État civil du bénéficiaire. Seuls les champs modifiés sont envoyés."
				onClose={() => setEditTarget(null)}
			>
				{editTarget && (
					<BeneficiaryEditForm
						key={editTarget.idp}
						beneficiary={editTarget}
						isAgent={editTarget.codeFamille === "AGENT"}
						submitting={submitting}
						onSubmit={handleEdit}
						onCancel={() => setEditTarget(null)}
					/>
				)}
			</Modal>

			<Modal
				open={Boolean(observationTarget)}
				title="Observation IDP"
				description={
					observationTarget
						? `${observationTarget.nom} ${observationTarget.prenom} — ${observationTarget.idp}`
						: ""
				}
				onClose={() => setObservationTarget(null)}
				width="max-w-lg"
			>
				{observationTarget && (
					<BeneficiaryObservationForm
						beneficiary={observationTarget}
						submitting={submitting}
						onSubmit={handleObservation}
						onCancel={() => setObservationTarget(null)}
					/>
				)}
			</Modal>
		</>
	);
}
