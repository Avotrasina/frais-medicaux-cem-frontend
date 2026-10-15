import { Check, Pencil, X } from 'lucide-react'
import { useEffect, useState } from 'react'

export function InlineCell({ value, onSave, type = 'text' }: { value: string; onSave: (value: string) => void; type?: 'text' | 'select'; }) {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(value)
  useEffect(() => setDraft(value), [value])
  const commit = () => { onSave(draft); setEditing(false) }
  if (!editing) return <button onClick={() => setEditing(true)} className="group inline-flex max-w-full items-center gap-2 text-left text-sm text-slate-700 hover:text-slate-950"><span className="truncate">{value || '—'}</span><Pencil size={13} className="shrink-0 text-slate-300 opacity-0 transition group-hover:opacity-100"/></button>
  if (type === 'select') return <div className="flex items-center gap-1"><select autoFocus className="h-8 rounded-lg border border-red-300 px-2 text-xs outline-none" value={draft} onChange={(e) => setDraft(e.target.value)}><option>ACTIVE</option><option>SUSPENDU</option><option>RETRAITE</option><option>PUBLIC</option><option>PRIVE</option><option>AGENT</option><option>CHEF_SERVICE</option><option>CHEF_AGENCE</option><option>DIRECTEUR</option><option>DIRECTION</option><option>AGENCE</option></select><button className="rounded-lg p-1.5 text-emerald-600 hover:bg-emerald-50" onClick={commit}><Check size={14}/></button><button className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100" onClick={() => setEditing(false)}><X size={14}/></button></div>
  return <div className="flex items-center gap-1"><input autoFocus className="h-8 min-w-32 rounded-lg border border-red-300 px-2 text-xs outline-none" value={draft} onChange={(e) => setDraft(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') commit(); if (e.key === 'Escape') setEditing(false) }}/><button className="rounded-lg p-1.5 text-emerald-600 hover:bg-emerald-50" onClick={commit}><Check size={14}/></button><button className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100" onClick={() => setEditing(false)}><X size={14}/></button></div>
}
