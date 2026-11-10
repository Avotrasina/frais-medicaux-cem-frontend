import type { FacturePaths } from "../../../api/domains/facture";
import { apiService } from "../../../services/api";
import {
	type BodyOf,
	fillPath,
	type QueryOf,
	type ResponseOf,
} from "../../../services/api-contract";

const ROUTES = {
	list: "/factures",
	detail: "/factures/{id}",
	attachments: "/factures/{id}/pieces-jointes",
	attachment: "/factures/{id}/pieces-jointes/{pieceId}",
} as const satisfies Record<string, keyof FacturePaths>;

export type FactureListQuery = QueryOf<FacturePaths, typeof ROUTES.list, "get">;

export type FactureListResponse = ResponseOf<
	FacturePaths,
	typeof ROUTES.list,
	"get"
>;
export type FactureDetailResponse = ResponseOf<
	FacturePaths,
	typeof ROUTES.detail,
	"get"
>;
export type CreateFactureBody = BodyOf<
	FacturePaths,
	typeof ROUTES.list,
	"post"
>;
export type CreateFactureResponse = ResponseOf<
	FacturePaths,
	typeof ROUTES.list,
	"post"
>;
export type UpdateFactureBody = BodyOf<
	FacturePaths,
	typeof ROUTES.detail,
	"patch"
>;
export type UpdateFactureResponse = ResponseOf<
	FacturePaths,
	typeof ROUTES.detail,
	"patch"
>;
export type FactureAttachmentResponse = ResponseOf<
	FacturePaths,
	typeof ROUTES.attachments,
	"post"
>;

export const getFactures = (
	query?: FactureListQuery,
): Promise<FactureListResponse> =>
	apiService.get<FactureListResponse>(ROUTES.list, { params: query });

export const getFacture = (id: number): Promise<FactureDetailResponse> =>
	apiService.get<FactureDetailResponse>(fillPath(ROUTES.detail, { id }));

export const createFacture = (
	body: CreateFactureBody,
): Promise<CreateFactureResponse> =>
	apiService.post<CreateFactureResponse>(ROUTES.list, body);

export const updateFacture = (
	id: number,
	body: UpdateFactureBody,
): Promise<UpdateFactureResponse> =>
	apiService.patch<UpdateFactureResponse>(
		fillPath(ROUTES.detail, { id }),
		body,
	);

/**
 * Uploads one file as `multipart/form-data`.
 *
 * `Content-Type` is intentionally not set: axios adds the multipart boundary.
 */
export const uploadFactureAttachment = (
	id: number,
	file: File,
): Promise<FactureAttachmentResponse> => {
	const body = new FormData();
	body.append("fichier", file);
	return apiService.post<FactureAttachmentResponse>(
		fillPath(ROUTES.attachments, { id }),
		body,
	);
};

export const deleteFactureAttachment = (
	id: number,
	pieceId: number,
): Promise<void> =>
	apiService.delete<void>(fillPath(ROUTES.attachment, { id, pieceId }));

export const downloadFactureAttachment = (
	id: number,
	pieceId: number,
): Promise<Blob> =>
	apiService.get<Blob>(fillPath(ROUTES.attachment, { id, pieceId }), {
		responseType: "blob",
	});