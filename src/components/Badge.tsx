import type { ReactNode } from 'react'

type Tone = 'green' | 'amber' | 'red' | 'blue' | 'slate'

export function Badge({ children, tone = 'slate' }: { children: ReactNode; tone?: Tone }) {
  const toneClass: Record<Tone, string> = {
    green: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
    amber: 'bg-amber-50 text-amber-700 ring-amber-200',
    red: 'bg-red-50 text-red-700 ring-red-200',
    blue: 'bg-blue-50 text-blue-700 ring-blue-200',
    slate: 'bg-slate-100 text-slate-600 ring-slate-200',
  }
  return <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-bold ring-1 ${toneClass[tone]}`}>{children}</span>
}

export function statusTone(value: string): Tone {
  const v = value.toUpperCase()
  if (['ACTIVE', 'ACCORDÉE', 'VALIDÉE', 'TERMINEE'].includes(v)) return 'green'
  if (['EN COURS', 'À RAPPROCHER', 'SUSPENDU', 'SUSPENDUE'].includes(v)) return 'amber'
  if (['REFUSÉE', 'LITIGE'].includes(v)) return 'red'
  return 'slate'
}
