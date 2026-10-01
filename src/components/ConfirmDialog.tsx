import { AlertTriangle } from 'lucide-react'
import { Modal } from './Modal'

export function ConfirmDialog({ open, title = 'Confirmer la suppression', message, onCancel, onConfirm }: { open: boolean; title?: string; message: string; onCancel: () => void; onConfirm: () => void }) {
  return (
    <Modal open={open} title={title} onClose={onCancel} width="max-w-md">
      <div className="flex gap-4 rounded-2xl bg-red-50 p-4 ring-1 ring-red-100">
        <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-red-100 text-red-600"><AlertTriangle size={18}/></div>
        <div><p className="text-sm font-semibold text-red-900">Attention</p><p className="mt-1 text-sm leading-6 text-red-800">{message}</p></div>
      </div>
      <div className="mt-6 flex justify-end gap-2">
        <button className="btn-secondary" onClick={onCancel}>Annuler</button>
        <button className="inline-flex items-center justify-center rounded-xl bg-red-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-red-700" onClick={onConfirm}>Supprimer</button>
      </div>
    </Modal>
  )
}
