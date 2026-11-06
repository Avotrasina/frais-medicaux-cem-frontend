import { useMemo, useState } from "react";
import { EditableNumberCell, EditableStringCell } from "../../../components/ui";
import { t5xTypeColumns } from "../data/tableColumns";
import type { T5XTypeTableProps } from "../types/t5xType";
import useT5XAddRowValues from "../hooks/useT5XAddRowValues";
import T5XConstraintCell from "./ui/T5XConstraintCell";
import T5XFilterHeader from "./ui/T5XFilterHeader";

const cellClass = "border border-slate-200 px-2 py-2 text-slate-900";
const numberFormatter = new Intl.NumberFormat("fr-FR", { maximumFractionDigits: 0 });
type FilterKey = "nom" | "typeContrainte";

function canEditNumber(type: string, key: "plafondActe" | "plafondAn" | "nombreSeances") {
	if (type === "SANS_CONTRAINTE") return false;
	if (key === "plafondActe") return type === "PAR_ACTE" || type === "PAR_AN_PAR_ACTE";
	if (key === "plafondAn") return type === "PAR_AN" || type === "PAR_AN_PAR_ACTE";
	return type === "PAR_SEANCE";
}

export default function T5XTypesTable({ rows, addRowId, activeRowId = null, containerRef, addRowRef, onCellChange }: T5XTypeTableProps) {
	const [openFilter, setOpenFilter] = useState<FilterKey | null>(null);
	const [filters, setFilters] = useState<Partial<Record<FilterKey, string>>>({});
	const dataRows = rows.filter((row) => row.id !== addRowId);
	const addRow = rows.find((row) => row.id === addRowId);
	const { hasAnyValue: addRowHasValues } = useT5XAddRowValues(addRow);
	const visibleRows = useMemo(() => dataRows.filter((row) => {
		const nameFilter = (filters.nom ?? "").trim().toLocaleLowerCase();
		const typeFilter = filters.typeContrainte ?? "";
		return row.id === activeRowId || (
			row.nom.toLocaleLowerCase().includes(nameFilter)
			&& (!typeFilter || row.typeContrainte === typeFilter)
		);
	}), [activeRowId, dataRows, filters]);

	function clearFilter(key: FilterKey) {
		setFilters((current) => {
			const next = { ...current };
			delete next[key];
			return next;
		});
	}

	return (
		<div ref={containerRef} className="min-h-0 flex-1 overflow-auto">
			<table className="h-fit w-max min-w-full table-fixed border-collapse text-sm">
				<thead className="sticky top-0 z-10 bg-slate-900 text-white">
					<tr>
						{t5xTypeColumns.map((column) => {
							const filterKey = column.filterMode ? column.key as FilterKey : null;
							return (
								<T5XFilterHeader
									key={column.key}
									label={column.label}
									width={column.width}
								filterMode={column.filterMode}
									filterValue={filterKey ? filters[filterKey] ?? "" : ""}
									isOpen={Boolean(filterKey && openFilter === filterKey)}
									onMouseEnter={() => filterKey && setOpenFilter(filterKey)}
									onMouseLeave={() => filterKey && openFilter === filterKey && setOpenFilter(null)}
									onFilterChange={(value) => filterKey && setFilters((current) => ({ ...current, [filterKey]: value }))}
									onClear={() => filterKey && clearFilter(filterKey)}
								/>
							);
						})}
					</tr>
				</thead>
				<tbody>
					{visibleRows.length === 0 && dataRows.length > 0 && (
						<tr key="no-results"><td colSpan={t5xTypeColumns.length} className="border-b border-slate-200 px-4 py-6 text-center text-sm text-slate-500">Aucun type T5 ne correspond aux filtres.</td></tr>
					)}
					{[...visibleRows, ...(addRow ? [addRow] : [])].map((row) => (
						<tr
							key={row.id}
							ref={row.id === addRowId ? addRowRef : undefined}
							tabIndex={row.id === addRowId ? -1 : undefined}
							className={`h-12 bg-white text-slate-900 hover:bg-slate-50 ${row.id === addRowId && activeRowId === null ? "focus:relative focus:z-[1] focus:bg-blue-50 focus:[&>td]:border-y-2 focus:[&>td]:border-blue-600 focus:[&>td:first-child]:border-l-2 focus:[&>td:last-child]:border-r-2 focus:[&>td:first-child]:border-l-blue-600 focus:[&>td:last-child]:border-r-blue-600" : ""} ${row.id === activeRowId ? "relative z-[1] bg-blue-50 [&>td]:border-y-2 [&>td]:border-blue-600 [&>td:first-child]:border-l-2 [&>td:last-child]:border-r-2" : ""}`}
						>
							{t5xTypeColumns.map((column) => {
								const className = `${cellClass} ${column.width}`;
								const isLocked = activeRowId !== null && activeRowId !== row.id;
								if (column.key === "nom") {
									return <EditableStringCell key={column.key} value={row.nom} emptyValue="—" className={className} isLocked={isLocked} onSave={(value) => onCellChange(row.id, "nom", value)} />;
								}
								if (column.key === "typeContrainte") {
										if (row.id === addRowId && !addRowHasValues) {
											return <td key={column.key} className={`${className} text-center align-middle ${isLocked ? "cursor-not-allowed bg-slate-100 text-slate-400" : ""}`}>—</td>;
										}
										return <T5XConstraintCell key={column.key} value={row.typeContrainte || "SANS_CONTRAINTE"} className={className} isLocked={isLocked} onSave={(value) => onCellChange(row.id, "typeContrainte", value)} />;
								}
								if (column.key === "plafondActe" || column.key === "plafondAn" || column.key === "nombreSeances") {
									const value = row[column.key];
									if (canEditNumber(row.typeContrainte, column.key)) {
										return <EditableNumberCell key={column.key} value={value ?? 0} className={`${className} text-left`} isLocked={isLocked} onSave={(nextValue) => onCellChange(row.id, column.key, nextValue)} />;
									}
									const isEmpty = value === null || !Number.isFinite(value);
									return <td key={column.key} className={`${className} ${isEmpty ? "text-center align-middle" : "text-left"} ${isLocked ? "cursor-not-allowed bg-slate-100 text-slate-400" : ""}`}>{isEmpty ? "—" : numberFormatter.format(value)}</td>;
								}
								return null;
							})}
						</tr>
					))}
				</tbody>
			</table>
		</div>
	);
}
