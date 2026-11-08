import { useMemo, useState } from "react";
import { Search, X } from "lucide-react";
import { factureGlobaleColumns } from "../../data/tableColumn";
import DropDownCell, { type dropdownOptionProps } from "./dropDownCell";
import EditableDateCell from "./editableDateCell";
import EditableMonthCell from "./editableMonthCell";
import { EditableNumberCell, EditableStringCell } from "../../../../components/ui";
import { TypeContrainte } from "../../types/dropDown";
import {
    FACTURE_GLOBALE_UPDATE_KEYS,
    numberColumn,
    dateColumn,
    SaveColumnKey,
} from "../../types/invoiceTable";
import { personnelFactureGlobaleEditableColumns } from "../../data/tableColumn";
import { useAuth } from "../../../auth";
import PrestataireDropdownCell from "./prestataireDropdownCell";
import { prestatairesMock } from "../../mocks/prestataires";

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
    FactureGlobaleTableProps,
} from "../../types/invoiceTable";


const DropDownMock: dropdownOptionProps[] = [
    { id: 1, label: "analyse", typeContrainte: TypeContrainte.PAR_AN },
    { id: 2, label: "chirurgie", typeContrainte: TypeContrainte.PAR_AN_PAR_ACTE },
    { id: 3, label: "séance", typeContrainte: TypeContrainte.PAR_SEANCE }
];

const editableUpdateKeys = new Set<string>(personnelFactureGlobaleEditableColumns);
const updateKeys = new Set<string>(FACTURE_GLOBALE_UPDATE_KEYS);

function filterableFiltersActive(
    filters: FactureGlobaleFilters["text"],
    dates: FactureGlobaleFilters["dates"],
    monthPrestation: FactureGlobaleFilters["monthPrestation"],
) {
    return (
        Object.values(filters).some((value) => Boolean(value?.trim())) ||
        Object.values(dates).some((range) => Boolean(range?.from && range.to)) ||
        Boolean(monthPrestation.month || monthPrestation.year)
    );
}

const monthOptions = Array.from({ length: 12 }, (_, index) => {
    const date = new Date(Date.UTC(2026, index, 1));
    return {
        value: String(index + 1),
        label: new Intl.DateTimeFormat("fr-FR", { month: "long", timeZone: "UTC" }).format(date),
    };
});

function hasInvoiceData(row: FactureGlobaleRow): boolean {
    return factureGlobaleColumns.some(
        (column) => column.key !== "majT5" && row[column.key] !== "" && row[column.key] !== 0,
    );
}

