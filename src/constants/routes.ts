export const ROUTES = {
  home: "/",
  agents: "/agents",
  beneficiaries: "/beneficiaires",
  providers: "/prestataires",
  coverage: "/pec",
  referentials: "/referentiels",
  deletionRequests: "/demandes-suppression",
  invoice: "/factures",
  T5ParAn: "/ParAn/:id/:label/:refSocial",
  T5Parseance: "/ParSeance/:id/:label/:refSocial",
  T5ParAnParActe: "/ParAnParActe/:id/:label/:refSocial",
} as const;
