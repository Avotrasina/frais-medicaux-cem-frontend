import type { FactureGlobaleRow } from "../types/invoiceTable";

export const textFilterKeys = [
	"refSocial", "numFacture", "nomEtablissement",
] as const;

export const dateFilterKeys = ["dateReception", "dateFacture"] as const;

export type TextFilterKey = (typeof textFilterKeys)[number];
export type DateFilterKey = (typeof dateFilterKeys)[number];
export type InvoiceDateRange = { from: string; to: string };
export type InvoiceMonthFilter = { month: string; year: string };
export type FactureGlobaleFilters = {
	text: Partial<Record<TextFilterKey, string>>;
	dates: Partial<Record<DateFilterKey, InvoiceDateRange>>;
	monthPrestation: InvoiceMonthFilter;
};

function parseDate(value: string): number | null {
	if (!value) return null;
	const frenchDate = value.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
	if (frenchDate) {
		return Date.UTC(Number(frenchDate[3]), Number(frenchDate[2]) - 1, Number(frenchDate[1]));
	}
	const timestamp = Date.parse(value);
	return Number.isNaN(timestamp) ? null : timestamp;
}

export function filterFactureGlobaleRows(
	rows: FactureGlobaleRow[],
	filters: FactureGlobaleFilters,
): FactureGlobaleRow[] {
	return rows.filter((row) => {
		const matchesText = textFilterKeys.every((key) => {
			const query = filters.text[key]?.trim().toLocaleLowerCase();
			const value = row[key] ?? "";
			return !query || value.toLocaleLowerCase().includes(query);
		});
		if (!matchesText) return false;

		const { month, year } = filters.monthPrestation;
		if (month || year) {
			const prestationDate = row.moisPrestation;
			if (!prestationDate
				|| (month && String(prestationDate.getUTCMonth() + 1) !== month)
				|| (year && String(prestationDate.getUTCFullYear()) !== year)) {
				return false;
			}
		}

		return dateFilterKeys.every((key) => {
			const range = filters.dates[key];
			if (!range?.from || !range.to) return true;
			const value = parseDate(row[key]);
			const from = parseDate(range.from);
			const to = parseDate(range.to);
			if (value === null || from === null || to === null) return false;
			const [start, end] = from <= to ? [from, to] : [to, from];
			return value >= start && value <= end;
		});
	});
}
