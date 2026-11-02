export const TypeContrainte = {
    PAR_AN : "PAR_AN",
    PAR_AN_PAR_ACTE : "PAR_AN_PAR_ACTE",
    PAR_SEANCE : "PAR_SEANCE"
} as const;
export type TypeContrainte  = typeof TypeContrainte [keyof typeof TypeContrainte];

