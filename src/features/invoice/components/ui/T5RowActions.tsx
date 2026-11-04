import { useState } from "react";
import { CancelRowButton, ConfirmDialog, SaveRowButton } from "../../../../components/ui";

type Props = {
	canSave: boolean;
	hasActiveRow: boolean;
	isSaving: boolean;
	onSave: () => Promise<boolean>;
	onReset: () => void;
};

export default function T5RowActions({
	canSave,
	hasActiveRow,
	isSaving,
	onSave,
	onReset,
}: Props) {
	const [isConfirmationOpen, setIsConfirmationOpen] = useState(false);

	return (
		<>
			<ConfirmDialog
				open={isConfirmationOpen}
				title="Confirmer l’enregistrement"
				confirmLabel="Enregistrer"
				confirmDisabled={isSaving}
				variant="primary"
				message="Voulez-vous vraiment enregistrer les modifications de cette ligne T5 ?"
				onCancel={() => setIsConfirmationOpen(false)}
				onConfirm={async () => {
					const saved = await onSave();
					if (saved) setIsConfirmationOpen(false);
				}}
			/>
			<div className="fixed bottom-12 right-8 z-20 flex items-center gap-3">
				<CancelRowButton
					ariaLabel="Réinitialiser la ligne T5 active"
					title="Réinitialiser la ligne T5 active"
					disabled={!hasActiveRow || isSaving}
					onClick={onReset}
				/>
				<SaveRowButton
					ariaLabel="Enregistrer la ligne T5 active"
					title="Enregistrer la ligne T5 active"
					disabled={!canSave || isSaving}
					onClick={() => setIsConfirmationOpen(true)}
				/>
			</div>
		</>
	);
}
