import { Check, Download, Eye, Plus, RefreshCw, Search, X } from "lucide-react";
import {
	useCallback,
	useEffect,
	useMemo,
	useRef,
	useState,
	type FormEvent,
} from "react";
import { AttestationForm } from "../components/pec/AttestationForm";
import { Badge } from "../components/Badge";
import { DataTable, type Column } from "../components/DataTable";
import { ErrorBlock, LoadingBlock } from "../components/Feedback";
import { ImageThumb } from "../components/ImageThumb";
import { Modal } from "../components/Modal";
import { PageHeader } from "../components/PageHeader";
import { ToastViewport } from "../components/Toast";
import { useAsyncLoader } from "../hooks/useAsyncLoader";
import { listAgents } from "../services/agents";
import {
	approveAttestation,
	createAttestation,
	getAttestationPreview,
	listPendingAttestations,
	rejectAttestation,
} from "../services/attestations";
import { getBeneficiaryByIdp } from "../services/beneficiaries";
import { listProviders } from "../services/providers";
import {
	listDirections,
	listLieux,
	listServices,
} from "../services/referentials";
import type {
	AgentItem,
	Beneficiary,
	Direction,
	Lieu,
	Provider,
	Service,
} from "../types/api";
import type {
	Attestation,
	AttestationFormValues,
	AttestationTableRow,
} from "../types/attestation";
import { errorMessage } from "../utils/errors";
import {
	calculateAge,
	formatDate,
	labelCodeFamille,
	labelStatutPEC,
	orDash,
} from "../utils/format";
import { notify } from "../utils/notify";

function referenceFor(attestation: Attestation): string {
	return `${attestation.createdAt.slice(0, 4)} - ${attestation.id}`;
}

