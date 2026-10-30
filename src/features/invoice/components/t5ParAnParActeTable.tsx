import EditableDateCell from "./editableDateCell";
import EditableNumberCell from "./editableNumberCell";
import EditableStringCell from "./editableStringcell";
import type {
	T5ParAnParActeColumnKey,
	T5ParAnParActeTableProps,
} from "../types/t5ParAnParActe";

const columns: { key: T5ParAnParActeColumnKey; label: string; width: string }[] = [
	{ key: "refSocial", label: "Réf. social", width: "w-32" },
	{ key: "dateActe", label: "Date de l’acte", width: "w-40" },
	{ key: "libelle", label: "Libellé", width: "w-64" },
	{ key: "montantActe", label: "Montant de l’acte", width: "w-40" },
	{ key: "depassementActe", label: "Dépassement à l’acte", width: "w-44" },
	{ key: "cumulActeConsomme", label: "Cumul acte consommé", width: "w-44" },
	{ key: "soldePlafond", label: "Solde du plafond", width: "w-40" },
	{ key: "depassementPlafond", label: "Dépassement au plafond", width: "w-48" },
	{ key: "totalDepassement", label: "Total dépassement", width: "w-44" },
	{ key: "nomEtablissement", label: "Nom établissement", width: "w-64" },
];

const cellClass = "border border-slate-200 px-2 py-2 text-slate-900";
const amountFormatter = new Intl.NumberFormat("fr-FR", {
	maximumFractionDigits: 0,
});

export default function T5ParAnParActeTable({ rows, onCellChange }: T5ParAnParActeTableProps) {
	return (
		<div className="min-h-0 flex-1 overflow-auto">
			<table className="h-fit w-max min-w-full table-fixed border-collapse text-sm">
				<thead className="sticky top-0 z-10 bg-slate-900 text-white">
					<tr>
						{columns.map((column) => (
							<th
								key={column.key}
								className={`border border-slate-700 px-3 py-3 text-left text-[10px] font-extrabold uppercase tracking-wide ${column.width}`}
							>
								{column.label}
							</th>
						))}
					</tr>
				</thead>
				<tbody>
					{rows.map((row) => (
						<tr key={row.id} className="h-12 bg-white hover:bg-slate-50">
							{columns.map((column) => {
								const className = `${cellClass} ${column.width}`;
								if (column.key === "refSocial" || column.key === "libelle") {
									return (
										<EditableStringCell
											key={column.key}
											value={row[column.key]}
											className={className}
											onSave={(value) => onCellChange(row.id, column.key, value)}
										/>
									);
								}
								if (column.key === "dateActe") {
									return (
										<EditableDateCell
											key={column.key}
											value={row.dateActe}
											className={className}
											onSave={(value) => onCellChange(row.id, column.key, value)}
										/>
									);
								}
								if (column.key === "montantActe") {
									return (
										<EditableNumberCell
											key={column.key}
											value={row.montantActe}
											className={className}
											onSave={(value) => onCellChange(row.id, column.key, value)}
										/>
									);
								}

								const value = row[column.key];
								return (
									<td key={column.key} className={`${className} truncate`}>
										{typeof value === "number" ? amountFormatter.format(value) : value}
									</td>
								);
							})}
						</tr>
					))}
				</tbody>
			</table>
		</div>
	);
}
