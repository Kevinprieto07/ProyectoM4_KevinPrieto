import type { Task } from '../types/task'
import { EmptyState } from './EmptyState'
import { TaskItem } from './TaskItem'

interface TaskListProps {
  tasks: Task[]
  onToggle: (task: Task) => void
  onDelete: (task: Task) => void
  onAdd: () => void
}

export function TaskList({ tasks, onToggle, onDelete, onAdd }: TaskListProps) {
  if (tasks.length === 0) {
    return <EmptyState onAdd={onAdd} />
  }

  return (
    <ul className="flex flex-col gap-2.5">
      {tasks.map((task) => (
        <TaskItem key={task.id} task={task} onToggle={onToggle} onDelete={onDelete} />
      ))}
    </ul>
  )
}
