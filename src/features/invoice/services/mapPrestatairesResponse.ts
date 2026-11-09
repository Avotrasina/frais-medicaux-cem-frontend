import type { LocationResponseDto } from "../../../api/domains/lieu";
import type { ProviderResponseDto } from "../../../api/domains/prestataire";
import type { Prestataire } from "../types/prestataire";

export function mapPrestatairesResponse(
	providers: ProviderResponseDto[],
	locations: LocationResponseDto[],
): Prestataire[] {
	const locationNames = new Map(
		locations.map((location) => [location.id, location.nom]),
	);

	return providers.map((provider) => ({
		id: provider.id,
		nomEtablissement: provider.nom,
		localite: locationNames.get(provider.lieuID) ?? "",
	}));
}
