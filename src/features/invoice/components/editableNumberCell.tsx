import { useState } from "react";
import { Check, X } from "lucide-react";

type Props = {
	value: number;
	className?: string;
	isLocked?: boolean;
	placeholder?: string;
	onSave: (value: number) => void;
};

const numericPattern = /^\d*(?:[.,]\d*)?$/;
const numberFormatter = new Intl.NumberFormat("fr-FR", {
	maximumFractionDigits: 0,
});

export default function EditableNumberCell({
	value,
	className = "",
	isLocked = false,
	placeholder,
	onSave,
}: Props) {
	const [editing, setEditing] = useState(false);
	const [draft, setDraft] = useState(String(value));

	const startEditing = () => {
		if (isLocked || editing) return;
		setDraft(String(value));
		setEditing(true);
	};

	const commit = () => {
		if (draft.trim() !== "") {
			const nextValue = Number(draft.replace(",", "."));
			if (Number.isFinite(nextValue)) onSave(nextValue);
		}
		setEditing(false);
	};

	return (
		<td
			className={`relative h-full cursor-pointer truncate px-3 text-xs hover:bg-slate-50 ${className}`}
			onClick={startEditing}
		>
			{editing ? (
				<>
					<input
						autoFocus
						type="text"
						inputMode="decimal"
						className="h-full w-full pr-14 text-right"
						placeholder={placeholder}
						value={draft}
						onChange={(event) => {
							const nextDraft = event.target.value;
							if (numericPattern.test(nextDraft)) setDraft(nextDraft);
						}}
						onKeyDown={(event) => {
							if (event.key === "Enter") commit();
							if (event.key === "Escape") setEditing(false);
						}}
					/>
					<span className="absolute right-1 top-1/2 flex -translate-y-1/2 gap-1">
						<button
							type="button"
							className="rounded-lg p-1.5 text-emerald-600 hover:bg-emerald-50"
							onClick={(event) => {
								event.stopPropagation();
								commit();
							}}
							aria-label="Valider"
						>
							<Check size={14} />
						</button>
						<button
							type="button"
							className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100"
							onClick={(event) => {
								event.stopPropagation();
								setEditing(false);
							}}
							aria-label="Annuler"
						>
							<X size={14} />
						</button>
					</span>
				</>
			) : (
				numberFormatter.format(value)
			)}
		</td>
	);
}
