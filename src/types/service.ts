import type { Agent } from "./agent"

export interface Service {
  codeService: string
  nom: string
  codeDirection: string
  agents: Agent[]
}