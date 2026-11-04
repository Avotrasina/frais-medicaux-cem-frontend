import { AlertTriangle, CircleHelp } from 'lucide-react'
import { Modal } from './Modal'

export function ConfirmDialog({ open, title = 'Confirmer la suppression', confirmLabel = 'Supprimer', confirmDisabled = false, message, variant = 'danger', onCancel, onConfirm }: { open: boolean; title?: string; confirmLabel?: string; confirmDisabled?: boolean; message: string; variant?: 'danger' | 'primary'; onCancel: () => void; onConfirm: () => void }) {
	const isDanger = variant === 'danger'
	const Icon = isDanger ? AlertTriangle : CircleHelp
  return (
    <Modal open={open} title={title} onClose={onCancel} width="max-w-md">
	  <div className={`flex gap-4 rounded-2xl p-4 ring-1 ${isDanger ? 'bg-red-50 ring-red-100' : 'bg-blue-50 ring-blue-100'}`}>
	    <div className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${isDanger ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-700'}`}><Icon size={18}/></div>
	    <div><p className={`text-sm font-semibold ${isDanger ? 'text-red-900' : 'text-blue-900'}`}>{isDanger ? 'Attention' : 'Confirmation'}</p><p className={`mt-1 text-sm leading-6 ${isDanger ? 'text-red-800' : 'text-blue-800'}`}>{message}</p></div>
      </div>
      <div className="mt-6 flex justify-end gap-2">
        <button className="btn-secondary" onClick={onCancel}>Annuler</button>
	    <button className={`inline-flex items-center justify-center rounded-xl px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-50 ${isDanger ? 'bg-red-600 hover:bg-red-700' : 'bg-slate-900 hover:bg-slate-800'}`} onClick={onConfirm} disabled={confirmDisabled}>{confirmLabel}</button>
      </div>
    </Modal>
  )
}
