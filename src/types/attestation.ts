export interface Attestation {
  id: number
  attestationPath: number
  dateValidation: string
  naturePrestation: string
  servicePrestataire: string
  prestataireID: number
  statut : "EN_ATTENTE" | "VALIDEE" | "REFUSEE"
  idpBeneficiaire: string
}