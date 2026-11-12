import { Lock, TriangleAlert } from "lucide-react";

type Props = {
	value: string;
	className?: string;
	hasConflict?: boolean;
};


export default function T5XInheritedConstraintCell({
	value,
	className = "",
	hasConflict = false,
}: Props) {
	return (
		<td className={`px-2 py-2 ${className}`}>
			<div
				className="flex items-center gap-2 rounded-md border border-dashed border-slate-300 bg-slate-50 px-2 py-1.5 text-xs text-slate-600"
				title="Contrainte héritée de la catégorie : elle n’est pas modifiable au niveau de l’acte."
			>
				<Lock size={13} className="shrink-0 text-slate-400" />
				<span className="truncate font-medium">{value}</span>
				{hasConflict && (
					<span
						className="ml-auto inline-flex items-center gap-1 text-[10px] font-semibold uppercase text-amber-700"
						title="L’acte porte encore sa propre contrainte : elle sera effacée."
					>
						<TriangleAlert size={12} />
						conflit
					</span>
				)}
			</div>
		</td>
	);
}
