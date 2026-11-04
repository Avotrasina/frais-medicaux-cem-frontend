import { RotateCcw } from "lucide-react";

type Props = {
	onClick: () => void;
	disabled?: boolean;
	ariaLabel?: string;
	title?: string;
};

export default function CancelRowButton({
	onClick,
	disabled = false,
	ariaLabel = "Annuler les modifications de la ligne",
	title = "Annuler les modifications",
}: Props) {
	return (
		<button
			type="button"
			className="flex h-14 w-14 items-center justify-center rounded-full bg-red-700 text-white shadow-lg transition hover:bg-red-800 focus:outline-none focus:ring-4 focus:ring-red-200 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:text-slate-500"
			aria-label={ariaLabel}
			title={title}
			disabled={disabled}
			onClick={onClick}
		>
			<RotateCcw size={22} strokeWidth={2.4} />
		</button>
	);
}