export default function FactureGlobaleTable({
    rows,
    addRowId,
    activeRowId,
    selectedRowId,
    containerRef,
    addRowRef,
    onRowSelect,
    onCellChange,
}: FactureGlobaleTableProps) {
    const { role } = useAuth();
    const isRoleY = role === "Y";

    const [openFilter, setOpenFilter] = useState<string | null>(null);
    const [pinnedFilter, setPinnedFilter] = useState<DateFilterKey | null>(null);
    const [textFilters, setTextFilters] = useState<FactureGlobaleFilters["text"]>({});
    const [dateDrafts, setDateDrafts] = useState<FactureGlobaleFilters["dates"]>({});
    const [dateFilters, setDateFilters] = useState<FactureGlobaleFilters["dates"]>({});
    const [monthPrestationFilter, setMonthPrestationFilter] = useState<FactureGlobaleFilters["monthPrestation"]>({
        month: "",
        year: "",
    });

    const dataRows = useMemo(
        () => rows.filter((row) => row.id !== addRowId),
        [rows, addRowId]
    );

    const addRow = useMemo(
        () => rows.find((row) => row.id === addRowId),
        [rows, addRowId]
    );

    const filteredRows = useMemo(
        () => filterFactureGlobaleRows(dataRows, {
            text: textFilters,
            dates: dateFilters,
            monthPrestation: monthPrestationFilter,
        }),
        [dataRows, textFilters, dateFilters, monthPrestationFilter]
    );

    const visibleRows = useMemo(
        () => [
            ...filteredRows,
            ...(!isRoleY && addRow ? [addRow] : [])
        ],
        [filteredRows, addRow, isRoleY]
    );

    function isTextFilterKey(key: string): key is TextFilterKey {
        return (textFilterKeys as readonly string[]).includes(key);
    }

    function isDateFilterKey(key: string): key is DateFilterKey {
        return (dateFilterKeys as readonly string[]).includes(key);
    }

    const prestationYears = useMemo(
        () => Array.from(new Set(dataRows.flatMap((row) =>
            row.moisPrestation ? [String(row.moisPrestation.getUTCFullYear())] : [],
        ))).sort((a, b) => Number(b) - Number(a)),
        [dataRows],
    );

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

    return (
        <div ref={containerRef} className="min-h-0 flex-1 overflow-auto">
            <table className="h-fit w-max min-w-full table-fixed border-collapse text-sm">

                <thead className="sticky top-0 z-10 bg-slate-900 text-white">
                    <tr>
                        {factureGlobaleColumns.map((column) => {

                            const textKey = isTextFilterKey(column.key) ? column.key : null;
                            const dateKey = isDateFilterKey(column.key) ? column.key : null;
                            const isPrestationMonthFilter = column.key === "moisPrestation";
                            const filterable = textKey !== null || dateKey !== null || isPrestationMonthFilter;
                            const isOpen = openFilter === column.key;

                            const dateRangeDraft = dateKey
                                ? dateDrafts[dateKey] ?? dateFilters[dateKey]
                                : undefined;

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
                                        <div
                                            className="absolute left-0 top-full z-40 w-64 rounded-b-lg border border-slate-200 bg-white p-3 text-slate-800 shadow-xl normal-case"
                                            onClick={(event) => event.stopPropagation()}
                                        >
                                            {isPrestationMonthFilter ? (
                                                <div className="space-y-2">
                                                    <label className="block text-xs font-semibold text-slate-600">
                                                        Mois
                                                        <select
                                                            aria-label="Filtrer par mois de prestation"
                                                            value={monthPrestationFilter.month}
                                                            className="mt-1 w-full rounded-md border border-slate-300 px-2 py-2 text-xs font-normal normal-case outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                                                            onChange={(event) => setMonthPrestationFilter((current) => ({
                                                                ...current,
                                                                month: event.target.value,
                                                            }))}
                                                        >
                                                            <option value="">Tous les mois</option>
                                                            {monthOptions.map((month) => (
                                                                <option key={month.value} value={month.value}>{month.label}</option>
                                                            ))}
                                                        </select>
                                                    </label>
                                                    <label className="block text-xs font-semibold text-slate-600">
                                                        Année
                                                        <select
                                                            aria-label="Filtrer par année de prestation"
                                                            value={monthPrestationFilter.year}
                                                            className="mt-1 w-full rounded-md border border-slate-300 px-2 py-2 text-xs font-normal normal-case outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                                                            onChange={(event) => setMonthPrestationFilter((current) => ({
                                                                ...current,
                                                                year: event.target.value,
                                                            }))}
                                                        >
                                                            <option value="">Toutes les années</option>
                                                            {prestationYears.map((year) => (
                                                                <option key={year} value={year}>{year}</option>
                                                            ))}
                                                        </select>
                                                    </label>
                                                    <button
                                                        type="button"
                                                        className="flex w-full items-center justify-center gap-2 rounded-md border border-slate-300 px-3 py-2 text-xs font-semibold normal-case text-slate-600 hover:bg-slate-100"
                                                        onClick={() => setMonthPrestationFilter({ month: "", year: "" })}
                                                    >
                                                        <X size={14} /> Effacer le filtre
                                                    </button>
                                                </div>
                                            ) : textKey ? (
                                                <div>
                                                    <input
                                                        autoFocus
                                                        type="search"
                                                        placeholder={`Rechercher ${column.label.toLocaleLowerCase()}…`}
                                                        value={textFilters[textKey] ?? ""}
                                                        className="w-full rounded-md border border-slate-300 px-3 py-2 text-xs font-normal normal-case outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                                                        onChange={(event) => setTextFilters((current) => ({
                                                            ...current,
                                                            [textKey]: event.target.value
                                                        }))}
                                                    />

                                                    <button
                                                        type="button"
                                                        className="mt-2 flex w-full items-center justify-center gap-2 rounded-md border border-slate-300 px-3 py-2 text-xs font-semibold normal-case text-slate-600 hover:bg-slate-100"
                                                        onClick={() => clearTextFilter(textKey)}
                                                    >
                                                        <X size={14} /> Effacer le filtre
                                                    </button>
                                                </div>
                                            ) : dateKey ? (
                                                <div className="space-y-2">
                                                    <input
                                                        type="date"
                                                        aria-label="Date de début"
                                                        onFocus={() => {
                                                            setPinnedFilter(dateKey);
                                                            setOpenFilter(dateKey);
                                                        }}
                                                        value={dateDrafts[dateKey]?.from ?? dateFilters[dateKey]?.from ?? ""}
                                                        className="w-full rounded-md border border-slate-300 px-2 py-2 text-xs font-normal normal-case outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                                                        onChange={(event) => setDateDrafts((current) => ({
                                                            ...current,
                                                            [dateKey]: {
                                                                from: event.target.value,
                                                                to: current[dateKey]?.to ?? dateFilters[dateKey]?.to ?? ""
                                                            }
                                                        }))}
                                                    />

                                                    <input
                                                        type="date"
                                                        aria-label="Date de fin"
                                                        onFocus={() => {
                                                            setPinnedFilter(dateKey);
                                                            setOpenFilter(dateKey);
                                                        }}
                                                        value={dateDrafts[dateKey]?.to ?? dateFilters[dateKey]?.to ?? ""}
                                                        className="w-full rounded-md border border-slate-300 px-2 py-2 text-xs font-normal normal-case outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                                                        onChange={(event) => setDateDrafts((current) => ({
                                                            ...current,
                                                            [dateKey]: {
                                                                from: current[dateKey]?.from ?? dateFilters[dateKey]?.from ?? "",
                                                                to: event.target.value
                                                            }
                                                        }))}
                                                    />

                                                    <button
                                                        type="button"
                                                        disabled={!dateRangeDraft?.from || !dateRangeDraft.to}
                                                        className="flex w-full items-center justify-center gap-2 rounded-md bg-red-600 px-3 py-2 text-xs font-semibold text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
                                                        onClick={() => applyDateFilter(dateKey)}
                                                    >
                                                        <Search size={14} /> Rechercher
                                                    </button>

                                                    <button
                                                        type="button"
                                                        className="flex w-full items-center justify-center gap-2 rounded-md border border-slate-300 px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100"
                                                        onClick={() => clearDateFilter(dateKey)}
                                                    >
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

                    {filteredRows.length === 0 &&
                        dataRows.length > 0 &&
                        filterableFiltersActive(textFilters, dateFilters, monthPrestationFilter) && (
                            <tr key="no-results">
                                <td
                                    colSpan={factureGlobaleColumns.length}
                                    className="border-b border-slate-200 px-4 py-6 text-center text-sm text-slate-500"
                                >
                                    Aucune facture ne correspond aux filtres.
                                </td>
                            </tr>
                        )}

                    {visibleRows.map((row) => (
                        <tr
                            key={row.id}
                            ref={row.id === addRowId ? addRowRef : undefined}
                            tabIndex={row.id === addRowId ? -1 : undefined}
                            onClick={() => onRowSelect(row.id)}
                            className={`h-15 ${isRoleY ? "" : "cursor-pointer"} bg-white text-slate-900 hover:bg-slate-50 ${row.id === addRowId ? "focus:relative focus:z-[1] focus:bg-blue-50 focus:[&>td]:border-y-2 focus:[&>td]:border-blue-600 focus:[&>td:first-child]:border-l-2 focus:[&>td:last-child]:border-r-2 focus:[&>td:first-child]:border-l-blue-600 focus:[&>td:last-child]:border-r-blue-600" : ""} ${(activeRowId ?? selectedRowId) === row.id ? "relative z-[1] bg-blue-50 [&>td]:border-y-2 [&>td]:border-blue-600 [&>td:first-child]:border-l-2 [&>td:last-child]:border-r-2 [&>td:first-child]:border-l-blue-600 [&>td:last-child]:border-r-blue-600" : ""}`}
                        >

                            {isRoleY ? (
                                factureGlobaleColumns.map((column) => {
                                    const cellClass = `border border-slate-200 px-2 py-2 ${column.width}`;
                                    if (column.key === "majT5") {
                                        return hasInvoiceData(row) && row.refSocial.trim() ? (
                                            <DropDownCell
                                                key={column.key}
                                                options={DropDownMock}
                                                refSocial={row.refSocial}
                                                className={`${cellClass} bg-yellow-100 text-red-800`}
                                                isLocked={activeRowId !== null}
                                            />
                                        ) : (
                                            <td key={column.key} className={`${cellClass} bg-yellow-100 text-red-800`} />
                                        );
                                    }

                                    const value = row[column.key];
                                    return (
                                        <td key={column.key} className={cellClass}>
                                            {value instanceof Date
                                                ? value.toLocaleDateString("fr-FR", {
                                                    month: "short",
                                                    year: "2-digit",
                                                    timeZone: "UTC",
                                                })
                                                : String(value ?? "")}
                                        </td>
                                    );
                                })
                            ) : row.id !== addRowId ? (

                                factureGlobaleColumns.map((column) => {

                                    const onSave = (nextValue: string) =>
                                        onCellChange(row.id, column.key, nextValue);

                                    const cellClass = `border border-slate-200 px-2 py-2 ${column.width}`;

                                    if (column.key === "majT5") {
                                        return activeRowId === null && hasInvoiceData(row) && row.refSocial.trim() ? (
                                            <DropDownCell
                                                key={column.key}
                                                options={DropDownMock}
                                                refSocial={row.refSocial}
                                                className={`${cellClass} bg-yellow-100 text-red-800`}
                                            />
                                        ) : (
                                            <td
                                                key={column.key}
                                                className={`${cellClass} bg-yellow-100 text-red-800`}
                                            />
                                        );
                                    }

                                    if (column.key === "nomEtablissement") {
                                        return (
                                            <PrestataireDropdownCell
                                                key={column.key}
                                                options={prestatairesMock}
                                                value={row.nomEtablissement}
                                                className={cellClass}
                                                isLocked={activeRowId !== null && activeRowId !== row.id}
                                                onSelect={(prestataire) => {
                                                    onCellChange(row.id, "nomEtablissement", prestataire.nomEtablissement);
                                                    onCellChange(row.id, "localite", prestataire.localite);
                                                }}
                                            />
                                        );
                                    }

                                    const value = row[column.key];

                                    if (column.key === "localite") {
                                        return (
                                            <td
                                                key={column.key}
                                                className={`${cellClass} cursor-default text-slate-600`}
                                                title="La localité est définie par le prestataire sélectionné."
                                            >
                                                {String(row.localite || "—")}
                                            </td>
                                        );
                                    }

                                    if (
                                        column.key === "refSocial"
                                        || !editableUpdateKeys.has(column.key)
                                        || !updateKeys.has(column.key)
                                    ) {
                                        const isLocked = activeRowId !== null && activeRowId !== row.id;
                                        return (
                                            <td
                                                key={column.key}
                                                className={`${cellClass} ${isLocked ? "cursor-not-allowed bg-slate-100 text-slate-400" : "cursor-default"}`}
                                            >
                                                {value instanceof Date
                                                    ? value.toLocaleDateString("fr-FR", {
                                                        month: "short",
                                                        year: "2-digit",
                                                        timeZone: "UTC",
                                                    })
                                                    : String(value ?? "")}
                                            </td>
                                        );
                                    }

                                    if (column.key === "moisPrestation") {
                                        return (
                                            <EditableMonthCell
                                                key={column.key}
                                                value={value as Date | null}
                                                className={cellClass}
                                                isLocked={activeRowId !== null && activeRowId !== row.id}
                                                emptyValue="—"
                                                onSave={(nextValue) => onCellChange(row.id, column.key, nextValue)}
                                            />
                                        );
                                    }

                                    if ((Object.values(dateColumn) as string[]).includes(column.key)) {
                                        return (
                                            <EditableDateCell
                                                key={column.key}
                                                value={value as string}
                                                className={cellClass}
                                                isLocked={activeRowId !== null && activeRowId !== row.id}
                                                emptyValue="—"
                                                onSave={onSave}
                                            />
                                        );
                                    }

                                    if ((Object.values(numberColumn) as string[]).includes(column.key)) {
                                        return (
                                            <EditableNumberCell
                                                key={column.key}
                                                value={value as number}
                                                className={cellClass}
                                                isLocked={activeRowId !== null && activeRowId !== row.id}
                                                emptyValue="—"
                                                onSave={(nextValue) => onCellChange(row.id, column.key, String(nextValue))}
                                            />
                                        );
                                    }

                                    return (
                                        <EditableStringCell
                                            key={column.key}
                                            value={String(value)}
                                            className={cellClass}
                                            isLocked={activeRowId !== null && activeRowId !== row.id}
                                            emptyValue="—"
                                            onSave={onSave}
                                        />
                                    );
                                })

                            ) : (

                                factureGlobaleColumns.map((column) => {

                                    const onSave = (nextValue: string) =>
                                        onCellChange(row.id, column.key, nextValue);

                                    const cellClass = `border border-slate-200 px-2 py-2 ${column.width}`;
                                    const isAddRowLocked = activeRowId !== null && activeRowId !== row.id;

                                    if (column.key === "majT5") {
                                        return (
                                            <td
                                                key={column.key}
                                                className={`${cellClass} bg-yellow-100 text-red-800 ${isAddRowLocked ? "cursor-not-allowed bg-slate-100 text-slate-400" : ""}`}
                                            />
                                        );
                                    }

                                    if (column.key === "nomEtablissement") {
                                        return (
                                            <PrestataireDropdownCell
                                                key={column.key}
                                                options={prestatairesMock}
                                                value={row.nomEtablissement}
                                                className={cellClass}
                                                isLocked={isAddRowLocked}
                                                onSelect={(prestataire) => {
                                                    onCellChange(row.id, "nomEtablissement", prestataire.nomEtablissement);
                                                    onCellChange(row.id, "localite", prestataire.localite);
                                                }}
                                            />
                                        );
                                    }

                                    if (column.key === "localite") {
                                        return (
                                            <td
                                                key={column.key}
                                                className={`${cellClass} cursor-default text-slate-600`}
                                                title="La localité est définie par le prestataire sélectionné."
                                            >
                                                {String(row.localite || "—")}
                                            </td>
                                        );
                                    }

                                    const value = row[column.key];

                                    if (!SaveColumnKey.includes(column.key as SaveColumnKey)) {
                                        return (
                                            <td
                                                key={column.key}
                                                className={`${cellClass} ${isAddRowLocked ? "cursor-not-allowed bg-slate-100 text-slate-400" : "cursor-default"}`}
                                            >
                                                {value instanceof Date
                                                    ? value.toLocaleDateString("fr-FR", {
                                                        month: "short",
                                                        year: "2-digit",
                                                        timeZone: "UTC",
                                                    })
                                                    : value}
                                            </td>
                                        );
                                    }

                                    if (
                                        column.key === "dateReception" ||
                                        column.key === "dateFacture"
                                    ) {
                                        return (
                                            <EditableDateCell
                                                key={column.key}
                                                value={value as string}
                                                className={cellClass}
                                                isLocked={activeRowId !== null && activeRowId !== row.id}
                                                emptyValue="—"
                                                onSave={onSave}
                                            />
                                        );
                                    }

                                    if (column.key === "montantTotal") {
                                        return (
                                            <EditableNumberCell
                                                key={column.key}
                                                value={value as number}
                                                className={cellClass}
                                                isLocked={activeRowId !== null && activeRowId !== row.id}
                                                emptyValue="—"
                                                onSave={(nextValue) =>
                                                    onCellChange(row.id, column.key, String(nextValue))
                                                }
                                            />
                                        );
                                    }

                                    return (
                                        <EditableStringCell
                                            key={column.key}
                                            value={String(value)}
                                            className={cellClass}
                                            isLocked={activeRowId !== null && activeRowId !== row.id}
                                            emptyValue="—"
                                            onSave={onSave}
                                        />
                                    );
                                })
                            )}

                        </tr>
                    ))}

                </tbody>
            </table>
        </div>
    );
}