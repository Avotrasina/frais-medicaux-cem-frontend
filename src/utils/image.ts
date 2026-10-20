/**
 * Image rules shared by every upload form.
 * They mirror the backend `ParseFilePipe` documented in `API.md`.
 */

/** MIME types accepted by the backend image pipe. */
export const IMAGE_ACCEPT = "image/jpeg,image/png,image/webp";

/** Maximum image size enforced by the backend (`UPLOAD_MAX_IMAGE_SIZE`). */
export const IMAGE_MAX_BYTES = 2 * 1024 * 1024;

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];

/**
 * Client-side guard mirroring the backend validation, so the user gets an
 * immediate message instead of a 400/413 response.
 * Returns an error message, or `null` when the file is acceptable.
 */
export function validateImageFile(file: File): string | null {
	if (!ALLOWED_TYPES.includes(file.type)) {
		return "Format d'image non pris en charge (JPEG, PNG ou WEBP).";
	}
	if (file.size > IMAGE_MAX_BYTES) {
		return "L'image dépasse la taille maximale de 2 Mo.";
	}
	return null;
}
