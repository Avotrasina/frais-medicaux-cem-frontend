import { Plus, RefreshCw } from "lucide-react";
import { useMemo, useState, type FormEvent, type ReactNode } from "react";
import { DataTable, type Column } from "../components/ui/DataTable";
import { ErrorBlock, LoadingBlock } from "../components/ui/Feedback";
import { InlineCell } from "../components/ui/InlineCell";
import { PageHeader } from "../components/ui/PageHeader";
import { ToastViewport } from "../components/ui/Toast";
import { useReferentials } from "../features/referentials/hooks/useReferentials";
import {
	createProviderCategory,
	updateProviderCategory,
} from "../features/providers/services/providers";
import { requestDeletion, type DeletionResource } from "../features/deletions/services/deletions";
import {
	createAgence,
	createAgentCategory,
	createDirection,
	createLieu,
	createService,
	moveService,
	updateAgence,
	updateAgentCategory,
	updateDirection,
	updateLieu,
	updateServiceName,
} from "../features/referentials/services/referentials";
import { errorMessage } from "../utils/errors";
import { notify } from "../utils/notify";

type TabKey =
	| "lieux"
	| "categories-prestataires"
	| "categories-agents"
	| "structure";

const TABS: { key: TabKey; label: string }[] = [
	{ key: "lieux", label: "Lieux" },
	{ key: "categories-prestataires", label: "Catégories prestataires" },
	{ key: "categories-agents", label: "Catégories agents" },
	{ key: "structure", label: "Agences / Directions / Services" },
];

interface SimpleRow {
	id: number;
	code: string;
	valeur: string;
}

/**
 * Generic panel for the flat referentials (`/locations`,
 * `/provider-categories`, `/agent-categories`).
 * Names are edited inline, which mirrors the behaviour of the other tables.
 */
function SimpleReferentialPanel({
	label,
	valeurLabel,
	rows,
	valuePlaceholder,
	createPlaceholder,
	onCreate,
	onUpdate,
	onDelete,
	empty,
}: {
	label: string;
	valeurLabel: string;
	rows: SimpleRow[];
	valuePlaceholder: string;
	createPlaceholder: string;
	onCreate: (value: string) => Promise<void>;
	onUpdate: (id: number, value: string) => Promise<void>;
	onDelete: (row: SimpleRow) => Promise<void>;
	empty: string;
}) {
	const [draft, setDraft] = useState("");
	const [busy, setBusy] = useState(false);

	async function handleDelete(row: SimpleRow): Promise<void> {
		setBusy(true);
		try {
			await onDelete(row);
			notify(`Demande de suppression envoyée pour ${label.toLowerCase()}.`);
		} catch (caught) {
			notify(errorMessage(caught, "Demande de suppression impossible."), "error");
		} finally {
			setBusy(false);
		}
	}

	const columns: Column<SimpleRow>[] = [
		{
			key: "code",
			label: "Identifiant",
			render: (row) => (
				<span className="font-mono text-xs text-slate-500">{row.code}</span>
			),
		},
		{
			key: "valeur",
			label: valeurLabel,
			render: (row) => (
				<InlineCell
					value={row.valeur}
					onSave={(value) => {
						const trimmed = value.trim();
						if (!trimmed || trimmed === row.valeur) return;
						void (async () => {
							try {
								await onUpdate(row.id, trimmed);
								notify(`${label} mis �???  jour.`);
							} catch (caught) {
								notify(
									errorMessage(caught, "Mise �???  jour impossible."),
									"error",
								);
							}
						})();
					}}
				/>
			),
		},
	];

	async function handleCreate(event: FormEvent) {
		event.preventDefault();
		const trimmed = draft.trim();
		if (!trimmed) return;
		setBusy(true);
		try {
			await onCreate(trimmed);
			setDraft("");
			notify(`${label} créé.`);
		} catch (caught) {
			notify(errorMessage(caught, "Création impossible."), "error");
		} finally {
			setBusy(false);
		}
	}

	return (
		<div className="space-y-4">
			<form
				className="panel flex flex-col gap-2 p-3 sm:flex-row sm:items-center"
				onSubmit={handleCreate}
			>
				<input
					className="field flex-1"
					value={draft}
					placeholder={createPlaceholder}
					onChange={(event) => setDraft(event.target.value)}
				/>
				<button className="btn-primary" disabled={busy || !draft.trim()}>
					<Plus size={16} /> Ajouter
				</button>
			</form>
			<DataTable
				rows={rows}
				columns={columns}
				empty={empty}
				onDelete={(row) => void handleDelete(row)}
			/>
			<p className="text-xs text-slate-400">
				Cliquez sur une valeur pour la modifier (clé d'édition :{" "}
				<span className="font-mono">{valuePlaceholder}</span>).
			</p>
		</div>
	);
}

