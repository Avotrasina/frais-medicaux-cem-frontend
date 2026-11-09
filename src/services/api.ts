import axios, { type AxiosRequestConfig } from "axios";

/**
 * Base URL of the FM-CEM backend (NestJS).
 * The API listens on `http://localhost:3000` by default (env var `PORT`).
 * Configure it in `.env`:
 *
 *   VITE_API_BASE_URL=http://localhost:3000
 */
export const API_BASE_URL: string =
	import.meta.env.VITE_API_BASE_URL ??
	import.meta.env.VITE_API_URL ??
	"http://localhost:3000";

/** Shared axios instance. Every HTTP call of the application goes through it. */
export const api = axios.create({
	baseURL: API_BASE_URL,
	headers: { Accept: "application/json" },
});

let apiToken: string | null = null;
let unauthorizedHandler: (() => void) | null = null;

/**
 * Adds a bearer token to every request. The documented branch is not protected,
 * so no token is sent until this function is called.
 */
export function setApiToken(token: string | null): void {
	apiToken = token;
}

/** Registers a global reaction to a `401` response (sign-out, redirect...). */
export function setUnauthorizedHandler(handler: (() => void) | null): void {
	unauthorizedHandler = handler;
}

api.interceptors.request.use((config) => {
	if (apiToken) {
		config.headers.Authorization = `Bearer ${apiToken}`;
	}
	// `Content-Type` is never set by hand for FormData: axios inserts the
	// multipart boundary itself. Setting it manually breaks the upload.
	return config;
});

/** Normalised API failure: always exposes a readable French `message`. */
export class ApiError extends Error {
	readonly status: number | null;
	readonly data: unknown;
	readonly method?: string;
	readonly url?: string;

	constructor(
		status: number | null,
		message: string,
		data: unknown = null,
		method?: string,
		url?: string,
	) {
		super(message);
		this.name = "ApiError";
		this.status = status;
		this.data = data;
		this.method = method;
		this.url = url;
	}

	get isNotFound(): boolean {
		return this.status === 404;
	}

	get isConflict(): boolean {
		return this.status === 409;
	}

	/** No HTTP response at all: the backend is down or unreachable. */
	get isNetworkError(): boolean {
		return this.status === null;
	}
}

const STATUS_MESSAGES: Record<number, string> = {
	400: "Requête invalide : vérifiez les champs saisis.",
	401: "Session expirée ou requête non autorisée.",
	403: "Accès refusé.",
	404: "Élément introuvable.",
	409: "Conflit : cet enregistrement existe déjà ou est encore utilisé.",
	413: "Fichier trop volumineux (2 Mo maximum).",
	422: "Données refusées par le serveur.",
	500: "Erreur interne du serveur. Réessayez ou contactez l'administrateur.",
	502: "Passerelle indisponible.",
	503: "Service indisponible.",
};

/** Generic NestJS phrases: our own label is more useful to the end user. */
const GENERIC_MESSAGES = new Set([
	"internal server error",
	"bad request",
	"not found",
	"conflict",
	"unprocessable entity",
	"request entity too large",
	"payload too large",
	"service unavailable",
	"error",
]);

function extractServerMessage(data: unknown): string | null {
	if (!data) return null;
	if (typeof data === "string") return data.trim() || null;
	if (typeof data === "object" && data !== null && "message" in data) {
		const raw = (data as { message: unknown }).message;
		if (Array.isArray(raw)) {
			const joined = raw.filter((item) => typeof item === "string").join(", ");
			return joined.trim() || null;
		}
		if (typeof raw === "string") return raw.trim() || null;
	}
	return null;
}

function normalizeError(error: unknown): ApiError {
	const response = axios.isAxiosError(error) ? error.response : undefined;
	const config = axios.isAxiosError(error) ? error.config : undefined;
	const status = response?.status ?? null;
	const data = response?.data ?? null;
	const method = config?.method?.toUpperCase();
	const url = config?.url;

	if (status === null) {
		return new ApiError(
			null,
			"Impossible de joindre le serveur. Vérifiez que l'API est démarrée et accessible.",
			data,
			method,
			url,
		);
	}

	// 5xx responses can leak database internals: never forward them to the user.
	const serverMessage = status < 500 ? extractServerMessage(data) : null;
	const fallback = STATUS_MESSAGES[status] ?? `Erreur serveur (${status}).`;
	const message =
		serverMessage && !GENERIC_MESSAGES.has(serverMessage.toLowerCase())
			? serverMessage
			: fallback;

	return new ApiError(status, message, data, method, url);
}

