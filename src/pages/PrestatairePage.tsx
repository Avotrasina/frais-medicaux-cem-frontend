import { Plus, RefreshCw, Search } from "lucide-react";
import { useCallback, useMemo, useState } from "react";
import { Badge } from "../components/Badge";
import { DataTable, type Column } from "../components/DataTable";
import { ErrorBlock, LoadingBlock } from "../components/Feedback";
import { Modal } from "../components/Modal";
import { PageHeader } from "../components/PageHeader";
import { ProviderForm } from "../components/providers/ProviderForm";
import { ToastViewport } from "../components/Toast";
import { useReferentials } from "../hooks/useReferentials";
import { useAsyncLoader } from "../hooks/useAsyncLoader";
import {
	createProvider,
	filterProviders,
	listProviders,
	updateProvider,
} from "../services/providers";
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
			]
				.join(" ")
				.toLowerCase()
				.includes(needle),
		);
	}, [providers, query]);

	const categorieNames = useMemo(() => {
		const map = new Map<number, string>();
		referentials.providerCategories.forEach((categorie) =>
			map.set(categorie.id, categorie.nom),
		);
		return map;
	}, [referentials.providerCategories]);

	const columns: Column<Provider>[] = [
		{
			key: "adresse",
			label: "Adresse",
			render: (row) => orDash(row.adresse),
		},
		{
			key: "categorieID",
			label: "Catégorie",
			render: (row) =>
				categorieNames.get(row.categorieID) ?? `#${row.categorieID}`,
		},
		{
			key: "listePrestation",
			label: "Acte / Prestation",
			className: "max-w-[260px] whitespace-normal",
			render: (row) => (
				<span className="text-xs text-slate-600">
					{orDash(row.listePrestation)}
				</span>
			),
		},
		{
			key: "statut",
			label: "Statut (Public/Privé)",
			render: (row) => (
				<Badge tone={row.statut === "PUBLIC" ? "blue" : "slate"}>
					{labelProviderStatus(row.statut)}
				</Badge>
			),
		},
		{
			key: "nif",
			label: "NIF",
			render: (row) => <span className="font-mono text-xs">{row.nif}</span>,
		},
		{
			key: "stat",
			label: "NSTAT",
			render: (row) => <span className="font-mono text-xs">{row.stat}</span>,
		},
		{
			key: "dateDebutConvention",
			label: "Date Début Convention",
			render: (row) => formatDate(row.dateDebutConvention),
		},
		{
			key: "dateFinConvention",
			label: "Date Fin Convention",
			render: (row) => formatDate(row.dateFinConvention),
		},
		{ key: "scanConvention", label: "Scan Convention", render: () => "—" },
		{ key: "parQui", label: "ParQui?", render: () => "—" },
	];

	async function handleCreate(input: CreateProviderInput): Promise<void> {
		setSubmitting(true);
		try {
			await createProvider(input);
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
	): Promise<void> {
		setSubmitting(true);
		try {
			await updateProvider(id, input);
			notify("Prestataire mis à jour.");
			setEditTarget(null);
			await fetchProviders(() => false);
		} catch (caught) {
			notify(errorMessage(caught, "Mise à jour impossible."), "error");
		} finally {
			setSubmitting(false);
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

			<div className="panel mb-4 space-y-3 p-4">
				<div className="grid gap-3 lg:grid-cols-3">
					<div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 lg:col-span-1">
						<Search size={16} className="shrink-0 text-slate-400" />
						<input
							className="h-10 min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-slate-400"
							value={query}
							placeholder="Rechercher un nom, un NIF, une adresse…"
							onChange={(event) => setQuery(event.target.value)}
						/>
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
				<p className="text-xs text-slate-400">
					{visible.length} prestataire(s) affiché(s) sur {providers.length}{" "}
					chargé(s). Les filtres lieu et catégorie sont appliqués par le serveur
					(<span className="font-mono">/providers/filter</span>).
				</p>
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
