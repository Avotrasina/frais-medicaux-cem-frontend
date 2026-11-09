import { apiRoutes, apiService } from "../../../services/api";
import type {
	CreateAgenceDto,
	CreateDirectionDto,
	CreateServiceDto,
	UpdateAgenceDto,
	UpdateDirectionDto,
	UpdateServiceCodeDirectionDto,
	UpdateServiceNomDto,
} from "../../../api/domains/structure-organisationnelle";
import type {
	CreateAgentCategoryDto,
	UpdateAgentCategoryDto,
} from "../../../api/domains/categorie-agent";
import type {
	CreateLieuDto,
	UpdateLieuDto,
} from "../../../api/domains/lieu";
import type {
	Agence,
	AgentCategory,
	Direction,
	Lieu,
	Service,
} from "../../../types/api";

/**
 * Referentials consumed by the agent and provider forms.
 *
 * Naming is inconsistent in the backend: create/update bodies send
 * `nomDirection` / `nomService`, while responses answer with `nom`.
 * The wrappers below hide that difference from the UI.
 */

// --- Locations --------------------------------------------------------------

/** There is no `GET /locations/:id`: only the full listing is available. */
export function listLieux(): Promise<Lieu[]> {
	return apiService.get<Lieu[]>(apiRoutes.lieux);
}

export function createLieu(nom: string): Promise<Lieu> {
	const body: CreateLieuDto = { nom };
	return apiService.post<Lieu>(apiRoutes.lieux, body);
}

export function updateLieu(id: number, nom: string): Promise<Lieu> {
	const body: UpdateLieuDto = { nom };
	return apiService.patch<Lieu>(apiRoutes.lieu(id), body);
}

// --- Agent categories -------------------------------------------------------

/**
 * Agents reference a category by its `codeCategory` string (the `categorieID`
 * field of agent payloads), never by the numeric `id`.
 */
export function listAgentCategories(): Promise<AgentCategory[]> {
	return apiService.get<AgentCategory[]>(apiRoutes.agentCategories);
}

export function createAgentCategory(
	codeCategory: string,
): Promise<AgentCategory> {
	const body: CreateAgentCategoryDto = { codeCategory };
	return apiService.post<AgentCategory>(apiRoutes.agentCategories, body);
}

export function updateAgentCategory(
	id: number,
	codeCategory: string,
): Promise<AgentCategory> {
	const body: UpdateAgentCategoryDto = { codeCategory };
	return apiService.patch<AgentCategory>(apiRoutes.agentCategory(id), body);
}

// --- Organisational structure ----------------------------------------------

export function listAgences(): Promise<Agence[]> {
	return apiService.get<Agence[]>(apiRoutes.agences);
}

export function createAgence(
	codeAgence: string,
	nomAgence: string,
): Promise<void> {
	const body: CreateAgenceDto = { codeAgence, nomAgence };
	return apiService.post<void>(apiRoutes.agences, body);
}

export function updateAgence(
	codeAgence: string,
	nomAgence: string,
): Promise<void> {
	const body: UpdateAgenceDto = { nomAgence };
	return apiService.patch<void>(apiRoutes.agence(codeAgence), body);
}

/** Directions come back with their services nested, sorted by name. */
export function listDirections(): Promise<Direction[]> {
	return apiService.get<Direction[]>(apiRoutes.directions);
}

export function createDirection(
	codeDirection: string,
	nomDirection: string,
): Promise<void> {
	const body: CreateDirectionDto = {
		codeDirection,
		nomDirection,
	};
	return apiService.post<void>(apiRoutes.directions, body);
}

export function updateDirection(
	codeDirection: string,
	nomDirection: string,
): Promise<void> {
	const body: UpdateDirectionDto = { nomDirection };
	return apiService.patch<void>(apiRoutes.direction(codeDirection), body);
}

export function listServices(): Promise<Service[]> {
	return apiService.get<Service[]>(apiRoutes.services);
}

export function listServicesOfDirection(
	codeDirection: string,
): Promise<Service[]> {
	return apiService.get<Service[]>(apiRoutes.directionServices(codeDirection));
}

export function createService(
	codeService: string,
	nomService: string,
	codeDirection: string,
): Promise<void> {
	const body: CreateServiceDto = {
		codeService,
		nomService,
		codeDirection,
	};
	return apiService.post<void>(apiRoutes.services, body);
}

export function updateServiceName(
	codeService: string,
	nomService: string,
): Promise<void> {
	const body: UpdateServiceNomDto = { nomService };
	return apiService.patch<void>(apiRoutes.serviceNom(codeService), body);
}

/**
 * Moves a service to another direction. The backend also rewrites the
 * `structure` of every agent of that service, in the same transaction.
 */
export function moveService(
	codeService: string,
	codeDirection: string,
): Promise<void> {
	const body: UpdateServiceCodeDirectionDto = { codeDirection };
	return apiService.patch<void>(apiRoutes.serviceDirection(codeService), body);
}
