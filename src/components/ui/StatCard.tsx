import type { LucideIcon } from 'lucide-react'
import { ArrowDownRight, ArrowUpRight } from 'lucide-react'

export function StatCard({ label, value, note, trend, icon: Icon }: { label: string; value: string; note: string; trend?: number; icon: LucideIcon }) {
  const positive = (trend ?? 0) >= 0
  return (
    <div className="panel p-5">
      <div className="flex items-start justify-between gap-4">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-50 text-red-600"><Icon size={19} /></div>
        {trend !== undefined && <span className={`flex items-center gap-0.5 text-xs font-bold ${positive ? 'text-emerald-600' : 'text-red-600'}`}>
          {positive ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}{Math.abs(trend)}%
        </span>}
      </div>
      <div className="mt-4 text-2xl font-extrabold tracking-tight text-slate-900">{value}</div>
      <div className="mt-1 text-sm font-medium text-slate-700">{label}</div>
      <div className="mt-2 text-xs text-slate-400">{note}</div>
    </div>
  )
}
