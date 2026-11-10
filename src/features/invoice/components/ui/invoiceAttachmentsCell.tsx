import { useRef, useState, type ChangeEvent } from "react";
import { createPortal } from "react-dom";
import { Download, FileText, LoaderCircle, Paperclip, Plus, Trash2 } from "lucide-react";
import { Modal } from "../../../../components/ui/Modal";
import type { FactureGlobaleAttachment } from "../../types/invoiceTable";

const MAX_FILE_SIZE = 10 * 1024 * 1024;
const MAX_ATTACHMENTS = 20;
const ACCEPTED_EXTENSIONS = /\.(pdf|jpe?g|png)$/i;
const ACCEPTED_MIME_TYPES = new Set(["application/pdf", "image/jpeg", "image/png"]);

type InvoiceAttachmentsCellProps = {
	attachments: FactureGlobaleAttachment[];
	readOnly?: boolean;
	disabledMessage?: string;
	onAdd: (file: File) => Promise<void>;
	onRemove: (attachmentId: string) => Promise<void>;
	onDownload: (attachmentId: string) => Promise<Blob>;
};

function formatFileSize(size: number): string {
	if (size < 1024) return `${size} o`;
	if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} Ko`;
	return `${(size / (1024 * 1024)).toFixed(1)} Mo`;
}

function isAcceptedFile(file: File): boolean {
	return ACCEPTED_MIME_TYPES.has(file.type) || ACCEPTED_EXTENSIONS.test(file.name);
}

function downloadBlob(blob: Blob, fileName: string) {
	const url = URL.createObjectURL(blob);
	const link = document.createElement("a");
	link.href = url;
	link.download = fileName;
	link.click();
	window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function toErrorMessage(error: unknown, fallback: string): string {
	return error instanceof Error ? error.message : fallback;
}

export default function InvoiceAttachmentsCell({
	attachments,
	readOnly = false,
	disabledMessage,
	onAdd,
	onRemove,
	onDownload,
}: InvoiceAttachmentsCellProps) {
	const [isOpen, setIsOpen] = useState(false);
	const [isUploading, setIsUploading] = useState(false);
	const [removingId, setRemovingId] = useState<string | null>(null);
	const [downloadingId, setDownloadingId] = useState<string | null>(null);
	const [error, setError] = useState<string | null>(null);
	const fileInputRef = useRef<HTMLInputElement>(null);
	const isBusy = isUploading || removingId !== null;

	function closeDialog() {
		if (isBusy) return;
		setIsOpen(false);
		setError(null);
	}

	async function addFiles(event: ChangeEvent<HTMLInputElement>) {
		const selectedFiles = Array.from(event.target.files ?? []);
		event.target.value = "";
		if (selectedFiles.length === 0) return;

		const available = MAX_ATTACHMENTS - attachments.length;
		const validFiles: File[] = [];
		const errors: string[] = [];

		selectedFiles.forEach((file) => {
			if (!isAcceptedFile(file)) {
				errors.push(`${file.name} : seuls les PDF, JPEG et PNG sont acceptés.`);
				return;
			}
			if (file.size > MAX_FILE_SIZE) {
				errors.push(`${file.name} : le fichier dépasse 10 Mo.`);
				return;
			}
			if (validFiles.length >= available) {
				errors.push(`Une facture ne peut pas contenir plus de ${MAX_ATTACHMENTS} pièces jointes.`);
				return;
			}
			validFiles.push(file);
		});

		if (validFiles.length === 0) {
			setError(errors.join(" "));
			return;
		}

		setIsUploading(true);
		setError(null);
		try {
			for (const file of validFiles) {
				await onAdd(file);
			}
		} catch (uploadError) {
			errors.push(toErrorMessage(uploadError, "L’ajout de la pièce jointe a échoué."));
		} finally {
			setIsUploading(false);
			setError(errors.length > 0 ? errors.join(" ") : null);
		}
	}

	async function removeAttachment(attachmentId: string) {
		setRemovingId(attachmentId);
		setError(null);
		try {
			await onRemove(attachmentId);
		} catch (removeError) {
			setError(toErrorMessage(removeError, "La suppression de la pièce jointe a échoué."));
		} finally {
			setRemovingId(null);
		}
	}

	async function downloadAttachment(attachment: FactureGlobaleAttachment) {
		setDownloadingId(attachment.id);
		setError(null);
		try {
			downloadBlob(await onDownload(attachment.id), attachment.nom);
		} catch (downloadError) {
			setError(toErrorMessage(downloadError, "Le téléchargement de la pièce jointe a échoué."));
		} finally {
			setDownloadingId(null);
		}
	}

	return (
		<>
			<td className="border border-slate-200 px-2 py-2 w-36 min-w-36 max-w-36">
			{disabledMessage ? (
				<span className="text-xs text-slate-400" title={disabledMessage}>Après création</span>
			) : (
			<button
				type="button"
				disabled={isBusy}
				className="inline-flex max-w-full items-center gap-1.5 rounded-md px-2 py-1 text-xs font-medium text-blue-700 hover:bg-blue-50 disabled:cursor-default disabled:text-slate-600 disabled:hover:bg-transparent"
				onClick={(event) => {
					event.stopPropagation();
					setError(null);
					setIsOpen(true);
				}}
				aria-label={`Gérer les pièces jointes (${attachments.length})`}
			>
				<Paperclip size={14} aria-hidden="true" />
				<span className="truncate">{attachments.length} PJ</span>
			</button>
			)}
			</td>
			{isOpen && createPortal(<Modal
			open
			title="Pièces jointes de la facture"
			description="Les fichiers sont associés à cette facture."
			onClose={closeDialog}
			width="max-w-2xl"
			>
			<div className="space-y-4" onClick={(event) => event.stopPropagation()}>
				{!readOnly && (
						<>
							<div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-dashed border-slate-300 bg-slate-50 p-4">
								<div>
									<p className="text-sm font-semibold text-slate-800">Ajouter des fichiers</p>
									<p className="mt-1 text-xs text-slate-500">PDF, JPEG ou PNG, 10 Mo maximum par fichier.</p>
								</div>
								<input
									ref={fileInputRef}
									type="file"
									accept="application/pdf,.pdf,image/jpeg,.jpg,.jpeg,image/png,.png"
									multiple
									className="sr-only"
									onChange={addFiles}
									aria-label="Sélectionner des pièces jointes"
								/>
								<button
									type="button"
									className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-3 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
									disabled={isUploading || attachments.length >= MAX_ATTACHMENTS}
									onClick={() => fileInputRef.current?.click()}
								>
									{isUploading
										? <LoaderCircle size={16} className="animate-spin" aria-hidden="true" />
										: <Plus size={16} aria-hidden="true" />}
									{isUploading ? "Envoi…" : "Ajouter"}
								</button>
							</div>
							{error && <p role="alert" className="text-sm text-red-700">{error}</p>}
							<p className="text-xs text-slate-500">
								{attachments.length} / {MAX_ATTACHMENTS} pièces jointes. Les ajouts et suppressions sont enregistrés immédiatement.
							</p>
						</>
					)}

					{attachments.length === 0 ? (
						<p className="rounded-lg bg-slate-50 px-4 py-8 text-center text-sm text-slate-500">
							Aucune pièce jointe pour cette facture.
						</p>
					) : (
						<ul className="divide-y divide-slate-100 rounded-xl border border-slate-200">
							{attachments.map((attachment) => (
								<li key={attachment.id} className="flex items-center gap-3 px-4 py-3">
									<FileText size={18} className="shrink-0 text-red-600" aria-hidden="true" />
									<div className="min-w-0 flex-1">
										<p className="truncate text-sm font-medium text-slate-800" title={attachment.nom}>
											{attachment.nom}
										</p>
										<p className="text-xs text-slate-500">{formatFileSize(attachment.taille)}</p>
									</div>
									<button
										type="button"
										className="rounded-md p-2 text-slate-500 hover:bg-slate-100 hover:text-blue-700 disabled:cursor-default disabled:opacity-50"
										onClick={() => downloadAttachment(attachment)}
										disabled={downloadingId === attachment.id}
										aria-label={`Télécharger ${attachment.nom}`}
										title="Télécharger"
									>
										{downloadingId === attachment.id
											? <LoaderCircle size={16} className="animate-spin" aria-hidden="true" />
											: <Download size={16} aria-hidden="true" />}
									</button>
									{!readOnly && (
										<button
											type="button"
											className="rounded-md p-2 text-slate-500 hover:bg-red-50 hover:text-red-700 disabled:cursor-default disabled:opacity-50"
											onClick={() => removeAttachment(attachment.id)}
											disabled={removingId === attachment.id}
											aria-label={`Supprimer ${attachment.nom}`}
											title="Supprimer"
										>
											{removingId === attachment.id
												? <LoaderCircle size={16} className="animate-spin" aria-hidden="true" />
												: <Trash2 size={16} aria-hidden="true" />}
										</button>
									)}
								</li>
							))}
						</ul>
					)}

					{readOnly && error && <p role="alert" className="text-sm text-red-700">{error}</p>}

					<div className="flex justify-end border-t border-slate-100 pt-4">
						<button
							type="button"
							className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
							disabled={isBusy}
							onClick={closeDialog}
						>
							Fermer
						</button>
					</div>
				</div>
			</Modal>, document.body)}
		</>
	);
}
