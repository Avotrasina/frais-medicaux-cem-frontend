import { useRef, useState, type ChangeEvent } from "react";
import { createPortal } from "react-dom";
import { Download, FileText, LoaderCircle, Paperclip, Plus, Save, Trash2 } from "lucide-react";
import { Modal } from "../../../../components/ui/Modal";
import type { FactureGlobaleAttachment } from "../../types/invoiceTable";

type InvoiceAttachmentsCellProps = {
	attachments: FactureGlobaleAttachment[];
	readOnly?: boolean;
	disabledMessage?: string;
	onSave: (attachments: FactureGlobaleAttachment[]) => Promise<void>;
};

function formatFileSize(size: number): string {
	if (size < 1024) return `${size} o`;
	if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} Ko`;
	return `${(size / (1024 * 1024)).toFixed(1)} Mo`;
}

function downloadAttachment(attachment: FactureGlobaleAttachment) {
	const url = URL.createObjectURL(attachment.file);
	const link = document.createElement("a");
	link.href = url;
	link.download = attachment.file.name;
	link.click();
	window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export default function InvoiceAttachmentsCell({
	attachments,
	readOnly = false,
	disabledMessage,
	onSave,
}: InvoiceAttachmentsCellProps) {
	const [isOpen, setIsOpen] = useState(false);
	const [draftAttachments, setDraftAttachments] = useState<FactureGlobaleAttachment[]>([]);
	const [uploadError, setUploadError] = useState<string | null>(null);
	const [saveError, setSaveError] = useState<string | null>(null);
	const [isSaving, setIsSaving] = useState(false);
	const fileInputRef = useRef<HTMLInputElement>(null);
	const hasChanges = draftAttachments.length !== attachments.length
		|| draftAttachments.some((attachment, index) => attachment.id !== attachments[index]?.id);

	function closeDialog() {
		if (isSaving) return;
		setIsOpen(false);
		setDraftAttachments([...attachments]);
		setUploadError(null);
		setSaveError(null);
	}

	async function saveAttachments() {
		if (readOnly || !hasChanges || isSaving) return;
		setIsSaving(true);
		setSaveError(null);
		try {
			await onSave(draftAttachments);
			setIsOpen(false);
		} catch (error) {
			setSaveError(error instanceof Error ? error.message : "L’enregistrement des pièces jointes a échoué.");
		} finally {
			setIsSaving(false);
		}
	}

	function addFiles(event: ChangeEvent<HTMLInputElement>) {
		const selectedFiles = Array.from(event.target.files ?? []);
		const validFiles: File[] = [];
		const invalidFiles: string[] = [];

		selectedFiles.forEach((file) => {
			const isPdfExtension = file.name.toLowerCase().endsWith(".pdf");
			const isPdfMimeType = file.type === "" || file.type === "application/pdf" || file.type === "application/octet-stream";
			if (isPdfExtension && isPdfMimeType) {
				validFiles.push(file);
			} else {
				invalidFiles.push(file.name);
			}
		});

		if (validFiles.length > 0) {
			const addedAttachments = validFiles.map((file) => ({
				id: crypto.randomUUID(),
				file,
			}));
			setDraftAttachments((current) => [...current, ...addedAttachments]);
		}

		setUploadError(invalidFiles.length > 0
			? `Seuls les fichiers PDF sont acceptés : ${invalidFiles.join(", ")}.`
			: null);
		setSaveError(null);
		event.target.value = "";
	}

	function removeAttachment(attachmentId: string) {
		setDraftAttachments((current) => current.filter((attachment) => attachment.id !== attachmentId));
		setSaveError(null);
	}

	return (
		<>
			<td className="border border-slate-200 px-2 py-2 w-36 min-w-36 max-w-36">
			{disabledMessage ? (
				<span className="text-xs text-slate-400" title={disabledMessage}>Après création</span>
			) : (
			<button
				type="button"
				disabled={isSaving}
				className="inline-flex max-w-full items-center gap-1.5 rounded-md px-2 py-1 text-xs font-medium text-blue-700 hover:bg-blue-50 disabled:cursor-default disabled:text-slate-600 disabled:hover:bg-transparent"
				onClick={(event) => {
					event.stopPropagation();
					setDraftAttachments([...attachments]);
					setSaveError(null);
					setUploadError(null);
					setIsOpen(true);
				}}
				aria-label={`Gérer les pièces jointes PDF (${attachments.length})`}
			>
				<Paperclip size={14} aria-hidden="true" />
				<span className="truncate">{attachments.length} PDF{attachments.length > 1 ? "s" : ""}</span>
			</button>
			)}
			</td>
			{isOpen && createPortal(<Modal
			open
			title="Pièces jointes de la facture"
			description="Les fichiers PDF sont associés à cette facture."
			onClose={closeDialog}
			width="max-w-2xl"
			>
			<div className="space-y-4" onClick={(event) => event.stopPropagation()}>
				{!readOnly && (
						<>
							<div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-dashed border-slate-300 bg-slate-50 p-4">
								<div>
									<p className="text-sm font-semibold text-slate-800">Ajouter des PDF</p>
									<p className="mt-1 text-xs text-slate-500">Sélectionnez un ou plusieurs fichiers PDF.</p>
								</div>
								<input
									ref={fileInputRef}
									type="file"
									accept="application/pdf,.pdf"
									multiple
									className="sr-only"
									onChange={addFiles}
									aria-label="Sélectionner des fichiers PDF"
								/>
								<button
									type="button"
									className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-3 py-2 text-sm font-semibold text-white hover:bg-blue-700"
									onClick={() => fileInputRef.current?.click()}
								>
									<Plus size={16} aria-hidden="true" />
									Ajouter
								</button>
							</div>
							{uploadError && <p role="alert" className="text-sm text-red-700">{uploadError}</p>}
							<p className="text-xs text-slate-500">
								Enregistrez les pièces jointes ici; cet enregistrement est indépendant de celui de la facture.
							</p>
						</>
					)}

					{draftAttachments.length === 0 ? (
						<p className="rounded-lg bg-slate-50 px-4 py-8 text-center text-sm text-slate-500">
							Aucune pièce jointe pour cette facture.
						</p>
					) : (
						<ul className="divide-y divide-slate-100 rounded-xl border border-slate-200">
							{draftAttachments.map((attachment) => (
								<li key={attachment.id} className="flex items-center gap-3 px-4 py-3">
									<FileText size={18} className="shrink-0 text-red-600" aria-hidden="true" />
									<div className="min-w-0 flex-1">
										<p className="truncate text-sm font-medium text-slate-800" title={attachment.file.name}>
											{attachment.file.name}
										</p>
										<p className="text-xs text-slate-500">{formatFileSize(attachment.file.size)}</p>
									</div>
									<button
										type="button"
										className="rounded-md p-2 text-slate-500 hover:bg-slate-100 hover:text-blue-700"
										onClick={() => downloadAttachment(attachment)}
										aria-label={`Télécharger ${attachment.file.name}`}
										title="Télécharger"
									>
										<Download size={16} aria-hidden="true" />
									</button>
									{!readOnly && (
										<button
											type="button"
											className="rounded-md p-2 text-slate-500 hover:bg-red-50 hover:text-red-700"
											onClick={() => removeAttachment(attachment.id)}
											aria-label={`Retirer ${attachment.file.name}`}
											title="Retirer"
										>
											<Trash2 size={16} aria-hidden="true" />
										</button>
									)}
								</li>
							))}
						</ul>
					)}

					{saveError && <p role="alert" className="text-sm text-red-700">{saveError}</p>}

					<div className="flex justify-end border-t border-slate-100 pt-4">
						<button
							type="button"
							className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
							disabled={isSaving}
							onClick={closeDialog}
						>
							Annuler
						</button>
						{!readOnly && (
							<button
								type="button"
								className="ml-3 inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
								disabled={!hasChanges || isSaving}
								onClick={saveAttachments}
							>
								{isSaving
									? <LoaderCircle size={16} className="animate-spin" aria-hidden="true" />
									: <Save size={16} aria-hidden="true" />}
								{isSaving ? "Enregistrement…" : "Enregistrer les pièces jointes"}
							</button>
						)}
					</div>
				</div>
			</Modal>, document.body)}
		</>
	);
}
