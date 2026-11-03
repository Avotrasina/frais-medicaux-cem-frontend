import { Plus } from "lucide-react";

type Props = {
	onClick: () => void;
	ariaLabel?: string;
	title?: string;
	variant?: "navy" | "red";
};

export default function AddRowButton({
	onClick,
	ariaLabel = "Aller à la ligne d’ajout",
	title = "Aller à la ligne d’ajout",
	variant = "navy",
}: Props) {
	const colorClasses = variant === "red"
		? "bg-red-600 hover:bg-red-700 focus:ring-red-200"
		: "bg-slate-900 hover:bg-slate-800 focus:ring-slate-300";

	return (
		<button
			type="button"
			className={`flex h-14 w-14 items-center justify-center rounded-full text-white shadow-lg transition focus:outline-none focus:ring-4 ${colorClasses}`}
			aria-label={ariaLabel}
			title={title}
			onClick={onClick}
		>
			<Plus size={26} strokeWidth={2.5} />
		</button>
	);
}