api.interceptors.response.use(
	(response) => response,
	(error: unknown) => {
		if (!axios.isAxiosError(error)) {
			return Promise.reject(error);
		}
		const normalized = normalizeError(error);
		if (normalized.status === 401) {
			unauthorizedHandler?.();
		}
		console.error(
			"[API]",
			normalized.method,
			normalized.url,
			normalized.status,
			normalized.message,
		);
		return Promise.reject(normalized);
	},
);

/**
 * Route table of the backend API endpoints consumed by the frontend.
 * Path-builders keep the identifiers encoded, so codes containing spaces
 * (agency codes such as `CEM 001`) stay valid.
 */
export const apiRoutes = {
	// --- Agents -------------------------------------------------------------
	agents: "/agents",
	agentsFiltered: "/agents/search",
	agentSearchLastName: "/agents/search/last-name",
	agentSearchFirstName: "/agents/search/first-name",
	agentCreate: "/agents",
	agentInformation: (matricule: string) =>
		`/agents/${encodeURIComponent(matricule)}`,
	agentCard: (matricule: string) =>
		`/agents/${encodeURIComponent(matricule)}/card`,
	agentCardImage: (matricule: string) =>
		`/agents/${encodeURIComponent(matricule)}/card`,
	agent: (matricule: string) => `/agents/${encodeURIComponent(matricule)}`,
	agentDeletionRequests: "/agents/deletion-requests",
	agentDeletionValidation: (matricule: string) =>
		`/agents/${encodeURIComponent(matricule)}/deletion-validation`,
	agentDeletionRejection: (matricule: string) =>
		`/agents/${encodeURIComponent(matricule)}/deletion-rejection`,

	// --- Agent family (spouse / child) --------------------------------------
	family: (matricule: string) =>
		`/agent-families/agents/${encodeURIComponent(matricule)}`,
	conjointCreate: "/agent-families/spouses",
	conjointInformations: (id: number) => `/agent-families/spouses/${id}`,
	conjointCard: (id: number) => `/agent-families/spouses/${id}/card`,
	enfantCreate: "/agent-families/children",
	enfantInformations: (id: number) => `/agent-families/children/${id}`,
	enfantCard: (id: number) => `/agent-families/children/${id}/card`,
	agentFamilyCard: (id: number) => `/agent-families/family-members/${id}/card`,
	familyDeletion: (type: "spouses" | "children", id: number) =>
		`/agent-families/${type}/${id}`,
	spouseDeletionRequests: "/agent-families/spouses/deletion-requests",
	childDeletionRequests: "/agent-families/children/deletion-requests",
	familyDeletionValidation: (type: "spouses" | "children", id: number) =>
		`/agent-families/${type}/${id}/deletion-validation`,
	familyDeletionRejection: (type: "spouses" | "children", id: number) =>
		`/agent-families/${type}/${id}/deletion-rejection`,

	// --- Beneficiaries (IDP) ------------------------------------------------
	beneficiariesByMatricule: (matricule: string) =>
		`/beneficiaries/by-matricule/${encodeURIComponent(matricule)}`,
	beneficiaryByIdp: (idp: string) =>
		`/beneficiaries/${encodeURIComponent(idp)}`,
	beneficiaryObservation: (idp: string) =>
		`/beneficiaries/${encodeURIComponent(idp)}/observation`,

	// --- Organisational structure -------------------------------------------
	agences: "/organizational-structures/agencies",
	agence: (codeAgence: string) =>
		`/organizational-structures/agencies/${encodeURIComponent(codeAgence)}`,
	agenceDeletionRequests:
		"/organizational-structures/agencies/deletion-requests",
	agenceDeletionValidation: (code: string) =>
		`/organizational-structures/agencies/${encodeURIComponent(code)}/deletion-validation`,
	agenceDeletionRejection: (code: string) =>
		`/organizational-structures/agencies/${encodeURIComponent(code)}/deletion-rejection`,
	directions: "/organizational-structures/directions",
	direction: (codeDirection: string) =>
		`/organizational-structures/directions/${encodeURIComponent(codeDirection)}`,
	directionDeletionRequests:
		"/organizational-structures/directions/deletion-requests",
	directionDeletionValidation: (code: string) =>
		`/organizational-structures/directions/${encodeURIComponent(code)}/deletion-validation`,
	directionDeletionRejection: (code: string) =>
		`/organizational-structures/directions/${encodeURIComponent(code)}/deletion-rejection`,
	directionServices: (codeDirection: string) =>
		`/organizational-structures/directions/${encodeURIComponent(codeDirection)}/services`,
	services: "/organizational-structures/services",
	serviceDeletionRequests:
		"/organizational-structures/services/deletion-requests",
	serviceDeletionValidation: (code: string) =>
		`/organizational-structures/services/${encodeURIComponent(code)}/deletion-validation`,
	serviceDeletionRejection: (code: string) =>
		`/organizational-structures/services/${encodeURIComponent(code)}/deletion-rejection`,
	service: (codeService: string) =>
		`/organizational-structures/services/${encodeURIComponent(codeService)}`,
	serviceNom: (codeService: string) =>
		`/organizational-structures/services/${encodeURIComponent(codeService)}/name`,
	serviceDirection: (codeService: string) =>
		`/organizational-structures/services/${encodeURIComponent(codeService)}/direction`,

	// --- Locations ----------------------------------------------------------
	lieux: "/locations",
	lieu: (id: number) => `/locations/${id}`,
	lieuDeletionRequests: "/locations/deletion-requests",
	lieuDeletionValidation: (id: number) =>
		`/locations/${id}/deletion-validation`,
	lieuDeletionRejection: (id: number) => `/locations/${id}/deletion-rejection`,

	// --- Providers ----------------------------------------------------------
	providers: "/providers",
	providersFilter: "/providers/search",
	provider: (id: number) => `/providers/${id}`,
	providerConvention: (id: number) => `/providers/${id}/convention`,
	providerDeletionRequests: "/providers/deletion-requests",
	providerDeletionValidation: (id: number) =>
		`/providers/${id}/deletion-validation`,
	providerDeletionRejection: (id: number) =>
		`/providers/${id}/deletion-rejection`,
	providerCategories: "/provider-categories",
	providerCategory: (id: number) => `/provider-categories/${id}`,
	providerCategoryDeletionRequests: "/provider-categories/deletion-requests",
	providerCategoryDeletionValidation: (id: number) =>
		`/provider-categories/${id}/deletion-validation`,
	providerCategoryDeletionRejection: (id: number) =>
		`/provider-categories/${id}/deletion-rejection`,

	// --- Agent categories ---------------------------------------------------
	agentCategories: "/agent-categories",
	agentCategory: (id: number) => `/agent-categories/${id}`,
	agentCategoryDeletionRequests: "/agent-categories/deletion-requests",
	agentCategoryDeletionValidation: (id: number) =>
		`/agent-categories/${id}/deletion-validation`,
	agentCategoryDeletionRejection: (id: number) =>
		`/agent-categories/${id}/deletion-rejection`,

	// --- Attestations -------------------------------------------------------
	attestationCreate: "/attestations",
	attestations: "/attestations",
	approveAttestation: (id: number) => `/attestations/${id}/approval`,
	rejectAttestation: (id: number) => `/attestations/${id}/rejection`,
	attestationPreview: (id: number) => `/attestations/${id}/preview`,
};

