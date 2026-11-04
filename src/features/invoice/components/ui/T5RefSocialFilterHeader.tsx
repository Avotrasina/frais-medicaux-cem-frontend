import { useState } from "react";
import { X } from "lucide-react";

type Props = {
	label: string;
	width: string;
	value: string;
	onChange: (value: string) => void;
};

export default function T5RefSocialFilterHeader({ label, width, value, onChange }: Props) {
	const [isOpen, setIsOpen] = useState(false);

	return (
		<th
			className={`relative border border-slate-700 px-3 py-3 text-left text-[10px] font-extrabold uppercase tracking-wide ${width} cursor-pointer ${isOpen ? "z-30" : ""}`}
			onMouseEnter={() => setIsOpen(true)}
			onMouseLeave={() => setIsOpen(false)}
			aria-expanded={isOpen}
		>
			<span className="block w-full text-left">{label}</span>
			{isOpen && (
				<div
					className="absolute left-0 top-full z-40 w-64 rounded-b-lg border border-slate-200 bg-white p-3 text-slate-800 shadow-xl normal-case"
					onClick={(event) => event.stopPropagation()}
				>
					<input
						autoFocus
						type="search"
						placeholder={`Rechercher ${label.toLocaleLowerCase()}…`}
						value={value}
						className="w-full rounded-md border border-slate-300 px-3 py-2 text-xs font-normal normal-case outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
						onChange={(event) => onChange(event.target.value)}
					/>
					<button
						type="button"
						className="mt-2 flex w-full items-center justify-center gap-2 rounded-md border border-slate-300 px-3 py-2 text-xs font-semibold normal-case text-slate-600 hover:bg-slate-100"
						onClick={() => onChange("")}
					>
						<X size={14} /> Effacer le filtre
					</button>
				</div>
			)}
		</th>
	);
}
