interface Personne {
  id: number
  nom: string
  prenom: string
  dateNaissance: string
  sexe: 'MASCULIN' | 'FEMININ'
  beneficiaire? : Beneficiaire
  familleAgent?: FamilleAgent
  agent?: Agent
}


interface Agence {
  codeAgence: string
  nomAgence: string
}

interface StructureOrganisationnelle {
  id: string
  statutPEC: "AGENCE" | "CHEF_SERVICE" | "CHEF_AGENCE" | "DIRECTEUR"
  agence?: Agence
  direction?: Direction
  agents: Agent[]
}

interface Fonction {
  id: number
  nom: string
  agents: Agent[]
}

interface Direction {
  codeDirection: string
  nom: string
  directionType: "SERVICE" | "LIBRE"
  services: Service[]
}

interface Service {
  codeService: string
  nom: string
  codeDirection: string
  agents: Agent[]
}


interface Agent {
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

interface FamilleAgent {
  id: number
  agentMatricule: number
  carteSocialePath: string
  conjoint?: Conjoint
  enfant?: Enfant

}

interface Enfant {
  id: number
  numEnfant: number
}

interface Conjoint {
  id: number
  numConjoint: number
}

interface Beneficiaire {
  id: number
  idp: string
  observationIDP?: string
  personne: Personne
  attestations: Attestation[]
}

interface Attestation {
  id: number
  attestationPath: number
  datValidation: string
  naturePrestation: string
  servicePrestataire: string
  prestataireID: number
  idpBeneficiaire: string
}

interface Prestataire {
  id: number
  nom: string
  adresse: string
  statut: "PRIVE" | "PUBLIC"
  nif: string
  stat: string
  dateDebutConvention: string
  dateFinConvention: string
  listePrestation: string
  lieuID: number
  categorieID: number
  attestations: Attestation[]
}