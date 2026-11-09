import { useMemo, useState } from "react";
import { Loader2, Search, X } from "lucide-react";
import EditableNumberCell from "../../../components/ui/EditableNumberCell";
import EditableStringCell from "../../../components/ui/EditableStringCell";
import EditableDateCell from "../../invoice/components/ui/editableDateCell";
import EditableMonthCell from "../../invoice/components/ui/editableMonthCell";
import { t6Columns, t6EditableKeys, t6NumberKeys } from "../data/t6Columns";
import type { T6ColumnKey, T6EditableKey, T6Row, T6TableProps } from "../types/t6Row";

type DateRange = { from?: string; to?: string };

const textFilterKeys: T6ColumnKey[] = t6Columns
	.map((column) => column.key)
	.filter((key) => key !== "moisAffectation" && key !== "dateSaisie");

const monthOptions = Array.from({ length: 12 }, (_, index) => ({
	value: String(index + 1),
	label: new Intl.DateTimeFormat("fr-FR", { month: "long", timeZone: "UTC" })
		.format(new Date(Date.UTC(2026, index, 1))),
}));

const moneyFormatter = new Intl.NumberFormat("fr-FR", { maximumFractionDigits: 0 });
const monthFormatter = new Intl.DateTimeFormat("fr-FR", {
	month: "short",
	year: "2-digit",
	timeZone: "UTC",
});

function isEditableKey(key: T6ColumnKey): key is T6EditableKey {
	return (t6EditableKeys as readonly string[]).includes(key);
}

function dateToInput(value: string): string {
	const match = value.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
	return match ? `${match[3]}-${match[2]}-${match[1]}` : "";
}

function matchesDateRange(value: string, range?: DateRange): boolean {
	if (!range?.from || !range.to) return true;
	const isoDate = dateToInput(value);
	return Boolean(isoDate && isoDate >= range.from && isoDate <= range.to);
}

function formatReadOnlyValue(row: T6Row, key: T6ColumnKey): string {
	const value = row[key];
	if (value instanceof Date) return monthFormatter.format(value);
	if (typeof value === "number") return value === 0 ? "" : moneyFormatter.format(value);
	return value ?? "";
}

