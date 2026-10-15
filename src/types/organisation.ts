import type { Agent } from "./agent"
import type { Service } from "./service"

export interface StructureOrganisationnelle {
  id: string
  statutPEC: "AGENT" | "CHEF_SERVICE" | "CHEF_AGENCE" | "DIRECTEUR"
  agence?: Agence
  direction?: Direction
  agents: Agent[]
}

export interface Fonction {
  id: number
  nom: string
  agents: Agent[]
}

  export interface Direction {
    codeDirection: string
    nom: string
    services: Service[]
  }

export interface Agence {
  codeAgence: string
  nomAgence: string
}

