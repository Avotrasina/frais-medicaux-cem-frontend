import axios, { type AxiosRequestConfig } from "axios";

/**
 * Base URL of the FM-CEM backend (NestJS).
 * The reference API listens on `http://localhost:3000` by default (env var `PORT`).
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
	agents: "/agent/all",
	agentsFiltered: "/agent/all/filtered",
	agentSearchLastName: "/agent/search/last-name",
	agentSearchFirstName: "/agent/search/first-name",
	/** Trailing slash is part of the documented route. */
	agentCreate: "/agent/create/",
	agentInformation: (matricule: string) =>
		`/agent/information/${encodeURIComponent(matricule)}`,
	agentCard: (matricule: string) =>
		`/agent/card/${encodeURIComponent(matricule)}`,
	agentCardImage: (matricule: string) =>
		`/agent/${encodeURIComponent(matricule)}/card`,
	agent: (matricule: string) => `/agent/${encodeURIComponent(matricule)}`,

	// --- Agent family (spouse / child) --------------------------------------
	family: (matricule: string) =>
		`/agent-family/${encodeURIComponent(matricule)}`,
	conjointCreate: "/agent-family/conjoint",
	conjointInformations: (id: number) =>
		`/agent-family/conjoint/informations/${id}`,
	conjointCard: (id: number) => `/agent-family/conjoint/card/${id}`,
	enfantCreate: "/agent-family/enfant",
	enfantInformations: (id: number) => `/agent-family/enfant/informations/${id}`,
	enfantCard: (id: number) => `/agent-family/enfant/card/${id}`,
	agentFamilyCard: (id: number) => `/agent-family/card/${id}`,

	// --- Beneficiaries (IDP) ------------------------------------------------
	beneficiariesByMatricule: (matricule: string) =>
		`/beneficiaries/matricule/${encodeURIComponent(matricule)}`,
	beneficiaryByIdp: (idp: string) =>
		`/beneficiaries/idp/${encodeURIComponent(idp)}`,
	beneficiaryObservation: (idp: string) =>
		`/beneficiaries/idp/${encodeURIComponent(idp)}/observation`,

	// --- Organisational structure -------------------------------------------
	agences: "/structure-organisationnelle/agences",
	agence: (codeAgence: string) =>
		`/structure-organisationnelle/agences/${encodeURIComponent(codeAgence)}`,
	directions: "/structure-organisationnelle/directions",
	direction: (codeDirection: string) =>
		`/structure-organisationnelle/directions/${encodeURIComponent(codeDirection)}`,
	directionServices: (codeDirection: string) =>
		`/structure-organisationnelle/directions/${encodeURIComponent(codeDirection)}/services`,
	services: "/structure-organisationnelle/services",
	serviceNom: (codeService: string) =>
		`/structure-organisationnelle/services/${encodeURIComponent(codeService)}/nom`,
	serviceDirection: (codeService: string) =>
		`/structure-organisationnelle/services/${encodeURIComponent(codeService)}/direction`,

	// --- Locations ----------------------------------------------------------
	lieux: "/lieux",
	lieu: (id: number) => `/lieux/${id}`,

	// --- Providers ----------------------------------------------------------
	providers: "/providers",
	providersFilter: "/providers/filter",
	provider: (id: number) => `/providers/${id}`,
	providerCategories: "/provider-categories",
	providerCategory: (id: number) => `/provider-categories/${id}`,

	// --- Agent categories ---------------------------------------------------
	agentCategories: "/agent-categories",
	agentCategory: (id: number) => `/agent-categories/${id}`,

	// --- Attestations -------------------------------------------------------
	attestationCreate: "/attestation/create/",
	pendingAttestations: "/attestation/pending/",
	approveAttestation: (id: number) => `/attestation/approve/${id}`,
	rejectAttestation: (id: number) => `/attestation/reject/${id}`,
	attestationPreview: (id: number) => `/attestation/preview/${id}`,
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
	fields: Record<string, unknown> = {},
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
