import type { ReactNode } from 'react'
import { ChevronLeft, ChevronRight, MoreHorizontal } from 'lucide-react'

export type Column<T> = { key: keyof T | string; label: string; render?: (row: T) => ReactNode; className?: string }

export function DataTable<T extends { id: string | number }>({ rows, columns, onDelete, onEdit, selected, onToggleAll, allSelected, empty = 'Aucun résultat.' }: { rows: T[]; columns: Column<T>[]; onDelete?: (row: T) => void; onEdit?: (row: T) => void; selected?: Set<T['id']>; onToggleAll?: () => void; allSelected?: boolean; empty?: string }) {
  return <div className="table-shell">
    <div className="overflow-x-auto">
      <table className="min-w-full border-collapse text-sm">
        <thead className="bg-slate-50 text-left">
          <tr>{selected && <th className="w-10 border-b border-slate-200 px-4 py-3"><input type="checkbox" checked={allSelected} onChange={onToggleAll}/></th>}{columns.map(c => <th key={String(c.key)} className={`whitespace-nowrap border-b border-slate-200 px-4 py-3 text-[10px] font-extrabold uppercase tracking-wider text-slate-500 ${c.className ?? ''}`}>{c.label}</th>)}{(onDelete || onEdit) && <th className="w-14 border-b border-slate-200 px-4 py-3"/>}</tr>
        </thead>
        <tbody className="divide-y divide-slate-100">{rows.map((row) => <tr key={String(row.id)} className="group hover:bg-slate-50/70">{selected && <td className="px-4 py-3"><input type="checkbox" checked={selected.has(row.id)} onChange={() => {}}/></td>}{columns.map(c => <td key={String(c.key)} className={`whitespace-nowrap px-4 py-3 ${c.className ?? ''}`}>{c.render ? c.render(row) : String((row as any)[c.key] ?? '—')}</td>)}{(onDelete || onEdit) && <td className="px-4 py-3 text-right"><button className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700"><MoreHorizontal size={17}/></button></td>}</tr>)}</tbody>
      </table>
      {!rows.length && <div className="p-10 text-center text-sm text-slate-400">{empty}</div>}
    </div>
    <div className="flex flex-col gap-3 border-t border-slate-100 px-4 py-3 text-xs text-slate-500 sm:flex-row sm:items-center sm:justify-between"><span>Affichage de {rows.length ? 1 : 0} à {rows.length} résultat(s)</span><div className="flex items-center gap-1"><button className="rounded-lg p-1.5 hover:bg-slate-100"><ChevronLeft size={15}/></button><span className="rounded-lg bg-slate-900 px-2.5 py-1.5 font-bold text-white">1</span><button className="rounded-lg p-1.5 hover:bg-slate-100"><ChevronRight size={15}/></button></div></div>
  </div>
}
