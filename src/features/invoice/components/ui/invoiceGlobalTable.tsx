import { useMemo, useState } from "react";
import { Search, X } from "lucide-react";
import { factureGlobaleColumns } from "../../data/tableColumn";
import DropDownCell, { type dropdownOptionProps} from "./dropDownCell";
import EditableDateCell from "./editableDateCell";
import { EditableStringCell } from "../../../../components/ui";
import SummableNumberCell from "./summableCell";
import {TypeContrainte, } from "../../types/dropDown";
import {numberColumn,dateColumn} from "../../types/invoiceTable";
import {
	dateFilterKeys,
	filterFactureGlobaleRows,
	textFilterKeys,
	type DateFilterKey,
	type FactureGlobaleFilters,
	type TextFilterKey,
} from "../../services/filterFactureGlobaleRows";

import type {
	FactureGlobaleRow,
	FactureGlobaleTableProps
} from "../../types/invoiceTable";


const DropDownMock : dropdownOptionProps[] = [
	{id:1,label:"analyse",typeContrainte:TypeContrainte.PAR_AN},
	{id:2,label:"chirurgie", typeContrainte : TypeContrainte.PAR_AN_PAR_ACTE},
	{id:3,label:"séance", typeContrainte : TypeContrainte.PAR_SEANCE}
]

function filterableFiltersActive(filters: FactureGlobaleFilters["text"], dates: FactureGlobaleFilters["dates"]) {
	return Object.values(filters).some((value) => Boolean(value?.trim())) || Object.values(dates).some((range) => Boolean(range?.from && range.to));
}


function hasInvoiceData(row: FactureGlobaleRow): boolean {
	return factureGlobaleColumns.some(
		(column) => column.key !== "majT5" && row[column.key] !== "" && row[column.key] !== 0,
	);
}

