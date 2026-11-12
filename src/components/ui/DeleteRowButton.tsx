import { Trash2 } from "lucide-react";

type Props = {
	onClick: () => void;
	disabled?: boolean;
	ariaLabel?: string;
	title?: string;
};

export default function DeleteRowButton({
	onClick,
	disabled = false,
	ariaLabel = "Supprimer la ligne",
	title = "Supprimer la ligne",
}: Props) {
	return (
		<button
			type="button"
			className="flex h-14 w-14 items-center justify-center rounded-full bg-red-600 text-white shadow-lg transition hover:bg-red-700 focus:outline-none focus:ring-4 focus:ring-red-200 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:text-slate-500"
			aria-label={ariaLabel}
			title={title}
			disabled={disabled}
			onClick={onClick}
		>
			<Trash2 size={22} strokeWidth={2.4} />
		</button>
	);
}
