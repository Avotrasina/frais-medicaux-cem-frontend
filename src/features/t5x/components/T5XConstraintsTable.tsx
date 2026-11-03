import { useMemo, useState } from "react";
import { EditableNumberCell, EditableStringCell } from "../../../components/ui";
import { t5xConstraintColumns } from "../data/tableColumns";
import type { T5XConstraintEditableKey, T5XConstraintTableProps } from "../types/t5xType";
import T5XCategoryCell from "./ui/T5XCategoryCell";
import T5XConstraintCell from "./ui/T5XConstraintCell";
import T5XFilterHeader from "./ui/T5XFilterHeader";
import useT5XAddRowValues from "../hooks/useT5XAddRowValues";

const cellClass = "border border-slate-200 px-2 py-2 text-slate-900";
const numberFormatter = new Intl.NumberFormat("fr-FR", { maximumFractionDigits: 0 });
type FilterKey = "nom" | "nomCategorie" | "typeContrainte";

function canEditNumber(type: string, key: "plafondActe" | "plafondAn" | "nombreSeances") {
	if (type === "SANS_CONTRAINTE") return false;
	if (key === "plafondActe") return type === "PAR_ACTE" || type === "PAR_AN_PAR_ACTE";
	if (key === "plafondAn") return type === "PAR_AN" || type === "PAR_AN_PAR_ACTE";
	return type === "PAR_SEANCE";
}

export default function T5XConstraintsTable({ rows, categories, addRowId, containerRef, addRowRef, onCellChange }: T5XConstraintTableProps) {
	const [openFilter, setOpenFilter] = useState<FilterKey | null>(null);
	const [filters, setFilters] = useState<Partial<Record<FilterKey, string>>>({});
	const dataRows = rows.filter((row) => row.id !== addRowId);
	const addRow = rows.find((row) => row.id === addRowId);
	const { hasAnyValue: addRowHasValues } = useT5XAddRowValues(addRow);
	const visibleRows = useMemo(() => dataRows.filter((row) => {
		const nameFilter = (filters.nom ?? "").trim().toLocaleLowerCase();
		const categoryFilter = filters.nomCategorie ?? "";
		const typeFilter = filters.typeContrainte ?? "";
		return row.nom.toLocaleLowerCase().includes(nameFilter)
			&& (!categoryFilter || String(row.categorieId) === categoryFilter)
			&& (!typeFilter || row.typeContrainte === typeFilter);
	}), [dataRows, filters]);

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
						{t5xConstraintColumns.map((column) => {
							const filterKey = column.filterMode ? column.key as FilterKey : null;
							return (
								<T5XFilterHeader
									key={column.key}
									label={column.label}
									width={column.width}
								filterMode={column.filterMode}
									categories={filterKey === "nomCategorie" ? categories : undefined}
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
						<tr key="no-results"><td colSpan={t5xConstraintColumns.length} className="border-b border-slate-200 px-4 py-6 text-center text-sm text-slate-500">Aucune contrainte ne correspond aux filtres.</td></tr>
					)}
					{[...visibleRows, ...(addRow ? [addRow] : [])].map((row) => (
						<tr
							key={row.id}
							ref={row.id === addRowId ? addRowRef : undefined}
							tabIndex={row.id === addRowId ? -1 : undefined}
							className={`h-12 bg-white text-slate-900 hover:bg-slate-50 ${row.id === addRowId ? "focus:bg-yellow-50 focus:outline focus:outline-2 focus:outline-red-400" : ""}`}
						>
							{t5xConstraintColumns.map((column) => {
								const className = `${cellClass} ${column.width}`;
								if (column.key === "typeContrainte") {
									if (row.id === addRowId && !addRowHasValues) {
										return <td key={column.key} className={`${className} text-center align-middle`}>—</td>;
										}
										return <T5XConstraintCell key={column.key} value={row.typeContrainte || "SANS_CONTRAINTE"} className={className} onSave={(value) => onCellChange(row.id, "typeContrainte", value)} />;
								}
								if (column.key === "nomCategorie") {
									if (row.id === addRowId && !addRowHasValues) {
										return <td key={column.key} className={`${className} text-center align-middle`}>—</td>;
										}
										if (categories.length === 0) {
											return <td key={column.key} className={`${className} text-center align-middle`}>—</td>;
										}
										return <T5XCategoryCell key={column.key} value={row.categorieId || categories[0].id} categories={categories} className={className} onSave={(value) => onCellChange(row.id, "categorieId", value)} />;
								}
								if (column.key === "plafondActe" || column.key === "plafondAn" || column.key === "nombreSeances") {
									const value = row[column.key];
									if (canEditNumber(row.typeContrainte, column.key)) {
										return <EditableNumberCell key={column.key} value={value ?? 0} className={`${className} text-left`} onSave={(nextValue) => onCellChange(row.id, column.key, nextValue)} />;
									}
									const isEmpty = value === null || !Number.isFinite(value);
									return <td key={column.key} className={`${className} ${isEmpty ? "text-center align-middle" : "text-left"}`}>{isEmpty ? "—" : numberFormatter.format(value)}</td>;
								}
								const key = column.key as "code" | "nom" | "libelle";
									return <EditableStringCell key={key} value={row[key]} emptyValue="—" className={className} onSave={(value) => onCellChange(row.id, key as T5XConstraintEditableKey, value)} />;
							})}
						</tr>
					))}
				</tbody>
			</table>
		</div>
	);
}
