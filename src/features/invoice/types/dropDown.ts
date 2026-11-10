export const TypeContrainte = {
    PAR_AN : "PAR_AN",
    PAR_AN_PAR_ACTE : "PAR_AN_PAR_ACTE",
    PAR_SEANCE : "PAR_SEANCE"
} as const;
export type TypeContrainte  = typeof TypeContrainte [keyof typeof TypeContrainte];

/** A tracked target is either an act category or a single act. */
export type CibleType = "categorie" | "acte";

/**
 * Option rendered by the "Maj T5" dropdown and reused by the T5 pages.
 * The ceilings are flattened so each page can read the one it needs.
 */
export type DropdownOption = {
    id: number;
    label: string;
    typeContrainte: TypeContrainte;
    type: CibleType;
    /** Annual ceiling in MGA (PLAFOND_ANNUEL / PLAFOND_ACTE_ET_ANNUEL). */
    plafondParAn?: number;
    /** Per-act ceiling in MGA (PLAFOND_ACTE_ET_ANNUEL). */
    plafondParActe?: number;
    /** Number of sessions (SEANCES). */
    nombreSeance?: number;
    /** Act code, when the target is an act. */
    code?: string;
    /** Parent category, when the target is an act. */
    categorieActeId?: number;
    categorieActe?: string;
};
