import { useEffect, useMemo, useState, type FormEvent } from "react";
import { FileField, SelectField, TextField } from "../form";
import { ErrorBlock } from "../Feedback";
import type { Referentials } from "../../hooks/useReferentials";
import {
	AFFECTATIONS,
	SEXES,
	STATUTS_PEC,
	type AgentItem,
	type BackOfficeFrontOffice,
	type CreateAgentInput,
	type Sexe,
	type StatutPEC,
	type UpdateAgentInput,
} from "../../types/api";
import {
	labelAffectation,
	labelSexe,
	labelStatutPEC,
	toDateInputValue,
	toOptions,
} from "../../utils/format";
import { validateImageFile } from "../../utils/image";

interface AgentFormState {
	matricule: string;
	nom: string;
	prenom: string;
	statutPEC: StatutPEC;
	dateNaissance: string;
	sexe: Sexe;
	backOfficeFrontOffice: BackOfficeFrontOffice;
	dateEntree: string;
	observationMatricule: string;
	fonction: string;
	categorieID: string;
	codeAgence: string;
	codeDirection: string;
	codeService: string;
}

function blankState(): AgentFormState {
	return {
		matricule: "",
		nom: "",
		prenom: "",
		statutPEC: "AGENT",
		dateNaissance: "",
		sexe: "MASCULIN",
		backOfficeFrontOffice: "AGENCE",
		dateEntree: "",
		observationMatricule: "",
		fonction: "",
		categorieID: "",
		codeAgence: "",
		codeDirection: "",
		codeService: "",
	};
}

function fromAgent(agent: AgentItem): AgentFormState {
	return {
		matricule: agent.matricule,
		nom: agent.nom,
		prenom: agent.prenom,
		statutPEC: agent.statutPEC,
		dateNaissance: toDateInputValue(agent.dateNaissance),
		sexe: agent.sexe,
		backOfficeFrontOffice: agent.backOfficeFrontOffice,
		dateEntree: toDateInputValue(agent.dateEntree),
		observationMatricule: agent.observationMatricule ?? "",
		fonction: agent.fonction ?? "",
		categorieID: agent.categorieID ?? "",
		// The listing never returns the structure codes, so these stay empty and
		// mean "leave unchanged" on update.
		codeAgence: "",
		codeDirection: "",
		codeService: "",
	};
}

/** Pass an empty string for an enum select that must always hold a value. */
const EMPTY_OPTION = "";

/** Compares form values and API values on the same footing. */
function normalise(value: unknown): string {
	if (value === null || value === undefined) return "";
	return String(value).trim();
}

export interface AgentFormProps {
	mode: "create" | "edit";
	agent?: AgentItem | null;
	referentials: Referentials;
	suggestedMatricule?: string | null;
	matriculeSuggestionLoading?: boolean;
	submitting: boolean;
	onCreate: (input: CreateAgentInput, image: File) => Promise<void>;
	onUpdate: (matricule: string, input: UpdateAgentInput) => Promise<void>;
	onCancel: () => void;
}

/**
 * Agent create / update form.
 *
 * It enforces the backend `chk_agent_affectation` rule before submitting:
 * an active agent must have a structure **and** a function, a retired one must
 * have neither. Failing that rule server-side would return an opaque 500.
 */