export default function PriseEnChargePage() {
	const [attestations, setAttestations] = useState<Attestation[]>([]);
	const [agents, setAgents] = useState<AgentItem[]>([]);
	const [providers, setProviders] = useState<Provider[]>([]);
	const [services, setServices] = useState<Service[]>([]);
	const [directions, setDirections] = useState<Direction[]>([]);
	const [lieux, setLieux] = useState<Lieu[]>([]);
	const [beneficiaryCache, setBeneficiaryCache] = useState<
		Map<string, Beneficiary>
	>(new Map());
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [query, setQuery] = useState("");

	const [idpDraft, setIdpDraft] = useState("");
	const [searchedBeneficiary, setSearchedBeneficiary] =
		useState<Beneficiary | null>(null);
	const [searching, setSearching] = useState(false);
	const [searchError, setSearchError] = useState<string | null>(null);
	const [createOpen, setCreateOpen] = useState(false);
	const [submitting, setSubmitting] = useState(false);
	const [previewAttestation, setPreviewAttestation] =
		useState<Attestation | null>(null);
	const [previewUrl, setPreviewUrl] = useState<string | null>(null);
	const [previewLoading, setPreviewLoading] = useState(false);
	const [previewError, setPreviewError] = useState<string | null>(null);
	const [reviewTarget, setReviewTarget] = useState<{
		attestation: Attestation;
		action: "approve" | "reject";
	} | null>(null);
	const [reviewing, setReviewing] = useState(false);
	const previewRequestId = useRef(0);

	useEffect(() => {
		return () => {
			if (previewUrl) URL.revokeObjectURL(previewUrl);
		};
	}, [previewUrl]);

	const fetchPageData = useCallback(async (isStale: () => boolean) => {
		try {
			const [
				pending,
				agentList,
				providerList,
				serviceList,
				directionList,
				locationList,
			] = await Promise.all([
				listPendingAttestations(),
				listAgents(),
				listProviders(),
				listServices(),
				listDirections(),
				listLieux(),
			]);
			if (isStale()) return;

			const idps = [...new Set(pending.map((item) => item.idpBeneficiaire))];
			const beneficiaryResults = await Promise.all(
				idps.map(async (idp) => {
					try {
						return [idp, await getBeneficiaryByIdp(idp)] as const;
					} catch {
						return [idp, null] as const;
					}
				}),
			);
			if (isStale()) return;

			const nextBeneficiaries = new Map<string, Beneficiary>();
			for (const [idp, beneficiary] of beneficiaryResults) {
				if (beneficiary) nextBeneficiaries.set(idp, beneficiary);
			}
			setAttestations(pending);
			setAgents(agentList);
			setProviders(providerList);
			setServices(serviceList);
			setDirections(directionList);
			setLieux(locationList);
			setBeneficiaryCache(nextBeneficiaries);
			setError(null);
		} catch (caught) {
			if (isStale()) return;
			setError(
				errorMessage(
					caught,
					"Impossible de charger les prises en charge et leurs référentiels.",
				),
			);
		} finally {
			if (!isStale()) setLoading(false);
		}
	}, []);

	const refresh = useCallback(async () => {
		setLoading(true);
		setError(null);
		await fetchPageData(() => false);
	}, [fetchPageData]);

	useAsyncLoader(fetchPageData);

	const agentsByMatricule = useMemo(
		() => new Map(agents.map((agent) => [agent.matricule, agent])),
		[agents],
	);
	const providersById = useMemo(
		() => new Map(providers.map((provider) => [provider.id, provider])),
		[providers],
	);
	const servicesByCode = useMemo(
		() => new Map(services.map((service) => [service.codeService, service])),
		[services],
	);
	const directionsByCode = useMemo(
		() =>
			new Map(
				directions.map((direction) => [direction.codeDirection, direction]),
			),
		[directions],
	);
	const lieuxById = useMemo(
		() => new Map(lieux.map((lieu) => [lieu.id, lieu])),
		[lieux],
	);
	const searchedAgent = searchedBeneficiary
		? agentsByMatricule.get(searchedBeneficiary.matricule)
		: undefined;
	const searchedService = searchedAgent?.codeService
		? servicesByCode.get(searchedAgent.codeService)
		: undefined;
	const searchedDirection = searchedService
		? directionsByCode.get(searchedService.codeDirection)
		: undefined;

	const rows = useMemo<AttestationTableRow[]>(
		() =>
			attestations.map((attestation) => {
				const beneficiary = beneficiaryCache.get(attestation.idpBeneficiaire);
				const agent = beneficiary
					? agentsByMatricule.get(beneficiary.matricule)
					: undefined;
				const provider = providersById.get(attestation.prestataireID);
				const service = agent?.codeService
					? servicesByCode.get(agent.codeService)
					: undefined;
				return {
					...attestation,
					beneficiary,
					agent,
					provider,
					location: provider ? lieuxById.get(provider.lieuID) : undefined,
					service,
					direction: service
						? directionsByCode.get(service.codeDirection)
						: undefined,
				};
			}),
		[
			attestations,
			beneficiaryCache,
			agentsByMatricule,
			providersById,
			servicesByCode,
			directionsByCode,
			lieuxById,
		],
	);

	const visible = useMemo(() => {
		const needle = query.trim().toLowerCase();
		if (!needle) return rows;
		return rows.filter((row) =>
			[
				referenceFor(row),
				row.idpBeneficiaire,
				row.beneficiary
					? `${row.beneficiary.nom} ${row.beneficiary.prenom}`
					: "",
				row.provider?.nom ?? "",
				row.naturePrestation,
				row.servicePrestataire ?? "",
				row.statut,
			]
				.join(" ")
				.toLowerCase()
				.includes(needle),
		);
	}, [rows, query]);

	async function handleIdpSearch(event: FormEvent): Promise<void> {
		event.preventDefault();
		const idp = idpDraft.trim();
		setSearchedBeneficiary(null);
		setSearchError(null);
		if (!idp) {
			setSearchError("Saisissez un IDP pour lancer la recherche.");
			return;
		}

		setSearching(true);
		try {
			setSearchedBeneficiary(await getBeneficiaryByIdp(idp));
		} catch (caught) {
			setSearchError(errorMessage(caught, "Bénéficiaire introuvable."));
		} finally {
			setSearching(false);
		}
	}

	async function handleCreate(values: AttestationFormValues): Promise<void> {
		setSubmitting(true);
		try {
			const payload = {
				idpBeneficiaire: values.idpBeneficiaire,
				providerID: values.providerID,
				naturePrestation: values.naturePrestation,
				datePEC: values.datePEC,
				...(values.servicePrestataire
					? { servicePrestataire: values.servicePrestataire }
					: {}),
			};
			await createAttestation(payload);
			setCreateOpen(false);
			notify("Attestation créée.");
			await refresh();
		} catch (caught) {
			notify(errorMessage(caught, "Création impossible."), "error");
		} finally {
			setSubmitting(false);
		}
	}

	async function handleReview(): Promise<void> {
		if (!reviewTarget) return;
		setReviewing(true);
		try {
			if (reviewTarget.action === "approve") {
				await approveAttestation(reviewTarget.attestation.id);
				notify("Attestation validée.");
			} else {
				await rejectAttestation(reviewTarget.attestation.id);
				notify("Attestation rejetée.");
			}
			setReviewTarget(null);
			await refresh();
		} catch (caught) {
			notify(
				errorMessage(caught, "La décision n'a pas pu être enregistrée."),
				"error",
			);
		} finally {
			setReviewing(false);
		}
	}

	async function handlePreview(attestation: Attestation): Promise<void> {
		const requestId = ++previewRequestId.current;
		setPreviewAttestation(attestation);
		setPreviewUrl(null);
		setPreviewError(null);
		setPreviewLoading(true);
		try {
			const image = await getAttestationPreview(attestation.id);
			if (requestId !== previewRequestId.current) return;
			if (!image.type.startsWith("image/")) {
				throw new Error(
					"Le serveur n'a pas renvoyé une image d'aperçu valide.",
				);
			}
			setPreviewUrl(URL.createObjectURL(image));
		} catch (caught) {
			if (requestId === previewRequestId.current) {
				setPreviewError(
					errorMessage(
						caught,
						"Impossible de charger l'aperçu de l'attestation.",
					),
				);
			}
		} finally {
			if (requestId === previewRequestId.current) setPreviewLoading(false);
		}
	}

	function closePreview(): void {
		previewRequestId.current += 1;
		setPreviewAttestation(null);
		setPreviewUrl(null);
		setPreviewLoading(false);
		setPreviewError(null);
	}

	const columns: Column<AttestationTableRow>[] = [
		{
			key: "createdAt",
			label: "Date saisie",
			render: (row) => formatDate(row.createdAt),
		},
		{
			key: "idpBeneficiaire",
			label: "IDP",
			render: (row) => <span className="font-mono">{row.idpBeneficiaire}</span>,
		},
		{
			key: "beneficiary",
			label: "Nom et prénom bénéficiaire",
			render: (row) =>
				row.beneficiary
					? `${row.beneficiary.nom} ${row.beneficiary.prenom}`
					: "—",
		},
		{
			key: "codeFamille",
			label: "Code_Fam",
			render: (row) =>
				row.beneficiary ? labelCodeFamille(row.beneficiary.codeFamille) : "—",
		},
		{
			key: "dateNaissance",
			label: "Né(e) le",
			render: (row) => formatDate(row.beneficiary?.dateNaissance),
		},
		{
			key: "age",
			label: "Age",
			render: (row) => orDash(calculateAge(row.beneficiary?.dateNaissance)),
		},
		{
			key: "matricule",
			label: "IM",
			render: (row) => orDash(row.beneficiary?.matricule),
		},
		{
			key: "observationIDP",
			label: "Obs IDP",
			render: (row) => orDash(row.beneficiary?.observationIDP),
		},
		{
			key: "agentName",
			label: "Nom et prénoms Agent",
			render: (row) =>
				row.agent ? `${row.agent.nom} ${row.agent.prenom}` : "—",
		},
		{
			key: "statutPEC",
			label: "Statut PEC",
			render: (row) => (row.agent ? labelStatutPEC(row.agent.statutPEC) : "—"),
		},
		{
			key: "directionAgence",
			label: "Direction/Agence",
			render: (row) => {
				if (row.agent?.backOfficeFrontOffice === "RETRAITE") return "Retraité";
				if (row.direction) return row.direction.nom;
				return row.agent?.backOfficeFrontOffice === "AGENCE" ? "Agence" : "—";
			},
		},
		{
			key: "observationMatricule",
			label: "ObsIM",
			render: (row) => orDash(row.agent?.observationMatricule),
		},
		{
			key: "localite",
			label: "Localité",
			render: (row) => orDash(row.location?.nom),
		},
		{
			key: "provider",
			label: "Nom de l'établissement",
			render: (row) => orDash(row.provider?.nom),
		},
		{
			key: "servicePrestataire",
			label: "Service (si besoin)",
			render: (row) => orDash(row.servicePrestataire),
		},
		{ key: "naturePrestation", label: "Acte / Prestation" },
		{ key: "reference", label: "Ref PEC", render: (row) => referenceFor(row) },
		{
			key: "dateValidation",
			label: "Date Validation",
			render: (row) => formatDate(row.dateValidation),
		},
		{
			key: "statut",
			label: "Statut",
			render: (row) => (
				<Badge
					tone={
						row.statut === "VALIDEE"
							? "green"
							: row.statut === "REFUSEE"
								? "red"
								: "amber"
					}
				>
					{row.statut.replace("_", " ")}
				</Badge>
			),
		},
	];

	return (
		<>
			<ToastViewport />
			<PageHeader
				title="Gestion des Prises en charge"
				description="Recherche par IDP, création, validation et rejet des attestations."
				actions={
					<button className="btn-secondary" onClick={() => void refresh()}>
						<RefreshCw size={16} /> Actualiser
					</button>
				}
			/>

			<div className="panel mt-4 space-y-3 p-4">
				<form
					className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_auto]"
					onSubmit={(event) => void handleIdpSearch(event)}
				>
					<input
						className="field"
						value={idpDraft}
						placeholder="Saisir l'IDP du concerné"
						disabled={searching}
						onChange={(event) => {
							setIdpDraft(event.target.value);
							setSearchedBeneficiary(null);
							setSearchError(null);
						}}
					/>
					<button className="btn-primary" disabled={searching}>
						<Search size={16} /> {searching ? "Recherche…" : "Rechercher"}
					</button>
				</form>
				{searchError && <ErrorBlock message={searchError} />}
				{searchedBeneficiary && (
					<div className="flex flex-col gap-4 rounded-xl border border-slate-200 bg-white p-4 sm:flex-row sm:items-start">
						<ImageThumb
							path={
								searchedBeneficiary.carteSocialePath ??
								searchedBeneficiary.carteProfessionnellePath
							}
							name={`${searchedBeneficiary.nom} ${searchedBeneficiary.prenom}`}
							agentMatricule={
								searchedBeneficiary.codeFamille === "AGENT"
									? searchedBeneficiary.matricule
									: undefined
							}
							familyMember={
								searchedBeneficiary.codeFamille === "AGENT"
									? undefined
									: searchedBeneficiary
							}
							fit="contain"
							size={176}
						/>
						<div className="min-w-0 flex-1">
							<div className="flex flex-wrap items-start justify-between gap-3">
								<div>
									<p className="text-xs font-bold uppercase tracking-wide text-rose-700">
										Bénéficiaire ·{" "}
										{labelCodeFamille(searchedBeneficiary.codeFamille)}
									</p>
									<h2 className="mt-1 text-lg font-bold text-slate-900">
										{searchedBeneficiary.nom} {searchedBeneficiary.prenom}
									</h2>
									<p className="font-mono text-sm text-slate-500">
										IDP {searchedBeneficiary.idp}
									</p>
								</div>
							</div>
							<div className="mt-4 grid gap-5 border-t border-slate-200 pt-4 lg:grid-cols-2">
								<section aria-labelledby="beneficiary-details-title">
									<h3
										id="beneficiary-details-title"
										className="text-sm font-bold text-slate-800"
									>
										Informations du bénéficiaire
									</h3>
									<dl className="mt-3 grid gap-x-4 gap-y-3 text-sm sm:grid-cols-2">
										<div>
											<dt className="text-xs text-slate-500">Sexe</dt>
											<dd className="mt-0.5 font-medium text-slate-800">
												{searchedBeneficiary.sexe === "MASCULIN"
													? "Homme"
													: "Femme"}
											</dd>
										</div>
										<div>
											<dt className="text-xs text-slate-500">
												Date de naissance · âge
											</dt>
											<dd className="mt-0.5 font-medium text-slate-800">
												{formatDate(searchedBeneficiary.dateNaissance)} ·{" "}
												{orDash(
													calculateAge(searchedBeneficiary.dateNaissance),
												)}{" "}
												ans
											</dd>
										</div>
										<div>
											<dt className="text-xs text-slate-500">
												Matricule de rattachement
											</dt>
											<dd className="mt-0.5 font-mono font-medium text-slate-800">
												{searchedBeneficiary.matricule}
											</dd>
										</div>
										<div className="sm:col-span-2">
											<dt className="text-xs text-slate-500">
												Observation IDP
											</dt>
											<dd className="mt-0.5 font-medium text-slate-800">
												{orDash(searchedBeneficiary.observationIDP)}
											</dd>
										</div>
									</dl>
								</section>
								<section
									aria-labelledby="holder-details-title"
									className="border-t border-slate-200 pt-4 lg:border-l lg:border-t-0 lg:pl-5 lg:pt-0"
								>
									<h3
										id="holder-details-title"
										className="text-sm font-bold text-rose-700"
									>
										Agent titulaire
									</h3>
									<p className="mt-1 font-semibold text-slate-900">
										{searchedAgent
											? `${searchedAgent.nom} ${searchedAgent.prenom}`
											: "Agent non trouvé"}
									</p>
									<p className="text-xs text-slate-500">
										{searchedBeneficiary.codeFamille === "AGENT"
											? "Le bénéficiaire est l’agent titulaire."
											: "Agent de rattachement du bénéficiaire."}
									</p>
									<dl className="mt-3 grid gap-x-4 gap-y-3 text-sm sm:grid-cols-2">
										<div>
											<dt className="text-xs text-slate-500">Statut PEC</dt>
											<dd className="mt-0.5 font-medium text-slate-800">
												{orDash(searchedAgent?.statutPEC)}
											</dd>
										</div>
										<div>
											<dt className="text-xs text-slate-500">Affectation</dt>
											<dd className="mt-0.5 font-medium text-slate-800">
												{orDash(searchedAgent?.backOfficeFrontOffice)}
											</dd>
										</div>
										<div>
											<dt className="text-xs text-slate-500">Fonction</dt>
											<dd className="mt-0.5 font-medium text-slate-800">
												{orDash(searchedAgent?.fonction)}
											</dd>
										</div>
										<div>
											<dt className="text-xs text-slate-500">Catégorie</dt>
											<dd className="mt-0.5 font-medium text-slate-800">
												{orDash(searchedAgent?.categorieID)}
											</dd>
										</div>
										<div>
											<dt className="text-xs text-slate-500">
												Service · direction
											</dt>
											<dd className="mt-0.5 font-medium text-slate-800">
												{orDash(searchedService?.nom)} ·{" "}
												{orDash(searchedDirection?.nom)}
											</dd>
										</div>
										<div>
											<dt className="text-xs text-slate-500">
												Entrée en fonction
											</dt>
											<dd className="mt-0.5 font-medium text-slate-800">
												{formatDate(searchedAgent?.dateEntree)}
											</dd>
										</div>
									</dl>
								</section>
							</div>
						</div>
						<button
							className="btn-primary shrink-0"
							onClick={() => setCreateOpen(true)}
						>
							<Plus size={16} /> Démarrer la prise en charge
						</button>
					</div>
				)}
			</div>
			<div className="panel mb-4 mt-4 grid gap-3 p-4 sm:grid-cols-[minmax(0,1fr)_auto]">
				<input
					className="field"
					value={query}
					placeholder="Rechercher une référence, un IDP, un prestataire…"
					onChange={(event) => setQuery(event.target.value)}
				/>
				<p className="self-center text-xs text-slate-400">
					{visible.length} prise(s) en charge affichée(s) parmi les demandes en
					attente
				</p>
			</div>

			<div className="space-y-4">
				{loading && <LoadingBlock label="Chargement des prises en charge…" />}
				{error && <ErrorBlock message={error} onRetry={() => void refresh()} />}
				{!loading && !error && (
					<DataTable
						rows={visible}
						columns={columns}
						empty="Aucune prise en charge en attente."
						rowActions={(row) => (
							<>
								<button
									className="btn-ghost"
									title="Afficher l'aperçu"
									aria-label="Afficher l'aperçu"
									onClick={() => void handlePreview(row)}
								>
									<Eye size={15} />
								</button>
								<button
									className="btn-ghost text-emerald-700"
									title="Valider l'attestation"
									aria-label="Valider l'attestation"
									onClick={() =>
										setReviewTarget({ attestation: row, action: "approve" })
									}
								>
									<Check size={15} />
								</button>
								<button
									className="btn-ghost text-red-600"
									title="Rejeter l'attestation"
									aria-label="Rejeter l'attestation"
									onClick={() =>
										setReviewTarget({ attestation: row, action: "reject" })
									}
								>
									<X size={15} />
								</button>
							</>
						)}
					/>
				)}
			</div>

			<Modal
				open={createOpen && searchedBeneficiary !== null}
				title="Nouvelle prise en charge"
				description="Complétez les informations nécessaires à la demande."
				onClose={() => setCreateOpen(false)}
			>
				{searchedBeneficiary && (
					<AttestationForm
						key={searchedBeneficiary.idp}
						beneficiary={searchedBeneficiary}
						providers={providers}
						submitting={submitting}
						onSubmit={handleCreate}
						onCancel={() => setCreateOpen(false)}
					/>
				)}
			</Modal>
			<Modal
				open={previewAttestation !== null}
				title={`Aperçu de l'attestation ${previewAttestation ? referenceFor(previewAttestation) : ""}`}
				onClose={closePreview}
				width="max-w-7xl"
			>
				<div className="space-y-4">
					{previewLoading && <LoadingBlock label="Chargement de l'aperçu…" />}
					{previewError && <ErrorBlock message={previewError} />}
					{previewUrl && (
						<>
							<div className="flex min-h-[45vh] items-center justify-center overflow-auto rounded-xl bg-slate-300 p-3 sm:p-6">
								<img
									src={previewUrl}
									alt={`Aperçu de l'attestation ${previewAttestation ? referenceFor(previewAttestation) : ""}`}
									className="block h-auto max-h-[76vh] max-w-full rounded-sm bg-white object-contain shadow-2xl ring-1 ring-slate-400"
								/>
							</div>
							<a
								className="btn-secondary inline-flex"
								href={previewUrl}
								download={`attestation-${previewAttestation?.id ?? ""}.png`}
							>
								<Download size={16} /> Télécharger l'aperçu PNG
							</a>
						</>
					)}
				</div>
			</Modal>
			<Modal
				open={reviewTarget !== null}
				title={
					reviewTarget?.action === "approve"
						? "Valider l'attestation"
						: "Rejeter l'attestation"
				}
				description={
					reviewTarget
						? `${referenceFor(reviewTarget.attestation)} · ${reviewTarget.attestation.idpBeneficiaire}`
						: undefined
				}
				onClose={() => {
					if (!reviewing) setReviewTarget(null);
				}}
				width="max-w-md"
			>
				<p className="text-sm leading-6 text-slate-700">
					{reviewTarget?.action === "approve"
						? "Confirmer la validation de cette attestation ?"
						: "Confirmer le rejet ? Le fichier PDF associé sera supprimé."}
				</p>
				<div className="mt-6 flex justify-end gap-2">
					<button
						className="btn-secondary"
						onClick={() => setReviewTarget(null)}
						disabled={reviewing}
					>
						Annuler
					</button>
					<button
						className={
							reviewTarget?.action === "approve"
								? "btn-primary"
								: "inline-flex items-center justify-center rounded-xl bg-red-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-50"
						}
						onClick={() => void handleReview()}
						disabled={reviewing}
					>
						{reviewing
							? "Traitement…"
							: reviewTarget?.action === "approve"
								? "Confirmer la validation"
								: "Confirmer le rejet"}
					</button>
				</div>
			</Modal>
		</>
	);
}
