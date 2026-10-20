import type { Agent } from "../types/agent";

export const agents: Agent[] = [
	{
		id: 1,
		matricule: "256",
		carteProfessionnellePath:
			"images/cartes-professionnelles/11111111-1111-4111-8111-111111111111.jpg",
		dateEntree: "2020-03-15",
		agentType: "AGENT_ACTIF",
		familleAgent: [],
		structureID: "STR-001",
		serviceID: "SAR",
		fonction: "Directeur",
		categorieID: "VIII",
	},
	{
		id: 2,
		matricule: "412",
		carteProfessionnellePath:
			"images/cartes-professionnelles/22222222-2222-4222-8222-222222222222.png",
		dateEntree: "2021-06-01",
		agentType: "AGENT_ACTIF",
		familleAgent: [],
		structureID: "STR-002",
		serviceID: "SAC",
		fonction: "Chef de service",
		categorieID: "VII",
	},
	{
		id: 3,
		matricule: "303",
		carteProfessionnellePath:
			"images/cartes-professionnelles/33333333-3333-4333-8333-333333333333.webp",
		dateEntree: "2019-01-10",
		agentType: "AGENT_ACTIF",
		familleAgent: [],
		structureID: "STR-003",
		serviceID: "SDO",
		fonction: "Chef d'agence",
		categorieID: "VII",
	},
	{
		id: 4,
		matricule: "125",
		observationMatricule: "Matricule mis à jour en 2022",
		carteProfessionnellePath:
			"images/cartes-professionnelles/99999999-9999-4999-8999-999999999999.jpg",
		dateEntree: "2022-02-01",
		agentType: "AGENT_ACTIF",
		familleAgent: [],
		structureID: "STR-004",
		serviceID: "AJ",
		fonction: "Agent administratif",
		categorieID: "V",
	},
	{
		id: 5,
		matricule: "268",
		carteProfessionnellePath:
			"images/cartes-professionnelles/aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa.jpg",
		dateEntree: "1998-09-01",
		agentType: "AGENT_RETRAITE",
		familleAgent: [],
		structureID: "STR-005",
		serviceID: "AS",
		fonction: null,
		categorieID: "VI",
	},
	{
		id: 6,
		matricule: "563",
		carteProfessionnellePath:
			"images/cartes-professionnelles/bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb.jpg",
		dateEntree: "2023-04-17",
		agentType: "AGENT_ACTIF",
		familleAgent: [],
		structureID: "STR-006",
		serviceID: "SAP",
		fonction: "Développeur informatique",
		categorieID: "VI",
	},
];
