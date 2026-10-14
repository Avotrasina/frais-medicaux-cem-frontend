import type { Attestation } from "./attestation"

export interface Prestataire {
  id: number
  nom: string
  adresse: string
  statut: "PRIVE" | "PUBLIC"
  nif: string
  stat: string
  dateDebutConvention: string
  dateFinConvention: string
  listePrestation: string
  lieuID: number
  categorieID: number
  attestations: Attestation[]
}