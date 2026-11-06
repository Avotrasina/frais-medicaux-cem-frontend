import { useEffect, useMemo, useRef, useState } from "react";
import EditableDateCell from "./editableDateCell";
import { EditableNumberCell, EditableStringCell } from "../../../../components/ui";
import { t5ParAnParActeColumns as columns } from "../../data/tableColumn";
import type {
	T5ParAnParActeTableProps,
} from "../../types/t5ParAnParActe";
import T5RefSocialFilterHeader from "./T5RefSocialFilterHeader";

const cellClass = "border border-slate-200 px-2 py-2 text-slate-900";
const amountFormatter = new Intl.NumberFormat("fr-FR", {
	maximumFractionDigits: 0,
});

export default function T5ParAnParActeTable({ rows, onCellChange, focusRefSocial, activeRowId = null, canEditRows = true }: T5ParAnParActeTableProps) {
	const focusedRowRef = useRef<HTMLTableRowElement>(null);
	const [refSocialFilter, setRefSocialFilter] = useState("");
	const targetRowId = rows.find((row) => row.refSocial === focusRefSocial)?.id;
	const focusedRowId = activeRowId ?? targetRowId;
	const visibleRows = useMemo(() => {
		const query = refSocialFilter.trim().toLocaleLowerCase();
		return rows.filter((row) =>
			row.id === activeRowId || !query || row.refSocial.toLocaleLowerCase().includes(query),
		);
	}, [rows, activeRowId, refSocialFilter]);

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
						{columns.map((column) => column.key === "refSocial" ? (
							<T5RefSocialFilterHeader
								key={column.key}
								label={column.label}
								width={column.width}
								value={refSocialFilter}
								onChange={setRefSocialFilter}
							/>
						) : (
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
					{visibleRows.map((row) => (
						<tr key={row.id} ref={row.id === focusedRowId ? focusedRowRef : undefined} tabIndex={row.id === focusedRowId ? -1 : undefined} className={`h-12 bg-white hover:bg-slate-50 ${row.id === activeRowId ? "relative z-[1] bg-blue-50 [&>td]:border-y-2 [&>td]:border-blue-600 [&>td:first-child]:border-l-2 [&>td:last-child]:border-r-2 [&>td:first-child]:border-l-blue-600 [&>td:last-child]:border-r-blue-600" : ""} ${row.id === targetRowId && activeRowId === null ? "focus:outline focus:outline-2 focus:outline-red-400" : ""}`}>
							{columns.map((column) => {
								const className = `${cellClass} ${column.width}`;
								const isLocked = activeRowId !== null && activeRowId !== row.id;
								if (column.key === "refSocial") {
									return <td key={column.key} className={`${className} truncate ${isLocked ? "cursor-not-allowed bg-slate-100 text-slate-400" : ""}`}>{row.refSocial || "—"}</td>;
								}

								if (!canEditRows) {
									const value = row[column.key];
									return (
										<td key={column.key} className={`${className} truncate`}>
											{typeof value === "number" ? amountFormatter.format(value) : value ?? "—"}
										</td>
									);
								}
								if (column.key === "libelle") {
									return (
										<EditableStringCell
											key={column.key}
											value={row[column.key]}
											className={className}
											isLocked={isLocked}
											onSave={(value) => onCellChange(row.id, "libelle", value)}
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
											onSave={(value) => onCellChange(row.id, "dateActe", value)}
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
											onSave={(value) => onCellChange(row.id, "montantActe", value)}
										/>
									);
								}

								const value = row[column.key];
								return (
									<td key={column.key} className={`${className} truncate ${isLocked ? "cursor-not-allowed bg-slate-100 text-slate-400" : ""}`}>
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
