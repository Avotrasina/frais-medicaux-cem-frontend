import type { ReactNode } from 'react'
import { X } from 'lucide-react'

export function Modal({ open, title, description, onClose, children, width = 'max-w-3xl' }: { open: boolean; title: string; description?: string; onClose: () => void; children: ReactNode; width?: string }) {
  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-950/40 p-0 backdrop-blur-sm md:items-center md:p-6" onMouseDown={(e) => { if (e.target === e.currentTarget) onClose() }}>
      <div className={`w-full ${width} max-h-[92vh] overflow-hidden rounded-t-3xl bg-white shadow-2xl md:rounded-3xl`}>
        <div className="flex items-start justify-between border-b border-slate-100 px-5 py-5 md:px-6">
          <div>
            <h2 className="text-lg font-extrabold text-slate-900">{title}</h2>
            {description && <p className="mt-1 text-sm text-slate-500">{description}</p>}
          </div>
          <button className="rounded-xl p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700" onClick={onClose}><X size={18}/></button>
        </div>
        <div className="max-h-[calc(92vh-82px)] overflow-y-auto p-5 md:p-6">{children}</div>
      </div>
    </div>
  )
}
