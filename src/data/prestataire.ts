import type { Personne, FamilleAgent } from "../types/personne";
import { agents } from "./agent";

export const personnes: Personne[] = [
  {
    id: 1,
    nom: "Rasolofonirina",
    prenom: "Andry",
    dateNaissance: "1985-04-12",
    sexe: "MASCULIN",
    agent: agents[0],
  },
  {
    id: 2,
    nom: "Rakotoarisoa",
    prenom: "Mialy",
    dateNaissance: "1990-08-25",
    sexe: "FEMININ",
    agent: agents[1],
  },
  {
    id: 3,
    nom: "Randriamampionona",
    prenom: "Hery",
    dateNaissance: "1978-11-03",
    sexe: "MASCULIN",
    agent: agents[2],
  },
  {
    id: 4,
    nom: "Rabe",
    prenom: "Voahirana",
    dateNaissance: "1995-02-14",
    sexe: "FEMININ",
    agent: agents[3],
  },
  {
    id: 5,
    nom: "Andrianina",
    prenom: "Jean",
    dateNaissance: "1965-07-19",
    sexe: "MASCULIN",
    agent: agents[4],
  },
  {
    id: 6,
    nom: "Rajaonarivelo",
    prenom: "Toky",
    dateNaissance: "1998-06-21",
    sexe: "MASCULIN",
    agent: agents[5],
  },
  {
    id: 7,
    nom: "Rasoa",
    prenom: "Fara",
    dateNaissance: "1988-09-10",
    sexe: "FEMININ",
  },
  {
    id: 8,
    nom: "Ramanantsoa",
    prenom: "Lova",
    dateNaissance: "2015-12-05",
    sexe: "MASCULIN",
  },
  {
    id: 9,
    nom: "Rakoto",
    prenom: "Soa",
    dateNaissance: "2018-03-17",
    sexe: "FEMININ",
  },
];

export const famillesAgents: FamilleAgent[] = [
  {
    id: 1,
    agentMatricule: "1",
    carteSocialePath: "/mock/cartes-sociales/famille-001.jpg",
    conjoint: { id: 1, numConjoint: 1 },
  },
  {
    id: 2,
    agentMatricule: "1",
    carteSocialePath: "/mock/cartes-sociales/famille-002.jpg",
    enfant: { id: 2, numEnfant: 1 },
  },
  {
    id: 3,
    agentMatricule: "2",
    carteSocialePath: "/mock/cartes-sociales/famille-003.jpg",
    conjoint: { id: 3, numConjoint: 1 },
  },
  {
    id: 4,
    agentMatricule: "2",
    carteSocialePath: "/mock/cartes-sociales/famille-004.jpg",
    enfant: { id: 4, numEnfant: 1 },
  },
  {
    id: 5,
    agentMatricule: "3",
    carteSocialePath: "/mock/cartes-sociales/famille-005.jpg",
    enfant: { id: 5, numEnfant: 1 },
  },
];

// Attach family records to their respective agents.
agents[0].familleAgent = famillesAgents.filter(
  (famille) => famille.agentMatricule === agents[0].matricule
);

agents[1].familleAgent = famillesAgents.filter(
  (famille) => famille.agentMatricule === agents[1].matricule
);

agents[2].familleAgent = famillesAgents.filter(
  (famille) => famille.agentMatricule === agents[2].matricule
);