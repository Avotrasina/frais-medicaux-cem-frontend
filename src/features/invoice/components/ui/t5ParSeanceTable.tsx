import { useEffect, useRef } from "react";
import EditableDateCell from "./editableDateCell";
import { EditableNumberCell, EditableStringCell } from "../../../../components/ui";
import { t5ParSeanceColumns as columns } from "../../data/tableColumn";
import type {
	T5ParSeanceTableProps,
} from "../../types/t5ParSeance";

const cellClass = "border border-slate-200 px-2 py-2 text-slate-900";
const amountFormatter = new Intl.NumberFormat("fr-FR", {
	maximumFractionDigits: 0,
});

export default function T5ParSeanceTable({ rows, onCellChange, focusRefSocial }: T5ParSeanceTableProps) {
	const targetRowRef = useRef<HTMLTableRowElement>(null);
	const targetRowId = rows.find((row) => row.refSocial === focusRefSocial)?.id;

	useEffect(() => {
		if (!targetRowRef.current) return;
		targetRowRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
		targetRowRef.current.focus({ preventScroll: true });
	}, [targetRowId]);

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
						<tr key={row.id} ref={row.id === targetRowId ? targetRowRef : undefined} tabIndex={row.id === targetRowId ? -1 : undefined} className={`h-12 bg-white hover:bg-slate-50 ${row.id === targetRowId ? "focus:outline focus:outline-2 focus:outline-red-400" : ""}`}>
							{columns.map((column) => {
								const className = `${cellClass} ${column.width}`;
								if (column.key === "refSocial") {
									return <td key={column.key} className={`${className} truncate`}>{row.refSocial || "—"}</td>;
								}
								if (column.key === "libelle") {
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
