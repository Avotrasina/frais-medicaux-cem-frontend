import { ChevronLeft, ChevronRight, Pencil, Trash2 } from "lucide-react";
import { useMemo, useState, type ReactNode } from "react";

export type Column<T> = {
	key: keyof T | string;
	label: string;
	render?: (row: T) => ReactNode;
	className?: string;
};

interface DataTableProps<T extends { id: string | number }> {
	rows: T[];
	columns: Column<T>[];
	onDelete?: (row: T) => void;
	onEdit?: (row: T) => void;
	selected?: Set<T["id"]>;
	onToggleAll?: () => void;
	onToggleRow?: (id: T["id"]) => void;
	allSelected?: boolean;
	empty?: string;
	pageSize?: number;
	/** Extra per-row actions rendered before the edit/delete buttons. */
	rowActions?: (row: T) => ReactNode;
}

/**
 * Server-data table.
 *
 * Rows come straight from the API: every screen only maps its payload into the
 * `rows` prop. Pagination is client-side over the loaded page, and the row
 * actions are wired to the handlers passed by the screen.
 */
export function DataTable<T extends { id: string | number }>({
	rows,
	columns,
	onDelete,
	onEdit,
	selected,
	onToggleAll,
	onToggleRow,
	allSelected,
	empty = "Aucun résultat.",
	pageSize = 10,
	rowActions,
}: DataTableProps<T>) {
	const [requestedPage, setRequestedPage] = useState(1);
	const pageCount = Math.max(1, Math.ceil(rows.length / pageSize));
	const hasActions = Boolean(onDelete || onEdit || rowActions);

	// A reload can shrink the list below the requested page: the displayed page
	// is clamped during render, so no corrective effect is needed.
	const page = Math.min(requestedPage, pageCount);

	const visible = useMemo(() => {
		const start = (page - 1) * pageSize;
		return rows.slice(start, start + pageSize);
	}, [rows, page, pageSize]);

	const firstShown = rows.length === 0 ? 0 : (page - 1) * pageSize + 1;
	const lastShown = Math.min(page * pageSize, rows.length);

	return (
		<div className="table-shell">
			<div className="overflow-x-auto">
				<table className="min-w-full border-collapse text-[15px]">
					<thead className="bg-slate-50 text-left">
						<tr>
							{selected && (
								<th className="w-10 border-b border-slate-200 px-4 py-3">
									<input
										type="checkbox"
										checked={Boolean(allSelected)}
										onChange={onToggleAll}
										aria-label="Tout sélectionner"
									/>
								</th>
							)}
							{columns.map((column) => (
								<th
									key={String(column.key)}
									className={`whitespace-nowrap border-b border-slate-200 px-4 py-3 text-xs font-bold uppercase text-slate-600 ${column.className ?? ""}`}
								>
									{column.label}
								</th>
							))}
							{hasActions && (
								<th className="w-24 border-b border-slate-200 px-4 py-3" />
							)}
						</tr>
					</thead>
					<tbody className="divide-y divide-slate-100">
						{visible.map((row) => (
							<tr key={String(row.id)} className="group hover:bg-slate-50/70">
								{selected && (
									<td className="px-4 py-3">
										<input
											type="checkbox"
											checked={selected.has(row.id)}
											onChange={() => onToggleRow?.(row.id)}
											aria-label="Sélectionner la ligne"
										/>
									</td>
								)}
								{columns.map((column) => (
									<td
										key={String(column.key)}
										className={`whitespace-nowrap px-4 py-3 ${column.className ?? ""}`}
									>
										{column.render
											? column.render(row)
											: String(
													(row as Record<string, unknown>)[
														column.key as string
													] ?? "—",
												)}
									</td>
								))}
								{hasActions && (
									<td className="px-4 py-3 text-right">
										<div className="flex justify-end gap-1">
											{rowActions?.(row)}
											{onEdit && (
												<button
													className="btn-ghost"
													title="Modifier"
													aria-label="Modifier"
													onClick={() => onEdit(row)}
												>
													<Pencil size={15} />
												</button>
											)}
											{onDelete && (
												<button
													className="btn-ghost text-red-600"
													title="Demander la suppression"
													aria-label="Demander la suppression"
													onClick={() => onDelete(row)}
												>
													<Trash2 size={15} />
												</button>
											)}
										</div>
									</td>
								)}
							</tr>
						))}
					</tbody>
				</table>
				{!rows.length && (
					<div className="p-10 text-center text-sm text-slate-400">{empty}</div>
				)}
			</div>
			<div className="flex flex-col gap-3 border-t border-slate-100 px-4 py-3 text-sm text-slate-600 sm:flex-row sm:items-center sm:justify-between">
				<span>
					Affichage de {firstShown} à {lastShown} sur {rows.length} résultat(s)
				</span>
				<div className="flex items-center gap-1">
					<button
						className="rounded-lg p-1.5 hover:bg-slate-100 disabled:opacity-40"
						onClick={() =>
							setRequestedPage((current) => Math.max(1, current - 1))
						}
						disabled={page <= 1}
						aria-label="Page précédente"
					>
						<ChevronLeft size={15} />
					</button>
					{pageNumbers(page, pageCount).map((entry, index) =>
						entry === "…" ? (
							<span key={`gap-${index}`} className="px-1.5 text-slate-400">
								…
							</span>
						) : (
							<button
								key={entry}
								onClick={() => setRequestedPage(entry)}
								className={
									entry === page
										? "rounded-lg bg-slate-900 px-2.5 py-1.5 font-bold text-white"
										: "rounded-lg px-2.5 py-1.5 font-semibold hover:bg-slate-100"
								}
							>
								{entry}
							</button>
						),
					)}
					<button
						className="rounded-lg p-1.5 hover:bg-slate-100 disabled:opacity-40"
						onClick={() =>
							setRequestedPage((current) => Math.min(pageCount, current + 1))
						}
						disabled={page >= pageCount}
						aria-label="Page suivante"
					>
						<ChevronRight size={15} />
					</button>
				</div>
			</div>
		</div>
	);
}

/** Compact pager: first, last, current ± 1, with ellipsis gaps. */
function pageNumbers(page: number, pageCount: number): (number | "…")[] {
	if (pageCount <= 7) {
		return Array.from({ length: pageCount }, (_, index) => index + 1);
	}
	const pages = new Set<number>([1, pageCount, page, page - 1, page + 1]);
	const sorted = [...pages]
		.filter((value) => value >= 1 && value <= pageCount)
		.sort((left, right) => left - right);

	const result: (number | "…")[] = [];
	sorted.forEach((value, index) => {
		if (index > 0 && value - sorted[index - 1] > 1) {
			result.push("…");
		}
		result.push(value);
	});
	return result;
}