export default function ReferentielsPage() {
	const referentials = useReferentials();
	const [tab, setTab] = useState<TabKey>("lieux");

	async function submitDeletion(
		resource: DeletionResource,
		id: string | number,
	): Promise<void> {
		await requestDeletion(resource, id);
		await referentials.reload();
	}

	async function handleStructureDeletion(
		resource: "agency" | "direction" | "service",
		id: string,
		label: string,
	): Promise<void> {
		try {
			await submitDeletion(resource, id);
			notify(`Demande de suppression envoyée pour ${label}.`);
		} catch (caught) {
			notify(errorMessage(caught, "Demande de suppression impossible."), "error");
		}
	}

	const lieuRows = useMemo<SimpleRow[]>(
		() =>
			referentials.lieux.map((lieu) => ({
				id: lieu.id,
				code: `#${lieu.id}`,
				valeur: lieu.nom,
			})),
		[referentials.lieux],
	);

	const providerCategoryRows = useMemo<SimpleRow[]>(
		() =>
			referentials.providerCategories.map((categorie) => ({
				id: categorie.id,
				code: `#${categorie.id}`,
				valeur: categorie.nom,
			})),
		[referentials.providerCategories],
	);

	const agentCategoryRows = useMemo<SimpleRow[]>(
		() =>
			referentials.agentCategories.map((categorie) => ({
				id: categorie.id,
				code: `#${categorie.id}`,
				valeur: categorie.codeCategory,
			})),
		[referentials.agentCategories],
	);

	const agenceColumns: Column<{
		id: string;
		codeAgence: string;
		nomAgence: string;
	}>[] = [
		{
			key: "codeAgence",
			label: "Code agence",
			render: (row) => (
				<span className="font-mono text-xs font-bold">{row.codeAgence}</span>
			),
		},
		{
			key: "nomAgence",
			label: "Nom",
			render: (row) => (
				<InlineCell
					value={row.nomAgence}
					onSave={(value) => {
						const trimmed = value.trim();
						if (!trimmed || trimmed === row.nomAgence) return;
						void (async () => {
							try {
								await updateAgence(row.codeAgence, trimmed);
								await referentials.reload();
								notify("Agence mise �???  jour.");
							} catch (caught) {
								notify(
									errorMessage(caught, "Mise �???  jour impossible."),
									"error",
								);
							}
						})();
					}}
				/>
			),
		},
	];

	const directionColumns: Column<{
		id: string;
		codeDirection: string;
		nom: string;
		serviceCount: number;
	}>[] = [
		{
			key: "codeDirection",
			label: "Code direction",
			render: (row) => (
				<span className="font-mono text-xs font-bold">{row.codeDirection}</span>
			),
		},
		{
			key: "nom",
			label: "Nom",
			render: (row) => (
				<InlineCell
					value={row.nom}
					onSave={(value) => {
						const trimmed = value.trim();
						if (!trimmed || trimmed === row.nom) return;
						void (async () => {
							try {
								await updateDirection(row.codeDirection, trimmed);
								await referentials.reload();
								notify("Direction mise �???  jour.");
							} catch (caught) {
								notify(
									errorMessage(caught, "Mise �???  jour impossible."),
									"error",
								);
							}
						})();
					}}
				/>
			),
		},
		{
			key: "serviceCount",
			label: "Services",
			render: (row) => `${row.serviceCount}`,
		},
	];

	const serviceColumns: Column<{
		id: string;
		codeService: string;
		nom: string;
		codeDirection: string;
	}>[] = [
		{
			key: "codeService",
			label: "Code service",
			render: (row) => (
				<span className="font-mono text-xs font-bold">{row.codeService}</span>
			),
		},
		{
			key: "nom",
			label: "Nom",
			render: (row) => (
				<InlineCell
					value={row.nom}
					onSave={(value) => {
						const trimmed = value.trim();
						if (!trimmed || trimmed === row.nom) return;
						void (async () => {
							try {
								await updateServiceName(row.codeService, trimmed);
								await referentials.reload();
								notify("Service mis �???  jour.");
							} catch (caught) {
								notify(
									errorMessage(caught, "Mise �???  jour impossible."),
									"error",
								);
							}
						})();
					}}
				/>
			),
		},
		{
			key: "codeDirection",
			label: "Direction",
			render: (row) => (
				<select
					className="rounded-lg border border-slate-200 bg-white px-2 py-1 text-xs"
					value={row.codeDirection}
					onChange={(event) => {
						const next = event.target.value;
						if (next === row.codeDirection) return;
						void (async () => {
							try {
								await moveService(row.codeService, next);
								await referentials.reload();
								notify(
									"Service déplacé ; le rattachement des agents a été mis �???  jour par le serveur.",
								);
							} catch (caught) {
								notify(
									errorMessage(caught, "Déplacement impossible."),
									"error",
								);
							}
						})();
					}}
				>
					{referentials.directions.map((direction) => (
						<option
							key={direction.codeDirection}
							value={direction.codeDirection}
						>
							{direction.nom}
						</option>
					))}
				</select>
			),
		},
	];

	const agenceRows = useMemo(
		() =>
			referentials.agences.map((agence) => ({
				...agence,
				id: agence.codeAgence,
			})),
		[referentials.agences],
	);
	const directionRows = useMemo(
		() =>
			referentials.directions.map((direction) => ({
				id: direction.codeDirection,
				codeDirection: direction.codeDirection,
				nom: direction.nom,
				serviceCount: direction.services?.length ?? 0,
			})),
		[referentials.directions],
	);
	const serviceRows = useMemo(
		() =>
			referentials.services.map((service) => ({
				...service,
				id: service.codeService,
			})),
		[referentials.services],
	);

	return (
		<>
			<ToastViewport />
			<PageHeader
				title="Référentiels"
				description="Lieux, catégories et structure organisationnelle alimentent les listes déroulantes des autres modules."
				actions={
					<button
						className="btn-secondary"
						onClick={() => void referentials.reload()}
					>
						<RefreshCw size={16} /> Actualiser
					</button>
				}
			/>

			<div className="mb-4 flex flex-wrap gap-2">
				{TABS.map((entry) => (
					<button
						key={entry.key}
						onClick={() => setTab(entry.key)}
						className={
							entry.key === tab
								? "rounded-xl bg-slate-900 px-3.5 py-2 text-sm font-bold text-white"
								: "rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50"
						}
					>
						{entry.label}
					</button>
				))}
			</div>

			{referentials.error && (
				<div className="mb-4">
					<ErrorBlock
						message={referentials.error}
						onRetry={() => void referentials.reload()}
					/>
				</div>
			)}

			{referentials.loading ? (
				<LoadingBlock label="Chargement des référentiels…" />
			) : (
				<>
					{tab === "lieux" && (
						<SimpleReferentialPanel
							label="Lieu"
							valeurLabel="Nom du lieu"
							rows={lieuRows}
							valuePlaceholder="/locations/:id"
							createPlaceholder="Nom du nouveau lieu"
							empty="Aucun lieu enregistré."
							onCreate={async (value) => {
								await createLieu(value);
								await referentials.reload();
							}}
							onUpdate={async (id, value) => {
								await updateLieu(id, value);
								await referentials.reload();
							}}
							onDelete={(row) => submitDeletion("location", row.id)}
						/>
					)}

					{tab === "categories-prestataires" && (
						<SimpleReferentialPanel
							label="Catégorie prestataire"
							valeurLabel="Nom de la catégorie"
							rows={providerCategoryRows}
							valuePlaceholder="/provider-categories/:id"
							createPlaceholder="Nom de la nouvelle catégorie"
							empty="Aucune catégorie de prestataire enregistrée."
							onCreate={async (value) => {
								await createProviderCategory(value);
								await referentials.reload();
							}}
							onUpdate={async (id, value) => {
								await updateProviderCategory(id, value);
								await referentials.reload();
							}}
							onDelete={(row) => submitDeletion("providerCategory", row.id)}
						/>
					)}

					{tab === "categories-agents" && (
						<>
							<div className="mt-4">
								<SimpleReferentialPanel
									label="Catégorie agent"
									valeurLabel="Code de catégorie"
									rows={agentCategoryRows}
									valuePlaceholder="/agent-categories/:id"
									createPlaceholder="Nouveau code de catégorie (unique)"
									empty="Aucune catégorie d'agent enregistrée."
									onCreate={async (value) => {
										await createAgentCategory(value);
										await referentials.reload();
									}}
									onUpdate={async (id, value) => {
										await updateAgentCategory(id, value);
										await referentials.reload();
									}}
									onDelete={(row) => submitDeletion("agentCategory", row.id)}
								/>
							</div>
						</>
					)}

					{tab === "structure" && (
						<div className="space-y-8">
							<StructureSection
								title="Agences"
								description="Le code agence sert d'identifiant de structure pour les agents affectés en agence."
								form={
									<InlineCreate
										fields={[
											{
												name: "code",
												placeholder: "Code agence",
												width: "w-40",
											},
											{ name: "nom", placeholder: "Nom de l'agence" },
										]}
										submitLabel="Ajouter l'agence"
										onSubmit={async (values) => {
											await createAgence(values.code, values.nom);
											await referentials.reload();
											notify("Agence créée.");
										}}
									/>
								}
							>
								<DataTable
									rows={agenceRows}
									columns={agenceColumns}
									empty="Aucune agence enregistrée."
									onDelete={(row) =>
										void handleStructureDeletion(
											"agency",
											row.codeAgence,
											"l’agence",
										)
									}
								/>
							</StructureSection>

							<StructureSection
								title="Directions"
								description="Une direction regroupe des services ; les agents affectés en direction s'y rattachent."
								form={
									<InlineCreate
										fields={[
											{
												name: "code",
												placeholder: "Code direction",
												width: "w-40",
											},
											{ name: "nom", placeholder: "Nom de la direction" },
										]}
										submitLabel="Ajouter la direction"
										onSubmit={async (values) => {
											await createDirection(values.code, values.nom);
											await referentials.reload();
											notify("Direction créée.");
										}}
									/>
								}
							>
								<DataTable
									rows={directionRows}
									columns={directionColumns}
									empty="Aucune direction enregistrée."
									onDelete={(row) =>
										void handleStructureDeletion(
											"direction",
											row.codeDirection,
											"la direction",
										)
									}
								/>
							</StructureSection>

							<StructureSection
								title="Services"
								description="Changer la direction d'un service réaffecte aussi tous ses agents (opération transactionnelle côté serveur)."
								form={
									<InlineCreate
										fields={[
											{
												name: "code",
												placeholder: "Code service",
												width: "w-40",
											},
											{ name: "nom", placeholder: "Nom du service" },
											{
												name: "codeDirection",
												placeholder: "Direction",
												isSelect: true,
												options: referentials.directions.map((direction) => ({
													value: direction.codeDirection,
													label: direction.nom,
												})),
											},
										]}
										submitLabel="Ajouter le service"
										onSubmit={async (values) => {
											await createService(
												values.code,
												values.nom,
												values.codeDirection,
											);
											await referentials.reload();
											notify("Service créé.");
										}}
									/>
								}
							>
								<DataTable
									rows={serviceRows}
									columns={serviceColumns}
									empty="Aucun service enregistré."
									onDelete={(row) =>
										void handleStructureDeletion(
											"service",
											row.codeService,
											"le service",
										)
									}
								/>
							</StructureSection>
						</div>
					)}
				</>
			)}
		</>
	);
}

