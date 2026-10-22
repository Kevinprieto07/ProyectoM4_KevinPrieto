import type { User } from 'firebase/auth'
import type { Task } from '../types/task'

export async function sendSummary(user: User, username: string, tasks: Task[]) {
  const token = await user.getIdToken()
  const pendingTasks = tasks
    .filter((task) => !task.completed)
    .map(({ title, description }) => ({ title, description }))

  const response = await fetch('/api/send-summary', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      username,
      timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      tasks: pendingTasks,
    }),
  })

  const data: { message?: string; error?: string } | null = await response.json().catch(() => null)
  if (!response.ok) {
    throw new Error(data?.error ?? 'No se pudo enviar el resumen.')
  }
  return data?.message ?? 'Resumen enviado'
}
