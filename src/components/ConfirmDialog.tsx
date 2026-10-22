import type { ReactNode } from 'react'
import { Trash2 } from 'lucide-react'
import { Modal } from './Modal'

interface ConfirmDialogProps {
  open: boolean
  title: string
  message: ReactNode
  confirmLabel: string
  busy?: boolean
  onConfirm: () => void
  onCancel: () => void
}

export function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel,
  busy,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  return (
    <Modal open={open} title={title} onClose={onCancel}>
      <p className="text-muted">{message}</p>
      <div className="flex flex-wrap justify-end gap-2">
        <button type="button" onClick={onCancel} className="btn btn-ghost">
          Cancelar
        </button>
        <button type="button" onClick={onConfirm} disabled={busy} className="btn btn-danger">
          <Trash2 className="size-4" aria-hidden="true" />
          {busy ? 'Eliminando...' : confirmLabel}
        </button>
      </div>
    </Modal>
  )
}
