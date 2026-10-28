import { useState, type FormEvent } from "react";
import { SelectField, TextField } from "../../../components/ui/form";
import { ErrorBlock } from "../../../components/ui/Feedback";
import type { Beneficiary, Provider } from "../../../types/api";
import type { AttestationFormValues } from "../../../types/attestation";
import { today } from "../../../utils/format";

export function AttestationForm({
	beneficiary,
	providers,
	submitting,
	onSubmit,
	onCancel,
}: {
	beneficiary: Beneficiary;
	providers: Provider[];
	submitting: boolean;
	onSubmit: (values: AttestationFormValues) => Promise<void>;
	onCancel: () => void;
}) {
	const [providerID, setProviderID] = useState("");
	const [datePEC, setDatePEC] = useState(today());
	const [naturePrestation, setNaturePrestation] = useState("");
	const [servicePrestataire, setServicePrestataire] = useState("");
	const [errors, setErrors] = useState<string[]>([]);

	async function handleSubmit(event: FormEvent) {
		event.preventDefault();
		const found: string[] = [];
		const parsedProviderID = Number(providerID);
		const nature = naturePrestation.trim();
		const service = servicePrestataire.trim();

		if (!beneficiary.idp.trim())
			found.push("L'IDP du bénéficiaire est obligatoire.");
		if (!Number.isInteger(parsedProviderID) || parsedProviderID < 1) {
			found.push("Sélectionnez un prestataire valide.");
		}
		if (!datePEC) found.push("La date de PEC est obligatoire.");
		if (!nature) found.push("La nature de la prestation est obligatoire.");
		else if (nature.length > 255) {
			found.push(
				"La nature de la prestation ne peut pas dépasser 255 caractères.",
			);
		}
		if (service.length > 255) {
			found.push(
				"Le service du prestataire ne peut pas dépasser 255 caractères.",
			);
		}

		setErrors(found);
		if (found.length > 0) return;

		await onSubmit({
			idpBeneficiaire: beneficiary.idp,
			providerID: parsedProviderID,
			naturePrestation: nature,
			datePEC,
			...(service ? { servicePrestataire: service } : {}),
		});
	}

	return (
		<form onSubmit={(event) => void handleSubmit(event)} className="space-y-4">
			{errors.length > 0 && (
				<ErrorBlock message="Corrigez les points suivants :">
					<ul className="mt-1 list-inside list-disc text-sm text-red-800">
						{errors.map((message) => (
							<li key={message}>{message}</li>
						))}
					</ul>
				</ErrorBlock>
			)}

			<p className="text-sm text-slate-600">
				Bénéficiaire :{" "}
				<strong>
					{beneficiary.nom} {beneficiary.prenom}
				</strong>
				{" — "}
				<span className="font-mono">{beneficiary.idp}</span>
			</p>

			<div className="grid gap-4 md:grid-cols-2">
				<SelectField
					label="Prestataire"
					value={providerID}
					onChange={setProviderID}
					options={providers.map((provider) => ({
						value: String(provider.id),
						label: `${provider.nom} (${provider.adresse})`,
					}))}
					required
					placeholder="-- Sélectionner un prestataire --"
				/>
				<TextField
					label="Date de prise en charge"
					type="date"
					value={datePEC}
					onChange={setDatePEC}
					required
				/>
				<TextField
					label="Nature de la prestation"
					value={naturePrestation}
					onChange={setNaturePrestation}
					required
					maxLength={255}
				/>
				<TextField
					label="Service du prestataire (facultatif)"
					value={servicePrestataire}
					onChange={setServicePrestataire}
					maxLength={255}
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
				<button
					className="btn-primary"
					disabled={submitting || providers.length === 0}
				>
					{submitting ? "Envoi…" : "Créer la prise en charge"}
				</button>
			</div>
		</form>
	);
}
