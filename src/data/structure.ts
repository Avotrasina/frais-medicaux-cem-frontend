import type { StructureOrganisationnelle } from "../types/organisation";
import { directions } from "./direction";
import { agents } from "./agent";
export const structures: StructureOrganisationnelle[] = [
  {
    id: "STR-001",
    statutPEC: "CHEF_SERVICE",
    direction: directions.find((d) => d.codeDirection === "DCR"),
    agents: agents.filter((a) => a.structureID === "STR-001"),
  },
  {
    id: "STR-002",
    statutPEC: "AGENT",
    direction: directions.find((d) => d.codeDirection === "DCR"),
    agents: agents.filter((a) => a.structureID === "STR-002"),
  },
  {
    id: "STR-003",
    statutPEC: "AGENT",
    direction: directions.find((d) => d.codeDirection === "DID"),
    agents: agents.filter((a) => a.structureID === "STR-003"),
  },
  {
    id: "STR-004",
    statutPEC: "AGENT",
    direction: directions.find((d) => d.codeDirection === "DAI"),
    agents: agents.filter((a) => a.structureID === "STR-004"),
  },
  {
    id: "STR-005",
    statutPEC: "AGENT",
    direction: directions.find((d) => d.codeDirection === "DAI"),
    agents: agents.filter((a) => a.structureID === "STR-005"),
  },
  {
    id: "STR-006",
    statutPEC: "DIRECTEUR",
    direction: directions.find((d) => d.codeDirection === "DRH"),
    agents: agents.filter((a) => a.structureID === "STR-006"),
  },
];