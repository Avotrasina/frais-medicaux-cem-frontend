import { useState, type FormEvent } from "react";
import { FileField, SelectField, TextAreaField, TextField } from "../form";
import { ErrorBlock } from "../Feedback";
import type { Referentials } from "../../hooks/useReferentials";
import {
	PROVIDER_STATUSES,
	type CreateProviderInput,
	type Provider,
	type ProviderStatus,
} from "../../types/api";
import {
	labelProviderStatus,
	toDateInputValue,
	toOptions,
} from "../../utils/format";

const EMPTY_OPTION = "";

interface ProviderFormState {
	nom: string;
	adresse: string;
	statut: ProviderStatus;
	nif: string;
	stat: string;
	dateDebutConvention: string;
	dateFinConvention: string;
	listePrestation: string;
	lieuID: string;
	categorieID: string;
	convention: File | null;
}

function blankState(): ProviderFormState {
	return {
		nom: "",
		adresse: "",
		statut: "PRIVE",
		nif: "",
		stat: "",
		dateDebutConvention: "",
		dateFinConvention: "",
		listePrestation: "",
		lieuID: "",
		categorieID: "",
		convention: null,
	};
}

function fromProvider(provider: Provider): ProviderFormState {
	return {
		nom: provider.nom,
		adresse: provider.adresse,
		statut: provider.statut,
		nif: provider.nif,
		stat: provider.stat,
		dateDebutConvention: toDateInputValue(provider.dateDebutConvention),
		dateFinConvention: toDateInputValue(provider.dateFinConvention),
		listePrestation: provider.listePrestation,
		lieuID: String(provider.lieuID),
		categorieID: String(provider.categorieID),
		convention: null,
	};
}

/**
 * Provider create / update form.
 *
 * `nif` and `stat` are unique in the database, and `dateFinConvention` must be
 * after `dateDebutConvention` (`chk_prestataire_convention`): both rules are
 * checked here so the user gets a clear message instead of a 409/500.
 */