function StructureSection({
	title,
	description,
	form,
	children,
}: {
	title: string;
	description: string;
	form: ReactNode;
	children: ReactNode;
}) {
	return (
		<section className="space-y-3">
			<div>
				<h2 className="text-base font-extrabold text-slate-800">{title}</h2>
				<p className="mt-0.5 text-xs text-slate-500">{description}</p>
			</div>
			{form}
			{children}
		</section>
	);
}

interface InlineField {
	name: string;
	placeholder: string;
	width?: string;
	isSelect?: boolean;
	options?: { value: string; label: string }[];
}

function InlineCreate({
	fields,
	submitLabel,
	onSubmit,
}: {
	fields: InlineField[];
	submitLabel: string;
	onSubmit: (values: Record<string, string>) => Promise<void>;
}) {
	const [values, setValues] = useState<Record<string, string>>({});
	const [busy, setBusy] = useState(false);

	async function handleSubmit(event: FormEvent) {
		event.preventDefault();
		const missing = fields.filter(
			(field) => !(values[field.name] ?? "").trim(),
		);
		if (missing.length > 0) {
			notify("Complétez tous les champs du formulaire.", "error");
			return;
		}
		setBusy(true);
		try {
			await onSubmit(
				Object.fromEntries(
					Object.entries(values).map(([key, value]) => [key, value.trim()]),
				),
			);
			setValues({});
		} catch (caught) {
			notify(errorMessage(caught, "Création impossible."), "error");
		} finally {
			setBusy(false);
		}
	}

	return (
		<form
			className="panel flex flex-col gap-2 p-3 sm:flex-row sm:items-center"
			onSubmit={handleSubmit}
		>
			{fields.map((field) =>
				field.isSelect ? (
					<select
						key={field.name}
						className="field flex-1"
						value={values[field.name] ?? ""}
						onChange={(event) =>
							setValues((current) => ({
								...current,
								[field.name]: event.target.value,
							}))
						}
					>
						<option value="">-- {field.placeholder} --</option>
						{(field.options ?? []).map((option) => (
							<option key={option.value} value={option.value}>
								{option.label}
							</option>
						))}
					</select>
				) : (
					<input
						key={field.name}
						className={`field flex-1 ${field.width ?? ""}`}
						placeholder={field.placeholder}
						value={values[field.name] ?? ""}
						onChange={(event) =>
							setValues((current) => ({
								...current,
								[field.name]: event.target.value,
							}))
						}
					/>
				),
			)}
			<button className="btn-primary" disabled={busy}>
				<Plus size={16} /> {submitLabel}
			</button>
		</form>
	);
}
