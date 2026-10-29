import { ChevronDown, FileText, Plus, RefreshCw, Search } from "lucide-react";
import { useCallback, useMemo, useState } from "react";
import { Badge } from "../components/ui/Badge";
import { DataTable, type Column } from "../components/ui/DataTable";
import { ErrorBlock, LoadingBlock } from "../components/ui/Feedback";
import { Modal } from "../components/ui/Modal";
import { PageHeader } from "../components/ui/PageHeader";
import { ProviderForm } from "../features/providers/components/ProviderForm";
import { ToastViewport } from "../components/ui/Toast";
import { useReferentials } from "../features/referentials/hooks/useReferentials";
import { useAsyncLoader } from "../hooks/useAsyncLoader";
import {
	createProvider,
	filterProviders,
	listProviders,
	updateProvider,
	updateProviderConvention,
} from "../features/providers/services/providers";
import { resolveProviderConventionUrl } from "../services/api";
import { requestDeletion } from "../features/deletions/services/deletions";
import type { CreateProviderInput, Provider } from "../types/api";
import { errorMessage } from "../utils/errors";
import { formatDate, labelProviderStatus, orDash } from "../utils/format";
import { notify } from "../utils/notify";

export default function PrestatairePage() {
	const referentials = useReferentials();

	const [providers, setProviders] = useState<Provider[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	const [lieuFilter, setLieuFilter] = useState("");
	const [categorieFilter, setCategorieFilter] = useState("");
	const [query, setQuery] = useState("");

	const [createOpen, setCreateOpen] = useState(false);
	const [editTarget, setEditTarget] = useState<Provider | null>(null);
	const [submitting, setSubmitting] = useState(false);

	/**
	 * Reads the provider list for the active lieu/category filters.
	 * No state is written before the first `await`, which keeps the effect
	 * below free of synchronous renders. Every write is guarded by `isStale()`,
	 * so switching two filters quickly cannot let the first response overwrite
	 * the second one.
	 */
	const fetchProviders = useCallback(
		async (isStale: () => boolean) => {
			try {
				const filter: { lieuID?: number; categorieID?: number } = {};
				if (lieuFilter) filter.lieuID = Number(lieuFilter);
				if (categorieFilter) filter.categorieID = Number(categorieFilter);
				const rows =
					Object.keys(filter).length > 0
						? await filterProviders(filter)
						: await listProviders();
				if (isStale()) return;
				setProviders(rows);
				setError(null);
			} catch (caught) {
				if (isStale()) return;
				setProviders([]);
				setError(
					errorMessage(caught, "Impossible de charger les prestataires."),
				);
			} finally {
				if (!isStale()) setLoading(false);
			}
		},
		[lieuFilter, categorieFilter],
	);

	/** Manual refresh: re-displays the spinner before loading again. */
	const refresh = useCallback(async () => {
		setLoading(true);
		setError(null);
		await fetchProviders(() => false);
	}, [fetchProviders]);

	useAsyncLoader(fetchProviders);

	// The API has no free-text search on providers, so the search box filters
	// the rows already loaded from the server.
	const categorieNames = useMemo(() => {
		const map = new Map<number, string>();
		referentials.providerCategories.forEach((categorie) =>
			map.set(categorie.id, categorie.nom),
		);
		return map;
	}, [referentials.providerCategories]);
	const lieuNames = useMemo(() => {
		const map = new Map<number, string>();
		referentials.lieux.forEach((lieu) => map.set(lieu.id, lieu.nom));
		return map;
	}, [referentials.lieux]);
	const visible = useMemo(() => {
		const needle = query.trim().toLowerCase();
		if (!needle) return providers;
		return providers.filter((provider) =>
			[
				provider.nom,
				provider.adresse,
				provider.nif,
				provider.stat,
				provider.listePrestation,
				provider.echeanceRenouvellement,
				provider.echeanceResiliation,
				provider.observation,
				labelProviderStatus(provider.statut),
				categorieNames.get(provider.categorieID),
				lieuNames.get(provider.lieuID),
			]
				.join(" ")
				.toLowerCase()
				.includes(needle),
		);
	}, [providers, query, categorieNames, lieuNames]);
	const hasFilters = Boolean(query.trim() || lieuFilter || categorieFilter);

	const columns: Column<Provider>[] = [
		{
			key: "nom",
			label: "Prestataire",
			className: "min-w-[190px] whitespace-normal",
			render: (row) => (
				<span className="font-semibold text-slate-800">{row.nom}</span>
			),
		},
		{
			key: "statut",
			label: "Statut",
			render: (row) => (
				<Badge tone={row.statut === "PUBLIC" ? "blue" : "slate"}>
					{labelProviderStatus(row.statut)}
				</Badge>
			),
		},
		{
			key: "categorieID",
			label: "Catégorie",
			className: "min-w-[130px]",
			render: (row) =>
				categorieNames.get(row.categorieID) ?? `#${row.categorieID}`,
		},
		{
			key: "lieuID",
			label: "Lieu",
			className: "min-w-[120px]",
			render: (row) => lieuNames.get(row.lieuID) ?? `#${row.lieuID}`,
		},
		{
			key: "adresse",
			label: "Adresse",
			className: "max-w-[220px] whitespace-normal",
			render: (row) => orDash(row.adresse),
		},
		{
			key: "nif",
			label: "NIF",
			className: "min-w-[130px]",
			render: (row) => <span className="font-mono text-xs">{row.nif}</span>,
		},
		{
			key: "stat",
			label: "NSTAT",
			className: "min-w-[150px]",
			render: (row) => <span className="font-mono text-xs">{row.stat}</span>,
		},
		{
			key: "listePrestation",
			label: "Actes / Prestations",
			className: "w-[260px] max-w-[260px]",
			wrap: true,
			render: (row) => {
				const prestations = orDash(row.listePrestation);
				if (prestations.length <= 110) {
					return <span className="text-xs text-slate-600">{prestations}</span>;
				}
				return (
					<details className="group max-w-[260px] whitespace-normal break-words">
						<summary
							className="flex cursor-pointer list-none items-start gap-2 rounded-sm text-left focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-600"
							title="Afficher ou réduire la liste complète"
						>
							<span className="line-clamp-2 min-w-0 flex-1 text-xs leading-5 text-slate-600 group-open:hidden">
								{prestations}
							</span>
							<span className="hidden shrink-0 pt-0.5 text-[11px] font-semibold text-red-700 group-open:inline">
								Réduire
							</span>
							<span className="shrink-0 pt-0.5 text-[11px] font-semibold text-red-700 group-open:hidden">
								Détails
							</span>
							<ChevronDown
								size={14}
								aria-hidden="true"
								className="mt-0.5 shrink-0 text-slate-400 transition-transform group-open:rotate-180"
							/>
						</summary>
						<div className="mt-2 border-l-2 border-red-100 pl-2 text-xs leading-5 break-words text-slate-700">
							{prestations}
						</div>
					</details>
				);
			},
		},
		{
			key: "echeanceRenouvellement",
			label: "Échéance renouvellement",
			className: "min-w-[180px] max-w-[220px] whitespace-normal",
			render: (row) => orDash(row.echeanceRenouvellement),
		},
		{
			key: "echeanceResiliation",
			label: "Échéance résiliation",
			className: "min-w-[180px] max-w-[220px] whitespace-normal",
			render: (row) => orDash(row.echeanceResiliation),
		},
		{
			key: "observation",
			label: "Observation",
			className: "min-w-[180px] max-w-[260px] whitespace-normal",
			render: (row) => orDash(row.observation),
		},
		{
			key: "convention",
			label: "Convention",
			className: "min-w-[175px] whitespace-normal",
			render: (row) => (
				<div className="space-y-1.5">
					<div className="text-xs tabular-nums text-slate-600">
						{formatDate(row.dateDebutConvention)} –{" "}
						{formatDate(row.dateFinConvention)}
					</div>
					<a
						href={resolveProviderConventionUrl(row.id)}
						target="_blank"
						rel="noreferrer"
						className="inline-flex items-center gap-1.5 text-xs font-semibold text-red-700 underline decoration-red-300 underline-offset-2 hover:text-red-900"
					>
						<FileText size={14} /> Voir le PDF
					</a>
				</div>
			),
		},
	];

	async function handleCreate(
		input: CreateProviderInput,
		convention: File,
	): Promise<void> {
		setSubmitting(true);
		try {
			await createProvider(input, convention);
			notify("Prestataire créé avec succès.");
			setCreateOpen(false);
			await fetchProviders(() => false);
		} catch (caught) {
			notify(errorMessage(caught, "Création impossible."), "error");
		} finally {
			setSubmitting(false);
		}
	}

	async function handleUpdate(
		id: number,
		input: Partial<CreateProviderInput>,
		convention?: File,
	): Promise<void> {
		setSubmitting(true);
		try {
			if (Object.keys(input).length > 0) await updateProvider(id, input);
			if (convention) await updateProviderConvention(id, convention);
			notify("Prestataire mis à jour.");
			setEditTarget(null);
			await fetchProviders(() => false);
		} catch (caught) {
			notify(errorMessage(caught, "Mise à jour impossible."), "error");
		} finally {
			setSubmitting(false);
		}
	}

	async function handleDelete(provider: Provider): Promise<void> {
		try {
			await requestDeletion("provider", provider.id);
			notify("Demande de suppression envoyée.");
			await fetchProviders(() => false);
		} catch (caught) {
			notify(
				errorMessage(caught, "Demande de suppression impossible."),
				"error",
			);
		}
	}

	return (
		<>
			<ToastViewport />
			<PageHeader
				title="Gestion des Prestataires"
				description="Établissements conventionnés : coordonnées, identifiants fiscaux, convention et prestations couvertes."
				actions={
					<>
						<button className="btn-secondary" onClick={() => void refresh()}>
							<RefreshCw size={16} /> Actualiser
						</button>
						<button className="btn-primary" onClick={() => setCreateOpen(true)}>
							<Plus size={16} /> Nouveau prestataire
						</button>
					</>
				}
			/>

			<div className="panel mb-4 space-y-3 p-3">
				<div className="grid gap-3 md:grid-cols-[minmax(220px,1.2fr)_minmax(170px,0.9fr)_minmax(170px,0.9fr)]">
					<div>
						<label className="label" htmlFor="provider-search">
							Recherche
						</label>
						<div className="flex h-[2.75rem] items-center gap-2 rounded-lg border border-slate-200 bg-white px-2.5 focus-within:border-red-400 focus-within:ring-2 focus-within:ring-red-100">
							<Search size={15} className="shrink-0 text-slate-400" />
							<input
								id="provider-search"
								className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-slate-400"
								value={query}
								placeholder="Nom, identifiant, adresse…"
								onChange={(event) => setQuery(event.target.value)}
							/>
						</div>
					</div>
					<div>
						<label className="label">Lieu</label>
						<select
							className="field"
							value={lieuFilter}
							onChange={(event) => {
								setLoading(true);
								setLieuFilter(event.target.value);
							}}
						>
							<option value="">-- Tous les lieux --</option>
							{referentials.lieux.map((lieu) => (
								<option key={lieu.id} value={lieu.id}>
									{lieu.nom}
								</option>
							))}
						</select>
					</div>
					<div>
						<label className="label">Catégorie</label>
						<select
							className="field"
							value={categorieFilter}
							onChange={(event) => {
								setLoading(true);
								setCategorieFilter(event.target.value);
							}}
						>
							<option value="">-- Toutes les catégories --</option>
							{referentials.providerCategories.map((categorie) => (
								<option key={categorie.id} value={categorie.id}>
									{categorie.nom}
								</option>
							))}
						</select>
					</div>
				</div>
				<div className="flex flex-col gap-2 border-t border-slate-100 pt-2 text-xs text-slate-500 sm:flex-row sm:items-center sm:justify-between">
					<span>
						{visible.length} prestataire(s) affiché(s) sur {providers.length}{" "}
						chargé(s).
					</span>
					<span>Les filtres lieu/catégorie sont appliqués par le serveur.</span>
					{hasFilters && (
						<button
							type="button"
							className="self-start font-semibold text-red-700 hover:text-red-900 sm:self-auto"
							onClick={() => {
								setQuery("");
								if (lieuFilter || categorieFilter) setLoading(true);
								setLieuFilter("");
								setCategorieFilter("");
							}}
						>
							Effacer les filtres
						</button>
					)}
				</div>
			</div>

			<div className="mt-4 space-y-4">
				{loading && <LoadingBlock label="Chargement des prestataires…" />}
				{error && <ErrorBlock message={error} onRetry={() => void refresh()} />}

				{!loading && !error && (
					<DataTable
						rows={visible}
						columns={columns}
						empty="Aucun prestataire pour ces critères."
						onEdit={(row) => setEditTarget(row)}
						onDelete={(row) => void handleDelete(row)}
					/>
				)}
			</div>

			<Modal
				open={createOpen}
				title="Nouveau prestataire"
				description="NIF et STAT doivent être uniques."
				onClose={() => setCreateOpen(false)}
			>
				<ProviderForm
					mode="create"
					referentials={referentials}
					submitting={submitting}
					onCreate={handleCreate}
					onUpdate={handleUpdate}
					onCancel={() => setCreateOpen(false)}
				/>
			</Modal>

			<Modal
				open={Boolean(editTarget)}
				title={`Modifier ${editTarget?.nom ?? ""}`}
				description="Seuls les champs modifiés sont transmis."
				onClose={() => setEditTarget(null)}
			>
				{editTarget && (
					<ProviderForm
						key={editTarget.id}
						mode="edit"
						provider={editTarget}
						referentials={referentials}
						submitting={submitting}
						onCreate={handleCreate}
						onUpdate={handleUpdate}
						onCancel={() => setEditTarget(null)}
					/>
				)}
			</Modal>
		</>
	);
}
