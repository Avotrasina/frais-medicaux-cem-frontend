import type { Beneficiaire } from "../types/personne";
import type { MockAttestation } from "../types/attestation";
import { personnes } from "./personne";
import { attestations } from "./attestation";

type MockBeneficiaire = Omit<Beneficiaire, "attestations"> & {
  attestations: MockAttestation[];
};

export const beneficiaires: MockBeneficiaire[] = [
  {
    id: 1,
    idp: "001AGT001",
    personne: personnes[0],
    attestations: [attestations[0]],
  },
  {
    id: 2,
    idp: "002AGT001",
    personne: personnes[1],
    attestations: [attestations[1]],
  },
  {
    id: 3,
    idp: "003AGT001",
    personne: personnes[2],
    attestations: [attestations[2]],
  },
  {
    id: 4,
    idp: "007CJT001",
    personne: personnes[7],
    attestations: [attestations[3]],
  },
];