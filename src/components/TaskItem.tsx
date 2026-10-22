import { Check, Pencil, Trash2 } from 'lucide-react'
import type { Task } from '../types/task'

interface TaskItemProps {
  task: Task
  onToggle: (task: Task) => void
  onEdit: (task: Task) => void
  onDelete: (task: Task) => void
}

export function TaskItem({ task, onToggle, onEdit, onDelete }: TaskItemProps) {
  const checkboxId = `task-${task.id}`

  return (
    <li
      className={`flex items-start gap-3.5 rounded-2xl border border-line py-3.5 pr-3 pl-4 transition hover:border-brand-line hover:shadow-[0_6px_18px_-12px_rgb(37_99_235/0.45)] ${task.completed ? 'bg-surface-muted' : 'bg-surface'}`}
    >
      <span className="relative mt-px size-6 shrink-0">
        <input
          id={checkboxId}
          type="checkbox"
          checked={task.completed}
          onChange={() => onToggle(task)}
          className="peer absolute inset-0 cursor-pointer opacity-0"
        />
        <span
          aria-hidden="true"
          className="grid size-6 place-items-center rounded-full border-2 border-line-strong bg-surface transition-colors peer-hover:border-accent peer-focus-visible:ring-3 peer-focus-visible:ring-brand/35 peer-checked:border-accent peer-checked:bg-accent"
        >
          {task.completed && <Check className="size-3.5 text-white" strokeWidth={3.4} />}
        </span>
      </span>
      <div className="flex min-w-0 flex-1 flex-col gap-0.5">
        <label
          htmlFor={checkboxId}
          className={`cursor-pointer break-words ${task.completed ? 'font-medium text-faint line-through' : 'font-semibold'}`}
        >
          {task.title}
        </label>
        {task.description && (
          <p
            className={`text-sm break-words whitespace-pre-line ${task.completed ? 'text-faint' : 'text-muted'}`}
          >
            {task.description}
          </p>
        )}
      </div>
      <div className="flex shrink-0 items-center gap-1">
        {task.important && (
          <span
            className={`mr-1 rounded-full px-2.5 py-0.5 text-xs font-semibold ${task.completed ? 'bg-important-muted-soft text-important-muted' : 'bg-important-soft text-important'}`}
          >
            Importante
          </span>
        )}
        <button
          type="button"
          onClick={() => onEdit(task)}
          aria-label={`Editar "${task.title}"`}
          title="Editar"
          className="icon-btn hover:bg-brand-soft hover:text-brand-text"
        >
          <Pencil className="size-[18px]" aria-hidden="true" />
        </button>
        <button
          type="button"
          onClick={() => onDelete(task)}
          aria-label={`Eliminar "${task.title}"`}
          title="Eliminar"
          className="icon-btn hover:bg-danger-soft hover:text-danger-text"
        >
          <Trash2 className="size-[18px]" aria-hidden="true" />
        </button>
      </div>
    </li>
  )
}
