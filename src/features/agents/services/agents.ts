import { apiRoutes, apiService, imageFormData } from "../../../services/api";
import type { AgentUpdateDto } from "../../../api/domains/agent";
import type {
	AgentItem,
	AgentStructureFilter,
	CreateAgentInput,
	UpdateAgentInput,
} from "../../../types/api";

/** `GET /agents` — every active agent, sorted by `nom`, `prenom`. */
export function listAgents(): Promise<AgentItem[]> {
	return apiService.get<AgentItem[]>(apiRoutes.agents);
}

/**
 * `GET /agents/search?filter=...`.
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

/** `GET /agents/search/last-name?value=` — case-insensitive "contains" match. */
export function searchAgentsByLastName(value: string): Promise<AgentItem[]> {
	return apiService.get<AgentItem[]>(apiRoutes.agentSearchLastName, {
		params: { value },
	});
}

/** `GET /agents/search/first-name?value=` — case-insensitive "contains" match. */
export function searchAgentsByFirstName(value: string): Promise<AgentItem[]> {
	return apiService.get<AgentItem[]>(apiRoutes.agentSearchFirstName, {
		params: { value },
	});
}

/**
 * `POST /agents` — creates person + agent + beneficiary in one
 * transaction. The professional card (`image`) is mandatory.
 */
export function createAgent(
	input: CreateAgentInput,
	image: File,
): Promise<void> {
	const { codeAgence, codeDirection, ...fields } = input;
	const structureID = codeAgence || codeDirection;
	const multipartFields = {
		...fields,
		...(structureID ? { structureID } : {}),
	};
	return apiService.post<void>(
		apiRoutes.agentCreate,
		imageFormData(multipartFields, image),
	);
}

/** `PATCH /agents/:matricule` — partial update, `204`. */
export function updateAgentInformation(
	matricule: string,
	input: UpdateAgentInput,
): Promise<void> {
	const { codeAgence, codeDirection, ...fields } = input;
	const structureID = codeAgence || codeDirection;
	const body = {
		...fields,
		...(structureID ? { structureID } : {}),
	} satisfies AgentUpdateDto;
	return apiService.patch<void>(apiRoutes.agentInformation(matricule), body);
}

/** `PATCH /agents/:matricule/card` — replaces the professional card, `204`. */
export function updateAgentCard(matricule: string, image: File): Promise<void> {
	return apiService.patch<void>(
		apiRoutes.agentCard(matricule),
		imageFormData({}, image),
	);
}

/** `DELETE /agents/:matricule` — submits a deletion request. */
export function requestAgentDeletion(matricule: string): Promise<void> {
	return apiService.delete<void>(apiRoutes.agent(matricule));
}
