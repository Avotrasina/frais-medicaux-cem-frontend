export interface Agent {
  id: number
  matricule: string
  observationMatricule?: string
  carteProfessionnellePath: string
  dateEntree: string
  agentType: 'AGENT_ACTIF' | 'AGENT_RETRAITE'
  familleAgent: FamilleAgent[]

  structureID: string
  serviceID: number
  fonctionID: number
  categorieID: string
}

export interface FamilleAgent {
  id: number
  agentMatricule: string
  carteSocialePath: string
  conjoint?: Conjoint
  enfant?: Enfant

}

export interface Enfant {
  id: number
  numEnfant: number
}

export interface Conjoint {
  id: number
  numConjoint: number
}   