import { useEffect, useId, useRef, type ReactNode } from 'react'
import { X } from 'lucide-react'

interface ModalProps {
  open: boolean
  title: string
  onClose: () => void
  children: ReactNode
}

export function Modal({ open, title, onClose, children }: ModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null)
  const titleId = useId()

  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return
    if (open && !dialog.open) dialog.showModal()
    if (!open && dialog.open) dialog.close()
  }, [open])

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby={titleId}
      onClose={onClose}
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose()
      }}
      className="m-auto w-[min(480px,calc(100%-2rem))] rounded-2xl border border-line bg-surface p-0 text-ink shadow-2xl backdrop:bg-slate-950/50 backdrop:backdrop-blur-[3px]"
    >
      <div className="flex flex-col gap-5 p-5 sm:p-6">
        <div className="flex items-center justify-between gap-3">
          <h2 id={titleId} className="text-lg font-bold tracking-tight">
            {title}
          </h2>
          <button type="button" onClick={onClose} aria-label="Cerrar" className="icon-btn">
            <X className="size-5" aria-hidden="true" />
          </button>
        </div>
        {open && children}
      </div>
    </dialog>
  )
}
