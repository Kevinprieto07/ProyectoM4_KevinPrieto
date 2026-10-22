import { useId, type ReactNode } from 'react'
import { Trophy } from 'lucide-react'
import type { Task } from '../types/task'
import { splitTasksByStatus } from '../utils/taskSections'
import { EmptyState } from './EmptyState'
import { TaskItem } from './TaskItem'

interface TaskListProps {
  tasks: Task[]
  onToggle: (task: Task) => void
  onEdit: (task: Task) => void
  onDelete: (task: Task) => void
  onAdd: () => void
}

interface TaskSectionProps {
  title: string
  count: number
  countClassName: string
  children: ReactNode
}

function TaskSection({ title, count, countClassName, children }: TaskSectionProps) {
  const headingId = useId()

  return (
    <section aria-labelledby={headingId} className="flex flex-col gap-2.5">
      <h2
        id={headingId}
        className="flex items-center gap-2 text-xs font-bold tracking-wider text-muted uppercase"
      >
        {title}
        <span className={`tabular-nums ${countClassName}`}>· {count}</span>
      </h2>
      {children}
    </section>
  )
}

export function TaskList({ tasks, onToggle, onEdit, onDelete, onAdd }: TaskListProps) {
  if (tasks.length === 0) {
    return <EmptyState onAdd={onAdd} />
  }

  const { pending, completed } = splitTasksByStatus(tasks)

  const renderItems = (items: Task[]) => (
    <ul className="flex flex-col gap-2.5">
      {items.map((task) => (
        <TaskItem
          key={task.id}
          task={task}
          onToggle={onToggle}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </ul>
  )

  return (
    <div className="flex flex-col gap-7">
      <TaskSection title="Pendientes" count={pending.length} countClassName="text-brand-text">
        {pending.length > 0 ? (
          renderItems(pending)
        ) : (
          <p className="flex items-center justify-center gap-2.5 rounded-2xl border border-dashed border-line bg-surface-muted px-4 py-5 text-sm text-faint">
            No tienes tareas pendientes
            <Trophy className="size-5" aria-hidden="true" />
          </p>
        )}
      </TaskSection>

      {completed.length > 0 && (
        <TaskSection title="Completadas" count={completed.length} countClassName="text-accent-text">
          {renderItems(completed)}
        </TaskSection>
      )}
    </div>
  )
}