export function ProviderForm({
	mode,
	provider,
	referentials,
	submitting,
	onCreate,
	onUpdate,
	onCancel,
}: {
	mode: "create" | "edit";
	provider?: Provider | null;
	referentials: Referentials;
	submitting: boolean;
	onCreate: (input: CreateProviderInput, convention: File) => Promise<void>;
	onUpdate: (
		id: number,
		input: Partial<CreateProviderInput>,
		convention?: File,
	) => Promise<void>;
	onCancel: () => void;
}) {
	const isEdit = mode === "edit";
	const [state, setState] = useState<ProviderFormState>(() =>
		provider ? fromProvider(provider) : blankState(),
	);
	const [errors, setErrors] = useState<string[]>([]);

	const update = <K extends keyof ProviderFormState>(
		key: K,
		value: ProviderFormState[K],
	) => setState((current) => ({ ...current, [key]: value }));

	const lieuOptions = referentials.lieux.map((lieu) => ({
		value: String(lieu.id),
		label: lieu.nom,
	}));
	const categorieOptions = referentials.providerCategories.map((categorie) => ({
		value: String(categorie.id),
		label: categorie.nom,
	}));

	function validate(): string[] {
		const found: string[] = [];
		if (!state.nom.trim()) found.push("Le nom est obligatoire.");
		if (!state.adresse.trim()) found.push("L'adresse est obligatoire.");
		if (!state.nif.trim()) found.push("Le NIF est obligatoire.");
		if (!state.stat.trim()) found.push("Le STAT est obligatoire.");
		if (!state.listePrestation.trim())
			found.push("La liste des prestations est obligatoire.");
		if (!state.dateDebutConvention)
			found.push("La date de début de convention est obligatoire.");
		if (!state.dateFinConvention)
			found.push("La date de fin de convention est obligatoire.");
		if (
			state.dateDebutConvention &&
			state.dateFinConvention &&
			state.dateFinConvention <= state.dateDebutConvention
		) {
			found.push(
				"La date de fin de convention doit être postérieure à la date de début (chk_prestataire_convention).",
			);
		}
		if (!state.lieuID) found.push("Le lieu est obligatoire.");
		if (!state.categorieID) found.push("La catégorie est obligatoire.");
		if (!isEdit && !state.convention)
			found.push("Le PDF de la convention est obligatoire.");
		return found;
	}

	async function handleSubmit(event: FormEvent) {
		event.preventDefault();
		const found = validate();
		setErrors(found);
		if (found.length > 0) return;

		const payload: CreateProviderInput = {
			nom: state.nom.trim(),
			adresse: state.adresse.trim(),
			statut: state.statut,
			nif: state.nif.trim(),
			stat: state.stat.trim(),
			dateDebutConvention: state.dateDebutConvention,
			dateFinConvention: state.dateFinConvention,
			listePrestation: state.listePrestation.trim(),
			lieuID: Number(state.lieuID),
			categorieID: Number(state.categorieID),
		};

		if (isEdit && provider) {
			const initial = fromProvider(provider);
			const changed: Partial<CreateProviderInput> = {};
			(Object.keys(payload) as (keyof CreateProviderInput)[]).forEach((key) => {
				const next = String(payload[key]);
				const previous = String(initial[key as keyof ProviderFormState]);
				if (next !== previous) {
					Object.assign(changed, { [key]: payload[key] });
				}
			});
			if (Object.keys(changed).length === 0 && !state.convention) {
				setErrors(["Aucune modification à enregistrer."]);
				return;
			}
			await onUpdate(provider.id, changed, state.convention ?? undefined);
			return;
		}

		await onCreate(payload, state.convention as File);
	}

	return (
		<form onSubmit={handleSubmit} className="space-y-5">
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
					label="Nom du prestataire"
					value={state.nom}
					onChange={(value) => update("nom", value)}
					required
					className="md:col-span-2"
				/>
				<TextField
					label="Adresse"
					value={state.adresse}
					onChange={(value) => update("adresse", value)}
					required
					className="md:col-span-2"
				/>
				<SelectField
					label="Statut"
					value={state.statut}
					onChange={(value) => update("statut", value as ProviderStatus)}
					options={toOptions(PROVIDER_STATUSES, labelProviderStatus)}
					placeholder={EMPTY_OPTION}
					required
				/>
				<TextField
					label="NIF"
					value={state.nif}
					onChange={(value) => update("nif", value)}
					required
					hint="Doit être unique."
				/>
				<TextField
					label="STAT"
					value={state.stat}
					onChange={(value) => update("stat", value)}
					required
					hint="Doit être unique."
				/>
				<SelectField
					label="Lieu"
					value={state.lieuID}
					onChange={(value) => update("lieuID", value)}
					options={lieuOptions}
					required
					hint={
						lieuOptions.length === 0
							? "Aucun lieu enregistré : créez-en un depuis la page Référentiels."
							: undefined
					}
				/>
				<SelectField
					label="Catégorie"
					value={state.categorieID}
					onChange={(value) => update("categorieID", value)}
					options={categorieOptions}
					required
					hint={
						categorieOptions.length === 0
							? "Aucune catégorie enregistrée : créez-en une depuis la page Référentiels."
							: undefined
					}
				/>
				<TextField
					label="Début de convention"
					type="date"
					value={state.dateDebutConvention}
					onChange={(value) => update("dateDebutConvention", value)}
					required
				/>
				<TextField
					label="Fin de convention"
					type="date"
					value={state.dateFinConvention}
					onChange={(value) => update("dateFinConvention", value)}
					required
					min={state.dateDebutConvention || undefined}
				/>
				<TextAreaField
					label="Prestations couvertes"
					value={state.listePrestation}
					onChange={(value) => update("listePrestation", value)}
					required
					className="md:col-span-2"
				/>
				<FileField
					label="Convention (PDF)"
					file={state.convention}
					onFile={(file) => update("convention", file)}
					required={!isEdit}
					accept="application/pdf"
					className="md:col-span-2"
					hint={
						isEdit
							? "Sélectionnez un PDF uniquement pour remplacer la convention actuelle."
							: "Un fichier PDF est requis."
					}
				/>
			</div>

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
							: "Créer le prestataire"}
				</button>
			</div>
		</form>
	);
}
