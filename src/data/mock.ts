export type Agent = {
  id: number
  im: string
  name: string
  function: string
  statusPec: 'ACTIVE' | 'SUSPENDU' | 'RETRAITE'
  sex: 'F' | 'M'
  category: string
  org: string
  direction: string
  service: string
  birth: string
  entry: string
  observation: string
  card: string
  updatedBy: string
}

export const agents: Agent[] = [
  { id: 1, im: '100245', name: 'Rakotoarisoa Mialy', function: 'Responsable RH', statusPec: 'ACTIVE', sex: 'F', category: 'A', org: 'Back_O', direction: 'DCH', service: 'Ressources Humaines', birth: '1987-03-14', entry: '2012-06-04', observation: 'Carte à jour', card: 'CS-1034', updatedBy: 'A. Rasoa' },
  { id: 2, im: '100311', name: 'Rabe Jean Michel', function: 'Comptable principal', statusPec: 'ACTIVE', sex: 'M', category: 'A', org: 'Front_O', direction: 'DFC', service: 'Comptabilité', birth: '1982-09-22', entry: '2010-01-18', observation: 'RAS', card: 'CS-1198', updatedBy: 'M. Ando' },
  { id: 3, im: '100492', name: 'Randrianasolo Tiana', function: 'Chargée clientèle', statusPec: 'SUSPENDU', sex: 'F', category: 'B', org: 'Front_O', direction: 'DCC', service: 'Agence Antaninarenina', birth: '1990-11-08', entry: '2017-04-12', observation: 'Dossier à actualiser', card: 'CS-1507', updatedBy: 'H. Fara' },
  { id: 4, im: '100578', name: 'Rakotomalala Tojo', function: 'Technicien SI', statusPec: 'ACTIVE', sex: 'M', category: 'B', org: 'Back_O', direction: 'DSI', service: 'Infrastructure', birth: '1994-05-19', entry: '2020-10-01', observation: 'RAS', card: 'CS-1782', updatedBy: 'A. Rasoa' },
  { id: 5, im: '100641', name: 'Razafindrakoto Hanta', function: 'Directrice', statusPec: 'RETRAITE', sex: 'F', category: 'Direction', org: 'Back_O', direction: 'DG', service: 'Direction Générale', birth: '1963-12-03', entry: '1986-02-10', observation: 'Départ retraite', card: 'CS-0412', updatedBy: 'S. Noro' },
]

export const beneficiaries = [
  { id: 'BEN-00152', name: 'Rakotoarisoa Mialy', link: 'Agent', relationship: 'Titulaire', card: 'CS-1034', observation: '—', updatedBy: 'A. Rasoa' },
  { id: 'BEN-00153', name: 'Andrianina Rakoto', link: 'FamilleAgent', relationship: 'Conjoint', card: 'CS-1034', observation: 'Dépendant', updatedBy: 'A. Rasoa' },
  { id: 'BEN-00154', name: 'Tsiory Rakoto', link: 'FamilleAgent', relationship: 'Enfant', card: 'CS-1034', observation: 'Scolarisé', updatedBy: 'M. Ando' },
  { id: 'BEN-00221', name: 'Rabe Jean Michel', link: 'Agent', relationship: 'Titulaire', card: 'CS-1198', observation: '—', updatedBy: 'H. Fara' },
  { id: 'BEN-00222', name: 'Miora Rabe', link: 'FamilleAgent', relationship: 'Conjoint', card: 'CS-1198', observation: '—', updatedBy: 'H. Fara' },
]

export const prestataires = [
  { id: 1, localite: 'Antananarivo', name: 'Clinique Ivandry', address: 'Lot II G 23 Ivandry', category: 'Clinique', act: 'Consultation • Hospitalisation', status: 'PUBLIC', nif: '4000012345', stat: '86102 11 2020 0 12345', start: '2025-01-01', end: '2026-12-31', scan: 'Convention-2025-CLI.pdf', updatedBy: 'M. Ando' },
  { id: 2, localite: 'Antananarivo', name: 'Centre Médical Ankadifotsy', address: 'Route d’Ankadifotsy', category: 'Centre médical', act: 'Consultation • Imagerie', status: 'PRIVE', nif: '4000045789', stat: '86210 11 2018 0 09876', start: '2024-07-01', end: '2026-06-30', scan: 'Convention-CMA.pdf', updatedBy: 'H. Fara' },
  { id: 3, localite: 'Antsirabe', name: 'Pharmacie Soa', address: 'Avenue Joffre, Antsirabe', category: 'Pharmacie', act: 'Médicaments', status: 'PRIVE', nif: '4000067801', stat: '47730 11 2021 0 23456', start: '2025-03-15', end: '2027-03-14', scan: 'Convention-PSS.pdf', updatedBy: 'A. Rasoa' },
  { id: 4, localite: 'Toamasina', name: 'Hôpital Be', address: 'Rue de l’Hôpital, Toamasina', category: 'Hôpital', act: 'Hospitalisation • Analyses', status: 'PUBLIC', nif: '4000092211', stat: '86101 11 2019 0 56780', start: '2025-02-01', end: '2026-01-31', scan: 'Convention-HBE.pdf', updatedBy: 'S. Noro' },
]

