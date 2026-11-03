import { Save } from "lucide-react";

type Props = {
	onClick: () => void;
	disabled?: boolean;
	ariaLabel?: string;
	title?: string;
};

export default function SaveRowButton({
	onClick,
	disabled = false,
	ariaLabel = "Enregistrer la ligne",
	title = "Enregistrer la ligne",
}: Props) {
	return (
		<button
			type="button"
			className="flex h-14 w-14 items-center justify-center rounded-full bg-slate-900 text-white shadow-lg transition hover:bg-slate-800 focus:outline-none focus:ring-4 focus:ring-slate-300 disabled:cursor-not-allowed disabled:bg-blue-700 disabled:text-white disabled:opacity-100"
			aria-label={ariaLabel}
			title={title}
			disabled={disabled}
			onClick={onClick}
		>
			<Save size={23} strokeWidth={2.4} />
		</button>
	);
}
