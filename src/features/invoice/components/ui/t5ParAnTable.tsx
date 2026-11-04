import { useEffect, useRef } from "react";
import EditableDateCell from "./editableDateCell";
import { EditableNumberCell, EditableStringCell } from "../../../../components/ui";
import { t5ParAnColumns as columns } from "../../data/tableColumn";
import type { T5ParAnTableProps } from "../../types/t5ParAn";

const cellClass = "border border-slate-200 px-2 py-2 text-slate-900";
const moneyFormatter = new Intl.NumberFormat("fr-FR", {
	maximumFractionDigits: 0,
});

export default function T5ParAnTable({ rows, onCellChange, focusRefSocial, activeRowId = null }: T5ParAnTableProps) {
	const focusedRowRef = useRef<HTMLTableRowElement>(null);
	const targetRowId = rows.find((row) => row.refSocial === focusRefSocial)?.id;
	const focusedRowId = activeRowId ?? targetRowId;

	useEffect(() => {
		if (!focusedRowRef.current) return;
		focusedRowRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
		focusedRowRef.current.focus({ preventScroll: true });
	}, [focusedRowId]);

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
						<tr key={row.id} ref={row.id === focusedRowId ? focusedRowRef : undefined} tabIndex={row.id === focusedRowId ? -1 : undefined} className={`h-12 bg-white hover:bg-slate-50 ${row.id === activeRowId ? "bg-yellow-50 outline outline-2 outline-red-400" : ""} ${row.id === targetRowId && activeRowId === null ? "focus:outline focus:outline-2 focus:outline-red-400" : ""}`}>
							{columns.map((column) => {
								const className = `${cellClass} ${column.width}`;
								const isLocked = activeRowId !== null && activeRowId !== row.id;

								if (column.key === "refSocial") {
									return <td key={column.key} className={`${className} truncate ${isLocked ? "cursor-not-allowed bg-slate-100 text-slate-400" : ""}`}>{row.refSocial || "—"}</td>;
								}

								if (column.key === "libelle") {
									return (
										<EditableStringCell
											key={column.key}
											value={row[column.key]}
											className={className}
											isLocked={isLocked}
											onSave={(nextValue) => onCellChange(row.id, "libelle", nextValue)}
										/>
									);
								}

								if (column.key === "dateActe") {
									return (
										<EditableDateCell
											key={column.key}
											value={row.dateActe}
											className={className}
											isLocked={isLocked}
											onSave={(nextValue) => onCellChange(row.id, "dateActe", nextValue)}
										/>
									);
								}

								if (column.key === "montantActe") {
									return (
										<EditableNumberCell
											key={column.key}
											value={row.montantActe}
											className={className}
											isLocked={isLocked}
											onSave={(nextValue) => onCellChange(row.id, "montantActe", nextValue)}
										/>
									);
								}

								const value = row[column.key];
								const displayValue =
									typeof value === "number"
										? moneyFormatter.format(value)
										: value ?? "";
								return (
									<td key={column.key} className={`${className} truncate ${isLocked ? "cursor-not-allowed bg-slate-100 text-slate-400" : ""}`}>
										{displayValue}
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
