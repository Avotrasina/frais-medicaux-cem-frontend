/**
 * Date helpers.
 *
 * The API accepts `2024-05-17` or a full ISO string and always answers with a
 * full ISO string. HTML date inputs only understand `YYYY-MM-DD`, so every
 * value read from the API goes through `toDateInputValue` before being shown,
 * and every value typed in a form is sent back as a plain calendar date.
 */

/** ISO string (or anything date-like) to the `YYYY-MM-DD` expected by `<input type="date">`. */
export function toDateInputValue(value?: string | null): string {
	if (!value) return "";
	const trimmed = value.trim();
	if (!trimmed) return "";
	if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) return trimmed;
	const parsed = new Date(trimmed);
	if (Number.isNaN(parsed.getTime())) return "";
	return parsed.toISOString().slice(0, 10);
}

/** Display format used in tables: `17/05/1990`. */
export function formatDate(value?: string | null): string {
	const iso = toDateInputValue(value);
	if (!iso) return "—";
	const [year, month, day] = iso.split("-");
	return `${day}/${month}/${year}`;
}

/** Calculates completed years from a calendar date without timezone drift. */
export function calculateAge(
	value?: string | null,
	referenceDate = new Date(),
): number | null {
	if (!value) return null;
	const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(value.trim());
	if (!match) return null;

	const [, yearText, monthText, dayText] = match;
	const year = Number(yearText);
	const month = Number(monthText);
	const day = Number(dayText);
	const birthDate = new Date(year, month - 1, day);
	if (
		birthDate.getFullYear() !== year ||
		birthDate.getMonth() !== month - 1 ||
		birthDate.getDate() !== day
	) {
		return null;
	}

	let age = referenceDate.getFullYear() - year;
	const birthdayHasNotOccurred =
		referenceDate.getMonth() < month - 1 ||
		(referenceDate.getMonth() === month - 1 &&
			referenceDate.getDate() < day);
	if (birthdayHasNotOccurred) age -= 1;
	return age < 0 ? null : age;
}

/** Month name is spelled out for the printed attestation. */
export function formatLongDate(value?: string | null): string {
	const iso = toDateInputValue(value);
	if (!iso) return "—";
	const parsed = new Date(`${iso}T00:00:00`);
	if (Number.isNaN(parsed.getTime())) return "—";
	return parsed.toLocaleDateString("fr-FR", {
		day: "numeric",
		month: "long",
		year: "numeric",
	});
}

/** Human label for the two enum values of the API. */
export function labelSexe(sexe: string): string {
	if (sexe === "MASCULIN") return "Homme";
	if (sexe === "FEMININ") return "Femme";
	return sexe || "—";
}

/** `M1234` stays readable; empty values become an em dash in tables. */
export function orDash(value?: string | number | null): string {
	if (value === undefined || value === null || value === "") return "—";
	return String(value);
}

/** ISO timestamp of "now", used as a default for new records. */
export function today(): string {
	return new Date().toISOString().slice(0, 10);
}

// --- Enum labels ------------------------------------------------------------
// Raw API enums are shown as readable French labels in the tables and selects.

const STATUT_PEC_LABELS: Record<string, string> = {
	AGENT: "Agent",
	CHEF_SERVICE: "Chef de service",
	CHEF_AGENCE: "Chef d'agence",
	DIRECTEUR: "Directeur",
};

const AFFECTATION_LABELS: Record<string, string> = {
	AGENCE: "Agence (front office)",
	DIRECTION: "Direction (back office)",
	RETRAITE: "Retraité",
};

const CODE_FAMILLE_LABELS: Record<string, string> = {
	AGENT: "Agent",
	CONJOINT: "Conjoint",
	ENFANT: "Enfant",
};

const PROVIDER_STATUS_LABELS: Record<string, string> = {
	PRIVE: "Privé",
	PUBLIC: "Public",
};

export function labelStatutPEC(value: string): string {
	return STATUT_PEC_LABELS[value] ?? orDash(value);
}

export function labelAffectation(value: string): string {
	return AFFECTATION_LABELS[value] ?? orDash(value);
}

export function labelCodeFamille(value: string): string {
	return CODE_FAMILLE_LABELS[value] ?? orDash(value);
}

export function labelProviderStatus(value: string): string {
	return PROVIDER_STATUS_LABELS[value] ?? orDash(value);
}

/** Builds `{value,label}` options from a `const` tuple of raw API values. */
export function toOptions(
	values: readonly string[],
	labeller?: (value: string) => string,
): { value: string; label: string }[] {
	return values.map((value) => ({
		value,
		label: labeller ? labeller(value) : value,
	}));
}