/** Thin helpers that resolve directly to the response body. */
export const apiService = {
	get: <T>(url: string, config?: AxiosRequestConfig): Promise<T> =>
		api.get<T>(url, config).then((response) => response.data),

	post: <T>(
		url: string,
		body?: unknown,
		config?: AxiosRequestConfig,
	): Promise<T> =>
		api.post<T>(url, body, config).then((response) => response.data),

	put: <T>(
		url: string,
		body?: unknown,
		config?: AxiosRequestConfig,
	): Promise<T> =>
		api.put<T>(url, body, config).then((response) => response.data),

	patch: <T>(
		url: string,
		body?: unknown,
		config?: AxiosRequestConfig,
	): Promise<T> =>
		api.patch<T>(url, body, config).then((response) => response.data),

	delete: <T>(url: string, config?: AxiosRequestConfig): Promise<T> =>
		api.delete<T>(url, config).then((response) => response.data),
};

/**
 * Builds a multipart body for the image endpoints.
 * Empty values are skipped, so optional fields are simply not sent.
 * The file is attached under the documented field name `image`.
 */
export function imageFormData(
	fields: object = {},
	image?: File | null,
	fieldName = "image",
): FormData {
	const form = new FormData();
	for (const [key, value] of Object.entries(fields)) {
		if (value === undefined || value === null || value === "") continue;
		if (value instanceof Blob) {
			form.append(key, value);
		} else {
			form.append(key, String(value));
		}
	}
	if (image) {
		form.append(fieldName, image);
	}
	return form;
}

export function resolveAgentCardUrl(matricule: string): string {
	return `${API_BASE_URL.replace(/\/+$/, "")}${apiRoutes.agentCardImage(matricule)}`;
}

export function resolveFamilyCardUrl(id: number): string {
	return `${API_BASE_URL.replace(/\/+$/, "")}${apiRoutes.agentFamilyCard(id)}`;
}

export function resolveProviderConventionUrl(id: number): string {
	return `${API_BASE_URL.replace(/\/+$/, "")}${apiRoutes.providerConvention(id)}`;
}