export default function FactureGlobaleTable({
	rows,
	addRowId,
	containerRef,
	addRowRef,
	onCellChange,
}: FactureGlobaleTableProps) {
	const [openFilter, setOpenFilter] = useState<string | null>(null);
	const [pinnedFilter, setPinnedFilter] = useState<DateFilterKey | null>(null);
	const [textFilters, setTextFilters] = useState<FactureGlobaleFilters["text"]>({});
	const [dateDrafts, setDateDrafts] = useState<FactureGlobaleFilters["dates"]>({});
	const [dateFilters, setDateFilters] = useState<FactureGlobaleFilters["dates"]>({});
	const dataRows = rows.filter((row) => row.id !== addRowId);
	const visibleRows = useMemo(
		() => [...filterFactureGlobaleRows(dataRows, { text: textFilters, dates: dateFilters }), rows.find((row) => row.id === addRowId)!],
		[dataRows, textFilters, dateFilters, rows, addRowId],
	);

	function isTextFilterKey(key: string): key is TextFilterKey {
		return (textFilterKeys as readonly string[]).includes(key);
	}

	function isDateFilterKey(key: string): key is DateFilterKey {
		return (dateFilterKeys as readonly string[]).includes(key);
	}

	function applyDateFilter(key: DateFilterKey) {
		const range = dateDrafts[key];
		if (!range?.from || !range.to) return;
		setDateFilters((current) => {
			return { ...current, [key]: range };
		});
		setPinnedFilter(null);
		setOpenFilter(null);
	}

	function clearTextFilter(key: TextFilterKey) {
		setTextFilters((current) => {
			const next = { ...current };
			delete next[key];
			return next;
		});
	}

	function clearDateFilter(key: DateFilterKey) {
		setDateFilters((current) => {
			const next = { ...current };
			delete next[key];
			return next;
		});
		setDateDrafts((current) => {
			const next = { ...current };
			delete next[key];
			return next;
		});
		setPinnedFilter(null);
		setOpenFilter(null);
	}

	function addSummableValue(row: FactureGlobaleRow, key: keyof typeof numberColumn, addedValue: number) {
		const currentValue = Number(row[key]) || 0;
		const newValue = Math.round((currentValue + addedValue) * 100) / 100;
		onCellChange(row.id, key, String(newValue));
	}

	return (
		<div ref={containerRef} className="min-h-0 flex-1 overflow-auto">
			<table className="h-fit w-max min-w-full table-fixed border-collapse text-sm">
				<thead className="sticky top-0 z-10 bg-slate-900 text-white">
					<tr>
						{factureGlobaleColumns.map((column) => {
							const textKey = isTextFilterKey(column.key) ? column.key : null;
							const dateKey = isDateFilterKey(column.key) ? column.key : null;
							const filterable = textKey !== null || dateKey !== null;
							const isOpen = openFilter === column.key;
							const dateRangeDraft = dateKey ? dateDrafts[dateKey] ?? dateFilters[dateKey] : undefined;
							return (
								<th
									key={column.key}
									className={`relative border border-slate-700 px-3 py-3 text-left text-[10px] font-extrabold uppercase tracking-wide ${column.width} ${filterable ? "cursor-pointer" : ""} ${column.key === "majT5" ? "bg-yellow-300 text-red-800" : ""} ${isOpen ? "z-30" : ""}`}
									onMouseEnter={() => filterable && (!pinnedFilter || pinnedFilter === column.key) && setOpenFilter(column.key)}
									onMouseLeave={() => isOpen && pinnedFilter !== column.key && setOpenFilter(null)}
									aria-expanded={filterable ? isOpen : undefined}
								>
									<span className="block w-full text-left">
										{column.label}
									</span>
									{isOpen && (
										<div className="absolute left-0 top-full z-40 w-64 rounded-b-lg border border-slate-200 bg-white p-3 text-slate-800 shadow-xl normal-case" onClick={(event) => event.stopPropagation()}>
											{textKey ? (
												<div>
													<input
														autoFocus
														type="search"
														placeholder={`Rechercher ${column.label.toLocaleLowerCase()}…`}
														value={textFilters[textKey] ?? ""}
														className="w-full rounded-md border border-slate-300 px-3 py-2 text-xs font-normal normal-case outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
														onChange={(event) => setTextFilters((current) => ({ ...current, [textKey]: event.target.value }))}
													/>
													<button type="button" className="mt-2 flex w-full items-center justify-center gap-2 rounded-md border border-slate-300 px-3 py-2 text-xs font-semibold normal-case text-slate-600 hover:bg-slate-100" onClick={() => clearTextFilter(textKey)}>
														<X size={14} /> Effacer le filtre
													</button>
												</div>
											) : dateKey ? (
												<div className="space-y-2">
													<input
														type="date"
														aria-label="Date de début"
														onFocus={() => { setPinnedFilter(dateKey); setOpenFilter(dateKey); }}
														value={dateDrafts[dateKey]?.from ?? dateFilters[dateKey]?.from ?? ""}
														className="w-full rounded-md border border-slate-300 px-2 py-2 text-xs font-normal normal-case outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
														onChange={(event) => setDateDrafts((current) => ({ ...current, [dateKey]: { from: event.target.value, to: current[dateKey]?.to ?? dateFilters[dateKey]?.to ?? "" } }))}
													/>
													<input
														type="date"
														aria-label="Date de fin"
														onFocus={() => { setPinnedFilter(dateKey); setOpenFilter(dateKey); }}
														value={dateDrafts[dateKey]?.to ?? dateFilters[dateKey]?.to ?? ""}
														className="w-full rounded-md border border-slate-300 px-2 py-2 text-xs font-normal normal-case outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
														onChange={(event) => setDateDrafts((current) => ({ ...current, [dateKey]: { from: current[dateKey]?.from ?? dateFilters[dateKey]?.from ?? "", to: event.target.value } }))}
													/>
													<button type="button" disabled={!dateRangeDraft?.from || !dateRangeDraft.to} className="flex w-full items-center justify-center gap-2 rounded-md bg-red-600 px-3 py-2 text-xs font-semibold text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50" onClick={() => applyDateFilter(dateKey)}>
														<Search size={14} /> Rechercher
													</button>
													<button type="button" className="flex w-full items-center justify-center gap-2 rounded-md border border-slate-300 px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100" onClick={() => clearDateFilter(dateKey)}>
														<X size={14} /> Effacer le filtre
													</button>
												</div>
											) : null}
										</div>
									)}
								</th>
							);
						})}
					</tr>
				</thead>
				<tbody>
					{visibleRows.length === 1 && dataRows.length > 0 && filterableFiltersActive(textFilters, dateFilters) && (
						<tr key="no-results"><td colSpan={factureGlobaleColumns.length} className="border-b border-slate-200 px-4 py-6 text-center text-sm text-slate-500">Aucune facture ne correspond aux filtres.</td></tr>
					)}
					{visibleRows.map((row) => (
						<tr
							key={row.id}
							ref={row.id === addRowId ? addRowRef : undefined}
							tabIndex={row.id === addRowId ? -1 : undefined}
							className={`h-15 bg-white text-slate-900 hover:bg-slate-50 ${row.id === addRowId ? "focus:bg-yellow-50 focus:outline focus:outline-2 focus:outline-red-400" : ""}`}
						>
							{factureGlobaleColumns.map((column) => {
								const onSave = (nextValue: string) => onCellChange(row.id, column.key, nextValue);
								const cellClass = `border border-slate-200 px-2 py-2 ${column.width}`;

								if (column.key === "majT5") {
									return hasInvoiceData(row) && row.refSocial.trim() ? (
										<DropDownCell key={column.key} options={DropDownMock} refSocial={row.refSocial} className={`${cellClass} bg-yellow-100 text-red-800`} />
									) : (
										<td key={column.key} className={`${cellClass} bg-yellow-100 text-red-800`} />
									);
								}
								const value = row[column.key];

								if ((Object.values(dateColumn) as string[]).includes(column.key)) {
									return (
										<EditableDateCell
											key={column.key}
											value={value as string}
											className={cellClass}
											emptyValue="—"
											onSave={onSave}
										/>
									);
								}

								if ((Object.values(numberColumn) as string[]).includes(column.key)) {
									return (
										<SummableNumberCell
											key={column.key}
											value={value as number}
											className={cellClass}
											emptyValue="—"
											onSave={(addedValue) => addSummableValue(row, column.key as keyof typeof numberColumn, addedValue)}
										/>
									);
								}

								return (
									<EditableStringCell
										key={column.key}
										value={String(value)}
										className={cellClass}
										emptyValue="—"
										onSave={onSave}
									/>
								);
							})}
						</tr>
					))}
				</tbody>
			</table>
		</div>
	);
}
