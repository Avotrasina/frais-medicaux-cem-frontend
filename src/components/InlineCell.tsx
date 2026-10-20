import { Check, Pencil, X } from "lucide-react";
import { useState } from "react";

/**
 * Table cell that turns into an input on click.
 *
 * `options` switches the editor to a select; without it the value is edited as
 * free text. Enter or the check button commits, Escape or the cross cancels.
 */
export function InlineCell({
	value,
	onSave,
	options,
	disabled = false,
}: {
	value: string;
	onSave: (value: string) => void;
	options?: string[];
	disabled?: boolean;
}) {
	const [editing, setEditing] = useState(false);
	// The draft only exists while editing: it is seeded when the editor opens,
	// so a new `value` from the server is always reflected without an effect.
	const [draft, setDraft] = useState(value);

	const startEditing = () => {
		if (disabled) return;
		setDraft(value);
		setEditing(true);
	};

	const commit = () => {
		onSave(draft);
		setEditing(false);
	};

	if (!editing) {
		return (
			<button
				onClick={startEditing}
				disabled={disabled}
				className="group inline-flex max-w-full items-center gap-2 text-left text-sm text-slate-700 hover:text-slate-950"
			>
				<span className="truncate">{value || "—"}</span>
				{!disabled && (
					<Pencil
						size={13}
						className="shrink-0 text-slate-300 opacity-0 transition group-hover:opacity-100"
					/>
				)}
			</button>
		);
	}

	if (options && options.length > 0) {
		return (
			<div className="flex items-center gap-1">
				<select
					autoFocus
					className="h-8 rounded-lg border border-red-300 px-2 text-xs outline-none"
					value={draft}
					onChange={(event) => setDraft(event.target.value)}
					onKeyDown={(event) => {
						if (event.key === "Enter") commit();
						if (event.key === "Escape") setEditing(false);
					}}
				>
					{options.map((option) => (
						<option key={option} value={option}>
							{option}
						</option>
					))}
				</select>
				<button
					className="rounded-lg p-1.5 text-emerald-600 hover:bg-emerald-50"
					onClick={commit}
					aria-label="Valider"
				>
					<Check size={14} />
				</button>
				<button
					className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100"
					onClick={() => setEditing(false)}
					aria-label="Annuler"
				>
					<X size={14} />
				</button>
			</div>
		);
	}

	return (
		<div className="flex items-center gap-1">
			<input
				autoFocus
				className="h-8 min-w-32 rounded-lg border border-red-300 px-2 text-xs outline-none"
				value={draft}
				onChange={(event) => setDraft(event.target.value)}
				onKeyDown={(event) => {
					if (event.key === "Enter") commit();
					if (event.key === "Escape") setEditing(false);
				}}
			/>
			<button
				className="rounded-lg p-1.5 text-emerald-600 hover:bg-emerald-50"
				onClick={commit}
				aria-label="Valider"
			>
				<Check size={14} />
			</button>
			<button
				className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100"
				onClick={() => setEditing(false)}
				aria-label="Annuler"
			>
				<X size={14} />
			</button>
		</div>
	);
}
