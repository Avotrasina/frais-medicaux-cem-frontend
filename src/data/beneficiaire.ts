import type { Beneficiaire } from "../types/personne";
import { personnes } from "./personne";
import { attestations } from "./attestation";

export const beneficiaires: Beneficiaire[] = [
  {
    id: 1,
    idp: "IDP-2026-001",
    personne: personnes[0],
    attestations: [attestations[0]],
  },
  {
    id: 2,
    idp: "IDP-2026-002",
    personne: personnes[1],
    attestations: [attestations[1]],
  },
  {
    id: 3,
    idp: "IDP-2026-003",
    personne: personnes[2],
    attestations: [attestations[2]],
  },
  {
    id: 4,
    idp: "IDP-2026-004",
    personne: personnes[7],
    attestations: [attestations[3]],
  },
];