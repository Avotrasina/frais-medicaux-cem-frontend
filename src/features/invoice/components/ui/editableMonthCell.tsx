import { useState } from "react";
import { Check, X } from "lucide-react";

type Props = {
	value: Date | null;
	isLocked?: boolean;
	className?: string;
	emptyValue?: string;
	onSave: (value: Date | null) => void;
};

const supportsMonthInput: boolean = (() => {
	if (typeof document === "undefined") return false;
	const input = document.createElement("input");
	input.setAttribute("type", "month");
	return input.type === "month";
})();

const MONTHS = ["janv.", "févr.", "mars", "avr.", "mai", "juin", "juil.", "août", "sept.", "oct.", "nov.", "déc."];

const monthFormatter = new Intl.DateTimeFormat("fr-FR", {
	month: "short",
	year: "2-digit",
	timeZone: "UTC",
});

const isValid = (d: Date | null): d is Date => !!d && !Number.isNaN(d.getTime());

function toMonthInputValue(value: Date | null): string {
	if (!isValid(value)) return "";
	return `${value.getUTCFullYear()}-${String(value.getUTCMonth() + 1).padStart(2, "0")}`;
}

function toMonthDate(value: string): Date | null {
	const match = value.match(/^(\d{4})-(\d{2})$/);
	if (!match) return null;
	return new Date(Date.UTC(Number(match[1]), Number(match[2]) - 1, 1));
}

export default function EditableMonthCell({
	value,
	isLocked = false,
	className = "",
	emptyValue = "",
	onSave,
}: Props) {
	const now = new Date();
	const [editing, setEditing] = useState(false);
	const [draft, setDraft] = useState(toMonthInputValue(value));
	const [month, setMonth] = useState<number>(now.getUTCMonth());
	const [year, setYear] = useState<number>(now.getUTCFullYear());

	const currentYear = now.getUTCFullYear();
	const years = Array.from({ length: 11 }, (_, i) => currentYear - 5 + i);
	if (!years.includes(year)) years.push(year);
	years.sort((a, b) => a - b);

	const startEditing = () => {
		if (isLocked || editing) return;
		if (supportsMonthInput) {
			setDraft(toMonthInputValue(value));
		} else {
			setMonth(isValid(value) ? value.getUTCMonth() : now.getUTCMonth());
			setYear(isValid(value) ? value.getUTCFullYear() : now.getUTCFullYear());
		}
		setEditing(true);
	};

	const commit = () => {
		if (supportsMonthInput) {
			onSave(toMonthDate(draft));
		} else {
			onSave(new Date(Date.UTC(year, month, 1)));
		}
		setEditing(false);
	};

	const cancel = () => setEditing(false);

	const handleKeyDown = (event: React.KeyboardEvent) => {
		if (event.key === "Enter") commit();
		if (event.key === "Escape") cancel();
	};

	const closeIfUnchanged = () => {
		const unchanged = supportsMonthInput
			? draft === toMonthInputValue(value)
			: year === (isValid(value) ? value.getUTCFullYear() : now.getUTCFullYear())
				&& month === (isValid(value) ? value.getUTCMonth() : now.getUTCMonth());
		if (unchanged) setEditing(false);
	};

	const actionButtons = (
		<>
			<button
				type="button"
				className="rounded-lg p-1.5 text-emerald-600 hover:bg-emerald-50"
				aria-label="Valider"
				onClick={(event) => { event.stopPropagation(); commit(); }}
			>
				<Check size={14} />
			</button>
			<button
				type="button"
				className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100"
				aria-label="Annuler"
				onClick={(event) => { event.stopPropagation(); cancel(); }}
			>
				<X size={14} />
			</button>
		</>
	);

	return (
		<td
			className={`relative h-full truncate px-3 text-xs ${isLocked ? "cursor-not-allowed bg-slate-100 text-slate-400" : "cursor-pointer hover:bg-slate-50"} ${className}`}
			onClick={startEditing}
			onMouseLeave={closeIfUnchanged}
		>
			{editing ? (
				supportsMonthInput ? (
					<>
						<input
							autoFocus
							type="month"
							className="h-full w-full pr-14"
							value={draft}
							onChange={(event) => setDraft(event.target.value)}
							onKeyDown={handleKeyDown}
						/>
						<span className="absolute right-1 top-1/2 flex -translate-y-1/2 gap-1">
							{actionButtons}
						</span>
					</>
				) : (
					<div
						className="flex items-center gap-1"
						onClick={(event) => event.stopPropagation()}
						onKeyDown={handleKeyDown}
					>
						<select
							autoFocus
							className="rounded border border-slate-300 bg-white px-1 py-1 text-xs"
							value={month}
							onChange={(event) => setMonth(Number(event.target.value))}
						>
							{MONTHS.map((label, i) => (
								<option key={label} value={i}>{label}</option>
							))}
						</select>
						<select
							className="rounded border border-slate-300 bg-white px-1 py-1 text-xs"
							value={year}
							onChange={(event) => setYear(Number(event.target.value))}
						>
							{years.map((y) => (
								<option key={y} value={y}>{y}</option>
							))}
						</select>
						{actionButtons}
					</div>
				)
			) : isValid(value) ? (
				monthFormatter.format(value)
			) : (
				emptyValue && (
					<span className="absolute inset-0 flex items-center justify-center">{emptyValue}</span>
				)
			)}
		</td>
	);
}