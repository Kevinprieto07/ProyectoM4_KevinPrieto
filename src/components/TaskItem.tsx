import type { Task } from '../types/task'

interface TaskItemProps {
  task: Task
  onToggle: (task: Task) => void
  onDelete: (task: Task) => void
}

export function TaskItem({ task, onToggle, onDelete }: TaskItemProps) {
  const checkboxId = `task-${task.id}`

  return (
    <li className="flex items-start gap-3 rounded border p-3">
      <input
        id={checkboxId}
        type="checkbox"
        checked={task.completed}
        onChange={() => onToggle(task)}
        className="mt-1"
      />
      <div className="min-w-0 flex-1">
        <label
          htmlFor={checkboxId}
          className={`block break-words font-medium ${task.completed ? 'line-through' : ''}`}
        >
          {task.title}
        </label>
        {task.description && (
          <p className="whitespace-pre-line break-words text-sm">{task.description}</p>
        )}
      </div>
      <button
        type="button"
        onClick={() => onDelete(task)}
        aria-label={`Eliminar "${task.title}"`}
        className="rounded border px-2 py-1 text-sm"
      >
        Eliminar
      </button>
    </li>
  )
}
