import type { Task } from '../types/task'

export function splitTasksByStatus(tasks: Task[]) {
  const pending = tasks
    .filter((task) => !task.completed)
    .sort((a, b) => Number(b.important) - Number(a.important))
  const completed = tasks.filter((task) => task.completed)
  return { pending, completed }
}
