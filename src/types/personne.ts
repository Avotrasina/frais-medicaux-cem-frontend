import type { Agent, FamilleAgent } from "./agent"
import type { Attestation } from "./attestation"

export interface Personne {
  id: number
  nom: string
  prenom: string
  dateNaissance: string
  sexe: 'MASCULIN' | 'FEMININ'
  beneficiaire? : Beneficiaire
  familleAgent?: FamilleAgent
  agent?: Agent
}



export interface Beneficiaire {
  id: number
  idp: string
  observationIDP?: string
  personne: Personne
  attestations: Attestation[]
}
