import type { Attestation } from "../types/attestation";
export const attestations: Attestation[] = [
  {
    id: 1,
    attestationPath: 1,
    dateValidation: "2026-09-15",
    naturePrestation: "Consultation médicale",
    servicePrestataire: "Médecine générale",
    prestataireID: 1,
    idpBeneficiaire: "IDP-2026-001",
  },
  {
    id: 2,
    attestationPath: 2,
    dateValidation: "2026-09-20",
    naturePrestation: "Analyses biologiques",
    servicePrestataire: "Laboratoire",
    prestataireID: 4,
    idpBeneficiaire: "IDP-2026-002",
  },
  {
    id: 3,
    attestationPath: 3,
    dateValidation: "2026-10-02",
    naturePrestation: "Hospitalisation",
    servicePrestataire: "Médecine interne",
    prestataireID: 2,
    idpBeneficiaire: "IDP-2026-003",
  },
  {
    id: 4,
    attestationPath: 4,
    dateValidation: "2026-10-05",
    naturePrestation: "Consultation pédiatrique",
    servicePrestataire: "Pédiatrie",
    prestataireID: 3,
    idpBeneficiaire: "IDP-2026-004",
  },
];