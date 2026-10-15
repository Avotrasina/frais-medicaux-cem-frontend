import type { Prestataire } from "../types/prestataire";

export const prestataires: Prestataire[] = [
  { id: 1, nom: "Clinique Saint-Paul", adresse: "Analamahitsy, Antananarivo", statut: "PRIVE", nif: "3000123456", stat: "86101 11 2020 0 10001", dateDebutConvention: "2024-01-01", dateFinConvention: "2027-12-31", listePrestation: "Consultation, hospitalisation", lieuID: 1, categorieID: 1, attestations: [] },
  { id: 2, nom: "Centre Hospitalier Befelatanana", adresse: "Befelatanana, Antananarivo", statut: "PUBLIC", nif: "2000234567", stat: "86101 11 2018 0 20002", dateDebutConvention: "2023-01-01", dateFinConvention: "2026-12-31", listePrestation: "Médecine interne, urgence", lieuID: 2, categorieID: 2, attestations: [] },
  { id: 3, nom: "Laboratoire Ankadifotsy", adresse: "Ankadifotsy, Antananarivo", statut: "PRIVE", nif: "3000345678", stat: "86901 11 2022 0 30003", dateDebutConvention: "2025-02-01", dateFinConvention: "2027-01-31", listePrestation: "Analyses biologiques", lieuID: 1, categorieID: 3, attestations: [] },
  { id: 4, nom: "Cabinet Médical Tsaralalàna", adresse: "Tsaralalàna, Antananarivo", statut: "PRIVE", nif: "3000456789", stat: "86201 11 2021 0 40004", dateDebutConvention: "2024-06-01", dateFinConvention: "2027-05-31", listePrestation: "Consultation générale", lieuID: 1, categorieID: 1, attestations: [] },
];