export default function T6Table({
	rows,
	addRowId,
	activeRowId,
	containerRef,
	addRowRef,
	loadingCells,
	onCellChange,
}: T6TableProps) {
	const [openFilter, setOpenFilter] = useState<T6ColumnKey | null>(null);
	const [textFilters, setTextFilters] = useState<Partial<Record<T6ColumnKey, string>>>({});
	const [dateDraft, setDateDraft] = useState<DateRange>({});
	const [dateFilter, setDateFilter] = useState<DateRange>({});
	const [monthFilter, setMonthFilter] = useState({ month: "", year: "" });

	const dataRows = useMemo(() => rows.filter((row) => row.id !== addRowId), [addRowId, rows]);
	const addRow = rows.find((row) => row.id === addRowId);
	const monthYears = useMemo(() => Array.from(new Set(dataRows.flatMap((row) =>
		row.moisAffectation ? [String(row.moisAffectation.getUTCFullYear())] : [],
	))).sort((a, b) => Number(b) - Number(a)), [dataRows]);

	const filteredRows = useMemo(() => dataRows.filter((row) => {
		const matchesText = textFilterKeys.every((key) => {
			const query = textFilters[key]?.trim().toLocaleLowerCase();
			return !query || String(row[key] ?? "").toLocaleLowerCase().includes(query);
		});
		const matchesDate = matchesDateRange(row.dateSaisie, dateFilter);
		const matchesMonth = (!monthFilter.month || String((row.moisAffectation?.getUTCMonth() ?? -1) + 1) === monthFilter.month)
			&& (!monthFilter.year || String(row.moisAffectation?.getUTCFullYear() ?? "") === monthFilter.year);
		return matchesText && matchesDate && matchesMonth;
	}), [dataRows, dateFilter, monthFilter, textFilters]);

	const hasFilters = Object.values(textFilters).some((value) => Boolean(value?.trim()))
		|| Boolean(dateFilter.from && dateFilter.to)
		|| Boolean(monthFilter.month || monthFilter.year);
	const visibleRows = addRow ? [...filteredRows, addRow] : filteredRows;
	const numberOfColumns = t6Columns.length;

	return (
		<div className="flex min-h-0 flex-1 flex-col overflow-hidden">
			<div ref={containerRef} className="min-h-0 flex-1 overflow-auto">
				<table className="h-fit w-max min-w-full table-fixed border-collapse text-sm">
					<thead className="sticky top-0 z-10 bg-slate-900 text-white">
						<tr>
							{t6Columns.map((column) => {
								const isMonth = column.key === "moisAffectation";
								const isDate = column.key === "dateSaisie";
								const filterable = isMonth || isDate || textFilterKeys.includes(column.key);
								const isOpen = openFilter === column.key;
								const columnDateDraft = dateDraft.from || dateDraft.to ? dateDraft : dateFilter;
								return (
									<th
										key={column.key}
										className={`relative border border-slate-700 px-3 py-3 text-left text-[10px] font-extrabold uppercase tracking-wide ${column.width} ${filterable ? "cursor-pointer" : ""} ${isOpen ? "z-30" : ""}`}
										onMouseEnter={() => filterable && setOpenFilter(column.key)}
										onMouseLeave={() => isOpen && setOpenFilter(null)}
										aria-expanded={filterable ? isOpen : undefined}
									>
										<span className="block w-full text-left">{column.label}</span>
										{isOpen && (
											<div
												className="absolute left-0 top-full z-40 w-64 rounded-b-lg border border-slate-200 bg-white p-3 text-slate-800 shadow-xl normal-case"
												onClick={(event) => event.stopPropagation()}
												onMouseEnter={() => setOpenFilter(column.key)}
											>
												{isMonth ? (
													<div className="space-y-2">
														<label className="block text-xs font-semibold text-slate-600">
															Mois
															<select
																aria-label="Filtrer par mois d’affectation"
																value={monthFilter.month}
																className="mt-1 w-full rounded-md border border-slate-300 px-2 py-2 text-xs font-normal"
																onChange={(event) => setMonthFilter((current) => ({ ...current, month: event.target.value }))}
															>
																<option value="">Tous les mois</option>
																{monthOptions.map((month) => <option key={month.value} value={month.value}>{month.label}</option>)}
															</select>
														</label>
														<label className="block text-xs font-semibold text-slate-600">
															Année
															<select
																aria-label="Filtrer par année d’affectation"
																value={monthFilter.year}
																className="mt-1 w-full rounded-md border border-slate-300 px-2 py-2 text-xs font-normal"
																onChange={(event) => setMonthFilter((current) => ({ ...current, year: event.target.value }))}
															>
																<option value="">Toutes les années</option>
																{monthYears.map((year) => <option key={year} value={year}>{year}</option>)}
															</select>
														</label>
														<button
															type="button"
															className="flex w-full items-center justify-center gap-2 rounded-md border border-slate-300 px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100"
															onClick={() => setMonthFilter({ month: "", year: "" })}
														>
															<X size={14} /> Effacer le filtre
														</button>
													</div>
												) : isDate ? (
													<div className="space-y-2">
														<input
															type="date"
															aria-label="Date de début"
															value={columnDateDraft.from ?? ""}
															className="w-full rounded-md border border-slate-300 px-2 py-2 text-xs font-normal"
															onChange={(event) => setDateDraft((current) => ({ ...current, from: event.target.value }))}
														/>
														<input
															type="date"
															aria-label="Date de fin"
															value={columnDateDraft.to ?? ""}
															className="w-full rounded-md border border-slate-300 px-2 py-2 text-xs font-normal"
															onChange={(event) => setDateDraft((current) => ({ ...current, to: event.target.value }))}
														/>
														<button
															type="button"
															disabled={!dateDraft.from || !dateDraft.to}
															className="flex w-full items-center justify-center gap-2 rounded-md bg-red-600 px-3 py-2 text-xs font-semibold text-white hover:bg-red-700 disabled:opacity-50"
															onClick={() => {
																setDateFilter(dateDraft);
																setOpenFilter(null);
															}}
														>
															<Search size={14} /> Rechercher
														</button>
														<button
															type="button"
															className="flex w-full items-center justify-center gap-2 rounded-md border border-slate-300 px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100"
															onClick={() => {
																setDateDraft({});
																setDateFilter({});
																setOpenFilter(null);
															}}
														>
															<X size={14} /> Effacer le filtre
														</button>
													</div>
												) : (
													<div>
														<input
															autoFocus
															type="search"
															placeholder={`Rechercher ${column.label.toLocaleLowerCase()}…`}
															value={textFilters[column.key] ?? ""}
															className="w-full rounded-md border border-slate-300 px-3 py-2 text-xs font-normal outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
															onChange={(event) => setTextFilters((current) => ({ ...current, [column.key]: event.target.value }))}
														/>
														<button
															type="button"
															className="mt-2 flex w-full items-center justify-center gap-2 rounded-md border border-slate-300 px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100"
															onClick={() => setTextFilters((current) => {
																const next = { ...current };
																delete next[column.key];
																return next;
															})}
														>
															<X size={14} /> Effacer le filtre
														</button>
													</div>
												)}
											</div>
										)}
									</th>
								);
							})}
						</tr>
					</thead>
					<tbody>
						{filteredRows.length === 0 && dataRows.length > 0 && hasFilters && (
							<tr>
								<td colSpan={numberOfColumns} className="border-b border-slate-200 px-4 py-6 text-center text-sm text-slate-500">
									Aucune retenue ne correspond aux filtres.
								</td>
							</tr>
						)}
						{visibleRows.map((row) => {
							const isAddRow = row.id === addRowId;
							const isLocked = activeRowId !== null && activeRowId !== row.id;
							return (
								<tr
									key={row.id}
									ref={isAddRow ? addRowRef : undefined}
									tabIndex={isAddRow ? -1 : undefined}
									className={`h-15 cursor-pointer bg-white text-slate-900 hover:bg-slate-50 ${activeRowId === row.id ? "relative z-[1] bg-blue-50 [&>td]:border-y-2 [&>td]:border-blue-600 [&>td:first-child]:border-l-2 [&>td:last-child]:border-r-2" : ""} ${isAddRow ? "focus:relative focus:z-[1] focus:bg-blue-50 focus:[&>td]:border-y-2 focus:[&>td]:border-blue-600 focus:[&>td:first-child]:border-l-2 focus:[&>td:last-child]:border-r-2" : ""}`}
								>
									{t6Columns.map((column) => {
										const cellClass = `border border-slate-200 px-2 py-2 ${column.width}`;
										const value = row[column.key];
										const isLoadingCell = loadingCells.has(`${row.id}:${column.key}`);
										const editableKey = isEditableKey(column.key) ? column.key : null;
										if (editableKey && !isLocked) {
											if (editableKey === "moisAffectation") {
												return (
													<EditableMonthCell
														key={column.key}
														value={value as Date | null}
														className={cellClass}
														emptyValue="—"
														onSave={(nextValue) => onCellChange(row.id, editableKey, nextValue)}
													/>
												);
											}
											if (editableKey === "dateSaisie") {
												return (
													<EditableDateCell
														key={column.key}
														value={String(value)}
														className={cellClass}
														emptyValue="—"
														onSave={(nextValue) => onCellChange(row.id, editableKey, nextValue)}
													/>
												);
											}
											if (t6NumberKeys.has(editableKey)) {
												return (
													<EditableNumberCell
														key={column.key}
														value={Number(value)}
														className={cellClass}
														emptyValue="—"
														onSave={(nextValue) => onCellChange(row.id, editableKey, nextValue)}
													/>
												);
											}
											return (
												<EditableStringCell
													key={column.key}
													value={String(value)}
													className={cellClass}
													emptyValue="—"
													onSave={(nextValue) => onCellChange(row.id, editableKey, nextValue)}
												/>
											);
										}
										return (
											<td
												key={column.key}
												className={`${cellClass} ${isLocked ? "bg-slate-100 text-slate-400" : "cursor-default text-slate-600"} ${isLoadingCell ? "relative" : ""}`}
												title={isLoadingCell ? undefined : formatReadOnlyValue(row, column.key)}
											>
												{isLoadingCell ? (
													<span className="absolute inset-0 flex items-center justify-center text-blue-600" role="status" aria-label="Chargement des données associées">
														<Loader2 size={16} className="animate-spin" aria-hidden="true" />
													</span>
												) : formatReadOnlyValue(row, column.key) || "—"}
											</td>
										);
									})}
								</tr>
							);
						})}
					</tbody>
				</table>
			</div>
		</div>
	);
}
