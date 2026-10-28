import { useState, type FormEvent } from "react";
import { FileField, SelectField, TextAreaField, TextField } from "../../../components/ui/form";
import { ErrorBlock } from "../../../components/ui/Feedback";
import {
	SEXES,
	type AgentItem,
	type Beneficiary,
	type CreateFamilyMemberInput,
	type FamilyKind,
	type Sexe,
	type UpdateFamilyMemberInput,
} from "../../../types/api";
import {
	labelSexe,
	labelCodeFamille,
	toDateInputValue,
	toOptions,
} from "../../../utils/format";
import { validateImageFile } from "../../../utils/image";

const EMPTY_OPTION = "";

/**
 * Beneficiaries are never created directly: the API creates the person and its
 * beneficiary row together. A brand-new beneficiary therefore goes through the
 * spouse or child route of `/agent-families`.
 */
export function FamilyMemberCreateForm({
	agents,
	submitting,
	onSubmit,
	onCancel,
}: {
	agents: AgentItem[];
	submitting: boolean;
	onSubmit: (
		kind: FamilyKind,
		input: CreateFamilyMemberInput,
		image: File,
	) => Promise<void>;
	onCancel: () => void;
}) {
	const [kind, setKind] = useState<FamilyKind>("conjoint");
	const [agentMatricule, setAgentMatricule] = useState("");
	const [nom, setNom] = useState("");
	const [prenom, setPrenom] = useState("");
	const [dateNaissance, setDateNaissance] = useState("");
	const [sexe, setSexe] = useState<Sexe>("FEMININ");
	const [image, setImage] = useState<File | null>(null);
	const [errors, setErrors] = useState<string[]>([]);

	async function handleSubmit(event: FormEvent) {
		event.preventDefault();
		const found: string[] = [];
		if (!agentMatricule)
			found.push("Sélectionnez l'agent auquel rattacher le bénéficiaire.");
		if (!nom.trim()) found.push("Le nom est obligatoire.");
		if (!prenom.trim()) found.push("Le prénom est obligatoire.");
		if (!dateNaissance) found.push("La date de naissance est obligatoire.");
		if (!image) found.push("La carte sociale (image) est obligatoire.");
		else {
			const fileError = validateImageFile(image);
			if (fileError) found.push(fileError);
		}
		setErrors(found);
		if (found.length > 0) return;

		await onSubmit(
			kind,
			{
				agentMatricule,
				nom: nom.trim(),
				prenom: prenom.trim(),
				dateNaissance,
				sexe,
			},
			image as File,
		);
	}

	return (
		<form onSubmit={handleSubmit} className="space-y-4">
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
				<SelectField
					label="Lien de parenté"
					value={kind}
					onChange={(value) => setKind(value as FamilyKind)}
					options={[
						{ value: "conjoint", label: "Conjoint(e)" },
						{ value: "enfant", label: "Enfant" },
					]}
					placeholder={EMPTY_OPTION}
					required
				/>
				<SelectField
					label="Agent de rattachement"
					value={agentMatricule}
					onChange={setAgentMatricule}
					options={agents.map((agent) => ({
						value: agent.matricule,
						label: `${agent.matricule} — ${agent.nom} ${agent.prenom}`,
					}))}
					required
				/>
				<TextField label="Nom" value={nom} onChange={setNom} required />
				<TextField
					label="Prénom"
					value={prenom}
					onChange={setPrenom}
					required
				/>
				<TextField
					label="Date de naissance"
					type="date"
					value={dateNaissance}
					onChange={setDateNaissance}
					required
				/>
				<SelectField
					label="Sexe"
					value={sexe}
					onChange={(value) => setSexe(value as Sexe)}
					options={toOptions(SEXES, labelSexe)}
					placeholder={EMPTY_OPTION}
					required
				/>
				<FileField
					label="Carte sociale"
					file={image}
					onFile={setImage}
					required
					className="md:col-span-2"
				/>
			</div>

			<p className="text-xs text-slate-500">
				L'IDP du bénéficiaire est généré automatiquement par le serveur (format{" "}
				<span className="font-mono">003CJT001</span>).
			</p>

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
					{submitting ? "Enregistrement…" : "Créer le bénéficiaire"}
				</button>
			</div>
		</form>
	);
}

/**
 * Civil-information update.
 *
 * The route depends on the family code: the agent is updated through
 * `/agents/:matricule`, a spouse or a child through
 * `/agent-families/<kind>/:id` (the `:id` being the person id).
 */