export function AgentForm({
	mode,
	agent,
	referentials,
	suggestedMatricule,
	matriculeSuggestionLoading = false,
	submitting,
	onCreate,
	onUpdate,
	onCancel,
}: AgentFormProps) {
	const isEdit = mode === "edit";
	const [state, setState] = useState<AgentFormState>(() =>
		agent ? fromAgent(agent) : blankState(),
	);
	const [image, setImage] = useState<File | null>(null);
	const [errors, setErrors] = useState<string[]>([]);

	const update = <K extends keyof AgentFormState>(
		key: K,
		value: AgentFormState[K],
	) => setState((current) => ({ ...current, [key]: value }));

	useEffect(() => {
		if (isEdit || !suggestedMatricule) return;
		setState((current) =>
			current.matricule.trim()
				? current
				: { ...current, matricule: suggestedMatricule },
		);
	}, [isEdit, suggestedMatricule]);

	const isRetired = state.backOfficeFrontOffice === "RETRAITE";
	// Precedence of the backend: `codeAgence` wins over `codeDirection`.
	const usesAgence = state.codeAgence !== "";

	const categorieOptions = referentials.agentCategories.map((categorie) => ({
		value: categorie.codeCategory,
		label: categorie.codeCategory,
	}));
	const agenceOptions = referentials.agences.map((agence) => ({
		value: agence.codeAgence,
		label: `${agence.nomAgence} (${agence.codeAgence})`,
	}));
	const directionOptions = referentials.directions.map((direction) => ({
		value: direction.codeDirection,
		label: direction.nom,
	}));
	const serviceOptions = useMemo(
		() =>
			referentials.services
				.filter(
					(service) =>
						!state.codeDirection ||
						service.codeDirection === state.codeDirection,
				)
				.map((service) => ({
					value: service.codeService,
					label: `${service.nom} (${service.codeService})`,
				})),
		[referentials.services, state.codeDirection],
	);

	// A retired agent must not carry a structure or a function; switching to
	// RETRAITE is impossible through PATCH because nulls are ignored
	// (API.md §13.5), so the option is disabled while editing.
	const retireDisabled = isEdit && agent?.backOfficeFrontOffice !== "RETRAITE";

	/**
	 * True when the update turns a retired agent into an active one. Only then
	 * must the structure and the function be supplied: a PATCH leaves both
	 * untouched otherwise, and the listing never returns the structure codes
	 * (API.md §13.1), so demanding them would block every edit of an active
	 * agent.
	 */
	const requiresAffectation =
		!isRetired && (!isEdit || agent?.backOfficeFrontOffice === "RETRAITE");

	function validate(): string[] {
		const found: string[] = [];

		if (!isEdit) {
			if (!state.matricule.trim()) found.push("Le matricule est obligatoire.");
			else if (
				!/^[0-9]+$/.test(state.matricule.trim()) ||
				!Number.isSafeInteger(Number(state.matricule)) ||
				Number(state.matricule) < 1
			) {
				found.push("Le matricule doit être un entier positif.");
			}
			if (!image)
				found.push("La carte professionnelle (image) est obligatoire.");
			else {
				const fileError = validateImageFile(image);
				if (fileError) found.push(fileError);
			}
		}
		if (!state.nom.trim()) found.push("Le nom est obligatoire.");
		else if (state.nom.trim().length > 25)
			found.push("Le nom ne peut pas dépasser 25 caractères.");
		if (!state.prenom.trim()) found.push("Le prénom est obligatoire.");
		else if (state.prenom.trim().length > 100)
			found.push("Le prénom ne peut pas dépasser 100 caractères.");
		if (!state.dateNaissance)
			found.push("La date de naissance est obligatoire.");
		if (!state.dateEntree) found.push("La date d'entrée est obligatoire.");

		if (requiresAffectation) {
			if (!state.fonction.trim())
				found.push(
					"Une fonction est obligatoire pour un agent actif (contrainte chk_agent_affectation).",
				);
			if (!state.codeAgence && !state.codeDirection) {
				found.push(
					"Une agence ou une direction est obligatoire pour un agent actif.",
				);
			}
		}
		if (
			state.dateNaissance &&
			state.dateEntree &&
			state.dateEntree < state.dateNaissance
		) {
			found.push("La date d'entrée ne peut pas précéder la date de naissance.");
		}
		return found;
	}

	async function handleSubmit(event: FormEvent) {
		event.preventDefault();
		const found = validate();
		setErrors(found);
		if (found.length > 0) return;

		const common = {
			nom: state.nom.trim(),
			prenom: state.prenom.trim(),
			statutPEC: state.statutPEC,
			dateNaissance: state.dateNaissance,
			sexe: state.sexe,
			backOfficeFrontOffice: state.backOfficeFrontOffice,
			dateEntree: state.dateEntree,
			observationMatricule: state.observationMatricule.trim() || null,
			fonction: isRetired ? null : state.fonction.trim() || null,
			categorieID: state.categorieID || null,
			codeAgence: isRetired ? null : state.codeAgence || null,
			codeDirection: isRetired ? null : state.codeDirection || null,
			codeService: isRetired ? null : state.codeService || null,
		};

		if (isEdit && agent) {
			// PATCH ignores null/missing values: only send what actually changed,
			// and never try to clear a field.
			const initial = fromAgent(agent);
			const payload: Record<string, unknown> = {};
			const comparable = [
				"nom",
				"prenom",
				"statutPEC",
				"dateNaissance",
				"sexe",
				"backOfficeFrontOffice",
				"dateEntree",
				"observationMatricule",
				"fonction",
				"categorieID",
			] as const;

			for (const key of comparable) {
				const next = normalise(common[key]);
				if (!next) continue;
				if (next === normalise(initial[key])) continue;
				payload[key] = common[key];
			}
			if (!isRetired) {
				if (state.codeAgence) payload.codeAgence = state.codeAgence;
				if (state.codeDirection) payload.codeDirection = state.codeDirection;
				if (state.codeService) payload.codeService = state.codeService;
			}
			if (Object.keys(payload).length === 0) {
				setErrors(["Aucune modification à enregistrer."]);
				return;
			}
			await onUpdate(agent.matricule, payload as UpdateAgentInput);
			return;
		}

		await onCreate(
			{
				...common,
				matricule: state.matricule.trim(),
			} as CreateAgentInput,
			image as File,
		);
	}

	return (
		<form onSubmit={handleSubmit} className="space-y-5" aria-busy={submitting}>
			{errors.length > 0 && (
				<ErrorBlock message="Corrigez les points suivants :">
					<ul className="mt-1 list-inside list-disc text-sm text-red-800">
						{errors.map((message) => (
							<li key={message}>{message}</li>
						))}
					</ul>
				</ErrorBlock>
			)}

			<div className="grid gap-4 md:grid-cols-2">
				<TextField
					label="Matricule"
					value={state.matricule}
					onChange={(value) => update("matricule", value)}
					required={!isEdit}
					disabled={isEdit}
					type={isEdit ? "text" : "number"}
					min={isEdit ? undefined : "1"}
					hint={
						isEdit
							? "Le matricule n'est pas modifiable."
							: matriculeSuggestionLoading
								? "Calcul de la prochaine suggestion…"
								: suggestedMatricule
									? "Proposition basée sur le matricule numérique le plus élevé; modifiable."
									: "Saisissez un matricule numérique unique."
					}
				/>
				<TextField
					label="Nom"
					value={state.nom}
					onChange={(value) => update("nom", value)}
					required
					maxLength={25}
				/>
				<TextField
					label="Prénom"
					value={state.prenom}
					onChange={(value) => update("prenom", value)}
					required
					maxLength={100}
				/>
				<SelectField
					label="Sexe"
					value={state.sexe}
					onChange={(value) => update("sexe", value as Sexe)}
					options={toOptions(SEXES, labelSexe)}
					placeholder={EMPTY_OPTION}
					required
				/>
				<SelectField
					label="Statut PEC"
					value={state.statutPEC}
					onChange={(value) => update("statutPEC", value as StatutPEC)}
					options={toOptions(STATUTS_PEC, labelStatutPEC)}
					placeholder={EMPTY_OPTION}
					required
				/>
				<SelectField
					label="Affectation"
					value={state.backOfficeFrontOffice}
					onChange={(value) =>
						update("backOfficeFrontOffice", value as BackOfficeFrontOffice)
					}
					options={toOptions(AFFECTATIONS, labelAffectation).filter(
						(option) => !(retireDisabled && option.value === "RETRAITE"),
					)}
					placeholder={EMPTY_OPTION}
					required
					hint={
						retireDisabled
							? "Le passage à RETRAITE n'est pas possible via PATCH : les champs structure/fonction ne peuvent pas être effacés (API.md §13.5)."
							: undefined
					}
				/>
				<TextField
					label="Date de naissance"
					type="date"
					value={state.dateNaissance}
					onChange={(value) => update("dateNaissance", value)}
					required
				/>
				<TextField
					label="Date d'entrée"
					type="date"
					value={state.dateEntree}
					onChange={(value) => update("dateEntree", value)}
					required
				/>
				<TextField
					label="Fonction"
					value={state.fonction}
					onChange={(value) => update("fonction", value)}
					required={!isRetired}
					disabled={isRetired}
					maxLength={100}
					hint={
						isRetired
							? "Sans objet pour un agent retraité."
							: "Obligatoire pour un agent actif."
					}
				/>
				<SelectField
					label="Catégorie agent"
					value={state.categorieID}
					onChange={(value) => update("categorieID", value)}
					options={categorieOptions}
					hint="La valeur transmise est le code de catégorie."
				/>
				<SelectField
					label="Agence"
					value={state.codeAgence}
					onChange={(value) =>
						setState((current) => ({
							...current,
							codeAgence: value,
							// The agency becomes the structure: the direction branch
							// no longer applies.
							codeDirection: value ? "" : current.codeDirection,
							codeService: value ? "" : current.codeService,
						}))
					}
					options={agenceOptions}
					disabled={isRetired}
					placeholder="-- Aucune (affectation en direction) --"
					hint="Si une agence est choisie, elle devient la structure de l'agent."
				/>
				<SelectField
					label="Direction"
					value={state.codeDirection}
					onChange={(value) =>
						setState((current) => ({
							...current,
							codeDirection: value,
							codeService: "",
						}))
					}
					options={directionOptions}
					disabled={isRetired || usesAgence}
					placeholder="-- Sélectionner une direction --"
				/>
				<SelectField
					label="Service"
					value={state.codeService}
					onChange={(value) => update("codeService", value)}
					options={serviceOptions}
					disabled={isRetired || usesAgence || !state.codeDirection}
					placeholder="-- Aucun --"
					hint="Les services sont filtrés par direction."
				/>
				{!isEdit && (
					<FileField
						label="Carte professionnelle"
						file={image}
						onFile={setImage}
						required
						className="md:col-span-2"
					/>
				)}
				<TextField
					label="Observation matricule"
					value={state.observationMatricule}
					onChange={(value) => update("observationMatricule", value)}
					className="md:col-span-2"
				/>
			</div>

			{isRetired && (
				<p className="text-xs text-slate-500">
					Agent retraité : la structure, le service et la fonction sont
					volontairement exclus de la requête.
				</p>
			)}
			{isEdit && !isRetired && !state.codeAgence && !state.codeDirection && (
				<p className="text-xs text-slate-500">
					La structure actuelle n'est pas renvoyée par l'API (API.md §13.1).
					Laissez l'agence et la direction vides pour la conserver, ou
					choisissez-en une pour l'ajuster.
				</p>
			)}

			<div className="flex justify-end gap-2">
				<button
					type="button"
					className="btn-secondary"
					onClick={onCancel}
					disabled={submitting}
				>
					Annuler
				</button>
				<button className="btn-primary" disabled={submitting}>
					{submitting
						? "Enregistrement…"
						: isEdit
							? "Enregistrer les modifications"
							: "Créer l'agent"}
				</button>
			</div>
		</form>
	);
}
