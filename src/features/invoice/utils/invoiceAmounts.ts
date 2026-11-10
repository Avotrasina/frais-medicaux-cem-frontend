import type { FactureGlobaleRow } from "../types/invoiceTable";

/** Columns that are derived from the total, the CEM share and the overrun. */
export const COMPUTED_AMOUNT_KEYS: ReadonlySet<string> = new Set([
	"partCem80",
	"partAgent20",
	"totalPartAgent",
]);

/** Columns whose change triggers a recalculation of the derived amounts. */
export const AMOUNT_SOURCE_KEYS: ReadonlySet<string> = new Set([
	"montantTotal",
	"partCem100",
	"depassement",
]);

export type FactureGlobaleComputedAmounts = Pick<
	FactureGlobaleRow,
	"partCem80" | "partAgent20" | "totalPartAgent"
>;

/**
 * Applies the invoice sharing rules:
 * - 80 % CEM = (montant total − 100 % CEM − dépassement) × 80 %
 * - 20 % agent = (montant total − 100 % CEM − dépassement) × 20 %
 * - total part agent = dépassement + 20 % agent
 */
export function computeFactureGlobaleAmounts(
	montantTotal: number,
	partCem100: number,
	depassement: number,
): FactureGlobaleComputedAmounts {
	const base = montantTotal - partCem100 - depassement;
	const partAgent20 = (base * 20) / 100;

	return {
		partCem80: (base * 80) / 100,
		partAgent20,
		totalPartAgent: depassement + partAgent20,
	};
}
