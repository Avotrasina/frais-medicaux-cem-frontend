import { Plus } from "lucide-react";

type Props = {
	onClick: () => void;
	disabled?: boolean;
	ariaLabel?: string;
	title?: string;
};

export default function AddRowButton({
	onClick,
	disabled = false,
	ariaLabel = "Aller à la ligne d’ajout",
	title = "Aller à la ligne d’ajout",
}: Props) {
	return (
		<button
			type="button"
			className="flex h-14 w-14 items-center justify-center rounded-full bg-slate-900 text-white shadow-lg transition hover:bg-slate-800 focus:outline-none focus:ring-4 focus:ring-slate-300 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:text-slate-500 disabled:hover:bg-slate-300"
			aria-label={ariaLabel}
			title={title}
			disabled={disabled}
			onClick={onClick}
		>
			<Plus size={26} strokeWidth={2.5} />
		</button>
	);
}
