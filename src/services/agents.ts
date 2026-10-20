import { apiRoutes, apiService, imageFormData } from "./api";
import type {
	AgentItem,
	AgentStructureFilter,
	CreateAgentInput,
	UpdateAgentInput,
} from "../types/api";

/** `GET /agent/all` — every agent, sorted by `nom`, `prenom`. */
export function listAgents(): Promise<AgentItem[]> {
	return apiService.get<AgentItem[]>(apiRoutes.agents);
}

/**
 * `GET /agent/all/filtered`.
 *
 * The backend destructures `query.filter` without a guard, so calling it
 * without a filter throws. When no criterion is provided we therefore fall back
 * to the plain listing instead of producing a 500.
 */
export function listAgentsFiltered(
	filter: AgentStructureFilter,
): Promise<AgentItem[]> {
	const criteria = Object.entries(filter).filter(
		([, value]) => value !== undefined && value !== null && value !== "",
	);
	if (criteria.length === 0) {
		return listAgents();
	}
	return apiService.get<AgentItem[]>(apiRoutes.agentsFiltered, {
		params: { filter },
	});
}

/** `GET /agent/search/last-name?value=` — case-insensitive "contains" match. */
export function searchAgentsByLastName(value: string): Promise<AgentItem[]> {
	return apiService.get<AgentItem[]>(apiRoutes.agentSearchLastName, {
		params: { value },
	});
}

/** `GET /agent/search/first-name?value=` — case-insensitive "contains" match. */
export function searchAgentsByFirstName(value: string): Promise<AgentItem[]> {
	return apiService.get<AgentItem[]>(apiRoutes.agentSearchFirstName, {
		params: { value },
	});
}

/**
 * `POST /agent/create/` — creates person + agent + beneficiary in one
 * transaction. The professional card (`image`) is mandatory.
 */
export function createAgent(
	input: CreateAgentInput,
	image: File,
): Promise<void> {
	return apiService.post<void>(
		apiRoutes.agentCreate,
		imageFormData(input as unknown as Record<string, unknown>, image),
	);
}

/** `PATCH /agent/information/:matricule` — partial update, `204`. */
export function updateAgentInformation(
	matricule: string,
	input: UpdateAgentInput,
): Promise<void> {
	return apiService.patch<void>(apiRoutes.agentInformation(matricule), input);
}

/** `PATCH /agent/card/:matricule` — replaces the professional card, `204`. */
export function updateAgentCard(
	matricule: string,
	image: File,
): Promise<void> {
	return apiService.patch<void>(
		apiRoutes.agentCard(matricule),
		imageFormData({}, image),
	);
}

/** `DELETE /agent/:matricule` — cascades to family and beneficiary rows. */
export function deleteAgent(matricule: string): Promise<void> {
	return apiService.delete<void>(apiRoutes.agent(matricule));
}
