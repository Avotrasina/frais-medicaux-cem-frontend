import type { FactureGlobaleAttachment } from "../types/invoiceTable";

const attachmentsByFactureId = new Map<number, FactureGlobaleAttachment[]>();

export function getFactureAttachmentsMock(factureId: number): FactureGlobaleAttachment[] {
	return [...(attachmentsByFactureId.get(factureId) ?? [])];
}

export async function saveFactureAttachmentsMock(
	factureId: number,
	attachments: FactureGlobaleAttachment[],
): Promise<void> {
	await Promise.resolve();
	attachmentsByFactureId.set(factureId, [...attachments]);
}
