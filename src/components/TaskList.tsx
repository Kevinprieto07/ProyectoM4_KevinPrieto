import type { Task } from '../types/task'
import { TaskItem } from './TaskItem'

interface TaskListProps {
  tasks: Task[]
  onToggle: (task: Task) => void
  onDelete: (task: Task) => void
}

export function TaskList({ tasks, onToggle, onDelete }: TaskListProps) {
  if (tasks.length === 0) {
    return <p className="text-center">No tienes tareas. ¡Crea la primera!</p>
  }

  return (
    <ul className="flex flex-col gap-2">
      {tasks.map((task) => (
        <TaskItem key={task.id} task={task} onToggle={onToggle} onDelete={onDelete} />
      ))}
    </ul>
  )
}
