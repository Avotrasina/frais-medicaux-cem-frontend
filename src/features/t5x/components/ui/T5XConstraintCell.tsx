import { T5X_CONSTRAINT_TYPES, type T5XConstraintType } from "../../types/t5xType";

type Props = {
	value: T5XConstraintType | "";
	className?: string;
	onSave: (value: T5XConstraintType | "") => void;
};

export default function T5XConstraintCell({ value, className = "", onSave }: Props) {
	return (
		<td className={`px-2 py-2 ${className}`}>
			<select
				aria-label="Type de contrainte"
				className="w-full cursor-pointer rounded-md border border-slate-200 bg-white px-2 py-1.5 text-xs text-slate-800 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
				value={value}
				onChange={(event) => onSave(event.target.value as T5XConstraintType | "")}
			>
				{T5X_CONSTRAINT_TYPES.map((constraint) => (
					<option key={constraint} value={constraint}>{constraint}</option>
				))}
			</select>
		</td>
	);
}