export function BeneficiaryEditForm({
	beneficiary,
	submitting,
	isAgent,
	onSubmit,
	onCancel,
}: {
	beneficiary: Beneficiary;
	submitting: boolean;
	/** True when `codeFamille = AGENT`: the agent route is used. */
	isAgent: boolean;
	onSubmit: (input: UpdateFamilyMemberInput) => Promise<void>;
	onCancel: () => void;
}) {
	const [nom, setNom] = useState(beneficiary.nom);
	const [prenom, setPrenom] = useState(beneficiary.prenom);
	const [dateNaissance, setDateNaissance] = useState(
		toDateInputValue(beneficiary.dateNaissance),
	);
	const [sexe, setSexe] = useState<Sexe>(beneficiary.sexe);
	const [errors, setErrors] = useState<string[]>([]);

	async function handleSubmit(event: FormEvent) {
		event.preventDefault();
		const found: string[] = [];
		if (!nom.trim()) found.push("Le nom est obligatoire.");
		if (!prenom.trim()) found.push("Le prénom est obligatoire.");
		if (!dateNaissance) found.push("La date de naissance est obligatoire.");
		setErrors(found);
		if (found.length > 0) return;

		const payload: UpdateFamilyMemberInput = {};
		if (nom.trim() !== beneficiary.nom) payload.nom = nom.trim();
		if (prenom.trim() !== beneficiary.prenom) payload.prenom = prenom.trim();
		if (dateNaissance !== toDateInputValue(beneficiary.dateNaissance)) {
			payload.dateNaissance = dateNaissance;
		}
		if (sexe !== beneficiary.sexe) payload.sexe = sexe;

		if (Object.keys(payload).length === 0) {
			setErrors(["Aucune modification à enregistrer."]);
			return;
		}
		await onSubmit(payload);
	}

	return (
		<form onSubmit={handleSubmit} className="space-y-4">
			{errors.length > 0 && (
				<ErrorBlock message="Corrigez les points suivants :">
					<ul className="mt-1 list-inside list-disc text-sm text-red-800">
						{errors.map((message) => (
							<li key={message}>{message}</li>
						))}
					</ul>
				</ErrorBlock>
			)}

			<dl className="grid gap-2 rounded-xl bg-slate-50 p-4 text-sm sm:grid-cols-2">
				<div>
					<dt className="text-xs font-bold uppercase tracking-wide text-slate-400">
						IDP
					</dt>
					<dd className="font-mono text-slate-800">{beneficiary.idp}</dd>
				</div>
				<div>
					<dt className="text-xs font-bold uppercase tracking-wide text-slate-400">
						Qualité
					</dt>
					<dd className="text-slate-800">
						{labelCodeFamille(beneficiary.codeFamille)}
					</dd>
				</div>
				<div>
					<dt className="text-xs font-bold uppercase tracking-wide text-slate-400">
						Matricule agent
					</dt>
					<dd className="font-mono text-slate-800">{beneficiary.matricule}</dd>
				</div>
				<div>
					<dt className="text-xs font-bold uppercase tracking-wide text-slate-400">
						Route utilisée
					</dt>
					<dd className="font-mono text-xs text-slate-600">
						{isAgent
							? `/agents/${beneficiary.matricule}`
							: `/agent-families/${beneficiary.codeFamille === "CONJOINT" ? "spouses" : "children"}/:id`}
					</dd>
				</div>
			</dl>

			<div className="grid gap-4 md:grid-cols-2">
				<TextField label="Nom" value={nom} onChange={setNom} required />
				<TextField
					label="Prénom"
					value={prenom}
					onChange={setPrenom}
					required
				/>
				<TextField
					label="Date de naissance"
					type="date"
					value={dateNaissance}
					onChange={setDateNaissance}
					required
				/>
				<SelectField
					label="Sexe"
					value={sexe}
					onChange={(value) => setSexe(value as Sexe)}
					options={toOptions(SEXES, labelSexe)}
					placeholder={EMPTY_OPTION}
					required
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
					{submitting ? "Enregistrement…" : "Enregistrer"}
				</button>
			</div>
		</form>
	);
}

/** Updates `observationIDP`; an empty value clears it. */
export function BeneficiaryObservationForm({
	beneficiary,
	submitting,
	onSubmit,
	onCancel,
}: {
	beneficiary: Beneficiary;
	submitting: boolean;
	onSubmit: (observation: string | null) => Promise<void>;
	onCancel: () => void;
}) {
	const [observation, setObservation] = useState(
		beneficiary.observationIDP ?? "",
	);

	return (
		<form
			className="space-y-4"
			onSubmit={(event: FormEvent) => {
				event.preventDefault();
				const trimmed = observation.trim();
				void onSubmit(trimmed === "" ? null : trimmed);
			}}
		>
			<TextAreaField
				label={`Observation — ${beneficiary.idp}`}
				value={observation}
				onChange={setObservation}
				rows={4}
				hint="Laisser vide puis enregistrer efface l'observation."
			/>
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
					{submitting ? "Enregistrement…" : "Enregistrer"}
				</button>
			</div>
		</form>
	);
}
