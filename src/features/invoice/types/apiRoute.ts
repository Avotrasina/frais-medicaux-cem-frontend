type Nullable<T> = {
    [K in keyof T]: T[K] | null;
};

type FactureDetails = {
    dateReception : Date,
    numFacture : string,
    dateFacture : Date,
    nomEtablissement:string,
    montantTotal : number,
    cem100 : number,
    depassement : number,
    cem80: number,
    agent20 : number,
    totalAgent : number,
    localité : number,
    moisPrestation : string,
    refAgence : string,
    remarque1: string,
    dateRetourPrestataire: Date,
    dateReceptionPrestataire: Date
}

type EnregistrementFacture = {
    DateEnregistrement : Date,
    nomActeur : string
}

export type  CreateFactureInput =  {
    dateReception : Date,
    numFacture : string,
    dateFacture : Date,
    nomEtablissement:string,
    montantTotal : number
}

export type UpdateFactureInput = Partial<FactureDetails>

export type ReadFactureOutput = {
    Refsocial : string,
    FactureDetails : Nullable<FactureDetails>,
    EnregistrementFacture ? : EnregistrementFacture
}