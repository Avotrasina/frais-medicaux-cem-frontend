import { Download, Filter, Plus, Search } from 'lucide-react'
import type { ReactNode } from 'react'

export function ResourceToolbar({ placeholder = 'Rechercher…', value, onChange, filters = true, actionLabel = 'Ajouter', onAction, extra }: { placeholder?: string; value: string; onChange: (v: string) => void; filters?: boolean; actionLabel?: string; onAction?: () => void; extra?: ReactNode }) {
  return <div className="panel mb-4 p-3"><div className="flex flex-col gap-3 lg:flex-row lg:items-center"><div className="flex min-w-0 flex-1 items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3"><Search size={16} className="shrink-0 text-slate-400"/><input value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} className="h-10 min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-slate-400"/></div><div className="flex flex-wrap items-center gap-2">{filters && <button className="btn-secondary"><Filter size={16}/> Filtres</button>}{extra}<button className="btn-secondary"><Download size={16}/> Exporter</button>{onAction && <button className="btn-primary" onClick={onAction}><Plus size={16}/> {actionLabel}</button>}</div></div></div>
}
