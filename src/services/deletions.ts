import { apiRoutes, apiService } from "./api";

export type DeletionResource =
	| "agent"
	| "spouse"
	| "child"
	| "provider"
	| "providerCategory"
	| "agentCategory"
	| "location"
	| "agency"
	| "direction"
	| "service";

export interface DeletionRequest {
	id: string;
	resource: DeletionResource;
	resourceId: string | number;
	name: string;
	detail: string;
}

type DeletionCandidate = Record<string, unknown>;

const requestLists: {
	resource: DeletionResource;
	route: string;
}[] = [
	{ resource: "agent", route: apiRoutes.agentDeletionRequests },
	{ resource: "spouse", route: apiRoutes.spouseDeletionRequests },
	{ resource: "child", route: apiRoutes.childDeletionRequests },
	{ resource: "provider", route: apiRoutes.providerDeletionRequests },
	{
		resource: "providerCategory",
		route: apiRoutes.providerCategoryDeletionRequests,
	},
	{
		resource: "agentCategory",
		route: apiRoutes.agentCategoryDeletionRequests,
	},
	{ resource: "location", route: apiRoutes.lieuDeletionRequests },
	{ resource: "agency", route: apiRoutes.agenceDeletionRequests },
	{ resource: "direction", route: apiRoutes.directionDeletionRequests },
	{ resource: "service", route: apiRoutes.serviceDeletionRequests },
];

export async function listDeletionRequests(): Promise<DeletionRequest[]> {
	const results = await Promise.all(
		requestLists.map(async ({ resource, route }) => ({
			resource,
			items: await apiService.get<DeletionCandidate[]>(route),
		})),
	);

	return results
		.flatMap(({ resource, items }) =>
			items.map((item) => toDeletionRequest(resource, item)),
		)
		.sort((left, right) => left.name.localeCompare(right.name, "fr"));
}

export function requestDeletion(
	resource: DeletionResource,
	id: string | number,
): Promise<void> {
	return apiService.delete<void>(deletionRoute(resource, id, "request"));
}

export function validateDeletion(
	resource: DeletionResource,
	id: string | number,
): Promise<void> {
	return apiService.post<void>(deletionRoute(resource, id, "validate"));
}

export function rejectDeletion(
	resource: DeletionResource,
	id: string | number,
): Promise<void> {
	return apiService.post<void>(deletionRoute(resource, id, "reject"));
}

function deletionRoute(
	resource: DeletionResource,
	id: string | number,
	action: "request" | "validate" | "reject",
): string {
	if (resource === "spouse" || resource === "child") {
		const familyType = resource === "spouse" ? "spouses" : "children";
		if (action === "request") return apiRoutes.familyDeletion(familyType, Number(id));
		if (action === "validate")
			return apiRoutes.familyDeletionValidation(familyType, Number(id));
		return apiRoutes.familyDeletionRejection(familyType, Number(id));
	}

	const routes: Record<
		Exclude<DeletionResource, "spouse" | "child">,
		{ request: (id: string | number) => string; validate: (id: string | number) => string; reject: (id: string | number) => string }
	> = {
		agent: {
			request: (value) => apiRoutes.agent(String(value)),
			validate: (value) => apiRoutes.agentDeletionValidation(String(value)),
			reject: (value) => apiRoutes.agentDeletionRejection(String(value)),
		},
		provider: {
			request: (value) => apiRoutes.provider(Number(value)),
			validate: (value) => apiRoutes.providerDeletionValidation(Number(value)),
			reject: (value) => apiRoutes.providerDeletionRejection(Number(value)),
		},
		providerCategory: {
			request: (value) => apiRoutes.providerCategory(Number(value)),
			validate: (value) => apiRoutes.providerCategoryDeletionValidation(Number(value)),
			reject: (value) => apiRoutes.providerCategoryDeletionRejection(Number(value)),
		},
		agentCategory: {
			request: (value) => apiRoutes.agentCategory(Number(value)),
			validate: (value) => apiRoutes.agentCategoryDeletionValidation(Number(value)),
			reject: (value) => apiRoutes.agentCategoryDeletionRejection(Number(value)),
		},
		location: {
			request: (value) => apiRoutes.lieu(Number(value)),
			validate: (value) => apiRoutes.lieuDeletionValidation(Number(value)),
			reject: (value) => apiRoutes.lieuDeletionRejection(Number(value)),
		},
		agency: {
			request: (value) => apiRoutes.agence(String(value)),
			validate: (value) => apiRoutes.agenceDeletionValidation(String(value)),
			reject: (value) => apiRoutes.agenceDeletionRejection(String(value)),
		},
		direction: {
			request: (value) => apiRoutes.direction(String(value)),
			validate: (value) => apiRoutes.directionDeletionValidation(String(value)),
			reject: (value) => apiRoutes.directionDeletionRejection(String(value)),
		},
		service: {
			request: (value) => apiRoutes.service(String(value)),
			validate: (value) => apiRoutes.serviceDeletionValidation(String(value)),
			reject: (value) => apiRoutes.serviceDeletionRejection(String(value)),
		},
	};

	const routesForResource = routes[resource];
	return routesForResource[action](id);
}

function toDeletionRequest(
	resource: DeletionResource,
	item: DeletionCandidate,
): DeletionRequest {
	const nestedAgent =
		typeof item.agent === "object" && item.agent !== null
			? (item.agent as Record<string, unknown>)
			: null;
	const idField =
		resource === "agent"
			? nestedAgent?.matricule
			: resource === "agency"
				? item.codeAgence
				: resource === "direction"
					? item.codeDirection
					: resource === "service"
						? item.codeService
						: item.id;

	if (
		(typeof idField !== "string" && typeof idField !== "number") ||
		String(idField).trim() === ""
	) {
		throw new Error(`Identifiant manquant dans une demande de suppression (${resource}).`);
	}

	const firstName = stringValue(item.prenom);
	const name =
		(resource === "agency" ? stringValue(item.nomAgence) : stringValue(item.nom)) ||
		stringValue(item.codeCategory) ||
		`${resourceLabel(resource)} ${idField}`;
	const detail = [firstName, `#${idField}`].filter(Boolean).join(" · ");

	return {
		id: `${resource}-${idField}`,
		resource,
		resourceId: idField,
		name: firstName ? `${name} ${firstName}` : name,
		detail,
	};
}

function stringValue(value: unknown): string {
	return typeof value === "string" || typeof value === "number"
		? String(value)
		: "";
}

function resourceLabel(resource: DeletionResource): string {
	const labels: Record<DeletionResource, string> = {
		agent: "Agent",
		spouse: "Conjoint",
		child: "Enfant",
		provider: "Prestataire",
		providerCategory: "Catégorie prestataire",
		agentCategory: "Catégorie agent",
		location: "Lieu",
		agency: "Agence",
		direction: "Direction",
		service: "Service",
	};
	return labels[resource];
}
