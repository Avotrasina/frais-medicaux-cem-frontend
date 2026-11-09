/**
 * Provider option displayed by the invoice table.
 *
 * `nomEtablissement` is the API `ProviderResponseDto.nom`; `localite` is the
 * name of the location referenced by the provider's `lieuID`.
 */
export type Prestataire = {
	id: number;
	nomEtablissement: string;
	localite: string;
};
