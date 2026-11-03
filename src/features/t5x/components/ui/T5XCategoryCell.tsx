import type { T5XCategoryOption } from "../../types/t5xType";

type Props = {
	value: number;
	categories: T5XCategoryOption[];
	className?: string;
	onSave: (categoryId: number) => void;
};

export default function T5XCategoryCell({ value, categories, className = "", onSave }: Props) {
	return (
		<td className={`px-2 py-2 ${className}`}>
			<select
				aria-label="Nom catégorie"
				className="w-full cursor-pointer rounded-md border border-slate-200 bg-white px-2 py-1.5 text-xs text-slate-800 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
				value={value}
				onChange={(event) => onSave(Number(event.target.value))}
			>
				{categories.map((category) => (
					<option key={category.id} value={category.id}>{category.nom}</option>
				))}
			</select>
		</td>
	);
}