export const pec = [
  { id: 'PEC-2026-00431', beneficiary: 'Rakotoarisoa Mialy', prestataire: 'Clinique Ivandry', nature: 'Consultation spécialisée', requested: '2026-09-18', amount: '145 000 Ar', status: 'EN COURS', by: 'A. Rasoa' },
  { id: 'PEC-2026-00430', beneficiary: 'Andrianina Rakoto', prestataire: 'Centre Médical Ankadifotsy', nature: 'Scanner', requested: '2026-09-17', amount: '350 000 Ar', status: 'ACCORDÉE', by: 'M. Ando' },
  { id: 'PEC-2026-00429', beneficiary: 'Rabe Jean Michel', prestataire: 'Clinique Ivandry', nature: 'Analyses', requested: '2026-09-16', amount: '78 500 Ar', status: 'EN COURS', by: 'H. Fara' },
  { id: 'PEC-2026-00428', beneficiary: 'Miora Rabe', prestataire: 'Pharmacie Soa', nature: 'Médicaments', requested: '2026-09-15', amount: '92 000 Ar', status: 'REFUSÉE', by: 'A. Rasoa' },
  { id: 'PEC-2026-00427', beneficiary: 'Tsiory Rakoto', prestataire: 'Centre Médical Ankadifotsy', nature: 'Consultation pédiatrique', requested: '2026-09-14', amount: '65 000 Ar', status: 'ACCORDÉE', by: 'M. Ando' },
]

export const invoices = [
  { id: 'FAC-2026-00891', prestataire: 'Clinique Ivandry', period: '09/2026', beneficiaries: 42, billed: '8 920 000 Ar', accepted: '7 645 000 Ar', status: 'À RAPPROCHER', by: 'M. Ando' },
  { id: 'FAC-2026-00890', prestataire: 'Pharmacie Soa', period: '09/2026', beneficiaries: 58, billed: '4 250 000 Ar', accepted: '4 108 000 Ar', status: 'VALIDÉE', by: 'A. Rasoa' },
  { id: 'FAC-2026-00889', prestataire: 'Centre Médical Ankadifotsy', period: '08/2026', beneficiaries: 31, billed: '6 180 000 Ar', accepted: '5 960 000 Ar', status: 'VALIDÉE', by: 'H. Fara' },
  { id: 'FAC-2026-00888', prestataire: 'Hôpital Be', period: '08/2026', beneficiaries: 17, billed: '11 420 000 Ar', accepted: '9 870 000 Ar', status: 'LITIGE', by: 'S. Noro' },
]

export const deductions = [
  { id: 'RET-2026-00612', agent: 'Rakotoarisoa Mialy', month: '10/2026', total: '450 000 Ar', monthly: '75 000 Ar', remaining: '375 000 Ar', status: 'EN COURS', by: 'A. Rasoa' },
  { id: 'RET-2026-00611', agent: 'Rabe Jean Michel', month: '10/2026', total: '280 000 Ar', monthly: '70 000 Ar', remaining: '210 000 Ar', status: 'EN COURS', by: 'M. Ando' },
  { id: 'RET-2026-00610', agent: 'Randrianasolo Tiana', month: '09/2026', total: '1 150 000 Ar', monthly: '115 000 Ar', remaining: '805 000 Ar', status: 'SUSPENDUE', by: 'H. Fara' },
  { id: 'RET-2026-00609', agent: 'Rakotomalala Tojo', month: '08/2026', total: '150 000 Ar', monthly: '50 000 Ar', remaining: '0 Ar', status: 'TERMINEE', by: 'A. Rasoa' },
]

export const activities = [
  { icon: 'shield', title: 'Prise en charge PEC-2026-00431 créée', detail: 'Rakotoarisoa Mialy • Clinique Ivandry', time: 'il y a 18 min' },
  { icon: 'receipt', title: 'Facture FAC-2026-00891 importée', detail: '8 920 000 Ar • 42 bénéficiaires', time: 'il y a 43 min' },
  { icon: 'user', title: 'Fiche agent modifiée', detail: 'Rakotomalala Tojo • Observation', time: 'il y a 1 h' },
  { icon: 'check', title: 'Convention prestataire validée', detail: 'Centre Médical Ankadifotsy', time: 'il y a 2 h' },
]
