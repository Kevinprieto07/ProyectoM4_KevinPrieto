import { Inbox, Plus } from 'lucide-react'

interface EmptyStateProps {
  onAdd: () => void
}

export function EmptyState({ onAdd }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-line-strong bg-surface px-5 py-12 text-center">
      <span className="grid size-14 place-items-center rounded-2xl bg-brand-soft text-brand-text">
        <Inbox className="size-7" aria-hidden="true" />
      </span>
      <h2 className="text-[17px] font-bold">Tu lista está vacía</h2>
      <p className="text-sm text-muted">Agrega tu primera tarea y deja de depender de tu memoria.</p>
      <button type="button" onClick={onAdd} className="btn btn-primary mt-1">
        <Plus className="size-4" aria-hidden="true" />
        Agregar tarea
      </button>
    </div>
  )
}
