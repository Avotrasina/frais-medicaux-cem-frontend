import type { StructureOrganisationnelle } from "../types/organisation";
export const structures: StructureOrganisationnelle[] = [
  {
    id: "STR-001",
    statutPEC: "DIRECTEUR",
    direction: {
      codeDirection: "DSITN",
      nom: "Direction des Systèmes d'Information et de la Transformation Numérique",
      services: [],
    },
    agents: [],
  },
  {
    id: "STR-002",
    statutPEC: "CHEF_SERVICE",
    direction: {
      codeDirection: "DRH",
      nom: "Direction des Ressources Humaines",
      services: [],
    },
    agents: [],
  },
  {
    id: "STR-003",
    statutPEC: "CHEF_AGENCE",
    agence: {
      codeAgence: "CEM 001",
      nomAgence: "CEM - WU 001 TSARALALANA",
    },
    agents: [],
  },
  {
    id: "STR-004",
    statutPEC: "AGENT",
    direction: {
      codeDirection: "DFC",
      nom: "Direction Financière et Comptable",
      services: [],
    },
    agents: [],
  },
  {
    id: "STR-005",
    statutPEC: "AGENT",
    agence: {
      codeAgence: "CEM 002",
      nomAgence: "CEM - WU 002 FIANARANTSOA",
    },
    agents: [],
  },
];