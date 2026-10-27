import { apiRoutes, apiService } from "./api";
import type {
	Agence,
	AgentCategory,
	Direction,
	Lieu,
	Service,
} from "../types/api";

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
	return apiService.post<Lieu>(apiRoutes.lieux, { nom });
}

export function updateLieu(id: number, nom: string): Promise<Lieu> {
	return apiService.patch<Lieu>(apiRoutes.lieu(id), { nom });
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
	return apiService.post<AgentCategory>(apiRoutes.agentCategories, {
		codeCategory,
	});
}

export function updateAgentCategory(
	id: number,
	codeCategory: string,
): Promise<AgentCategory> {
	return apiService.patch<AgentCategory>(apiRoutes.agentCategory(id), {
		codeCategory,
	});
}

// --- Organisational structure ----------------------------------------------

export function listAgences(): Promise<Agence[]> {
	return apiService.get<Agence[]>(apiRoutes.agences);
}

export function createAgence(
	codeAgence: string,
	nomAgence: string,
): Promise<void> {
	return apiService.post<void>(apiRoutes.agences, { codeAgence, nomAgence });
}

export function updateAgence(
	codeAgence: string,
	nomAgence: string,
): Promise<void> {
	return apiService.patch<void>(apiRoutes.agence(codeAgence), { nomAgence });
}

/** Directions come back with their services nested, sorted by name. */
export function listDirections(): Promise<Direction[]> {
	return apiService.get<Direction[]>(apiRoutes.directions);
}

export function createDirection(
	codeDirection: string,
	nomDirection: string,
): Promise<void> {
	return apiService.post<void>(apiRoutes.directions, {
		codeDirection,
		nomDirection,
	});
}

export function updateDirection(
	codeDirection: string,
	nomDirection: string,
): Promise<void> {
	return apiService.patch<void>(apiRoutes.direction(codeDirection), {
		nomDirection,
	});
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
	return apiService.post<void>(apiRoutes.services, {
		codeService,
		nomService,
		codeDirection,
	});
}

export function updateServiceName(
	codeService: string,
	nomService: string,
): Promise<void> {
	return apiService.patch<void>(apiRoutes.serviceNom(codeService), {
		nomService,
	});
}

/**
 * Moves a service to another direction. The backend also rewrites the
 * `structure` of every agent of that service, in the same transaction.
 */
export function moveService(
	codeService: string,
	codeDirection: string,
): Promise<void> {
	return apiService.patch<void>(apiRoutes.serviceDirection(codeService), {
		codeDirection,
	});
}
