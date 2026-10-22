import { useState } from 'react'
import toast from 'react-hot-toast'
import { EmailVerificationBanner } from '../components/EmailVerificationBanner'
import { TaskForm } from '../components/TaskForm'
import { TaskList } from '../components/TaskList'
import { useAuth } from '../hooks/useAuth'
import { useTasks } from '../hooks/useTasks'
import { logout } from '../services/authService'
import { sendSummary } from '../services/summaryService'
import { createTask, deleteTask, toggleTask } from '../services/taskService'
import type { NewTask, Task } from '../types/task'

export function TasksPage() {
  const { user, profile } = useAuth()
  const { tasks, loading } = useTasks(user?.uid ?? null)
  const [sendingSummary, setSendingSummary] = useState(false)
  const [emailVerified, setEmailVerified] = useState(user?.emailVerified ?? false)

  async function handleSendSummary() {
    if (!user || !profile) return
    setSendingSummary(true)
    try {
      const message = await sendSummary(user, profile.username, tasks)
      toast.success(message)
    } catch (error) {
      console.error('No se pudo enviar el resumen:', error)
      toast.error(error instanceof Error ? error.message : 'No se pudo enviar el resumen.')
    } finally {
      setSendingSummary(false)
    }
  }

  async function handleLogout() {
    await logout()
    toast.success('Sesión cerrada')
  }

  async function handleCreate(task: NewTask) {
    if (!user) return
    try {
      await createTask(user.uid, task)
      toast.success('Tarea creada')
    } catch (error) {
      console.error('No se pudo crear la tarea:', error)
      toast.error('No se pudo crear la tarea.')
      throw error
    }
  }

  async function handleToggle(task: Task) {
    try {
      await toggleTask(task.id, !task.completed)
    } catch (error) {
      console.error('No se pudo actualizar la tarea:', error)
      toast.error('No se pudo actualizar la tarea.')
    }
  }

  async function handleDelete(task: Task) {
    if (!window.confirm(`¿Eliminar "${task.title}"?`)) return
    try {
      await deleteTask(task.id)
      toast.success('Tarea eliminada')
    } catch (error) {
      console.error('No se pudo eliminar la tarea:', error)
      toast.error('No se pudo eliminar la tarea.')
    }
  }

  return (
    <main className="mx-auto flex max-w-2xl flex-col gap-6 p-4">
      <header className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Mis tareas</h1>
          <p className="text-sm">
            Hola, {profile?.username} ({user?.email})
          </p>
        </div>
        <button type="button" onClick={handleLogout} className="rounded border px-4 py-2">
          Cerrar sesión
        </button>
      </header>

      {user && !emailVerified && (
        <EmailVerificationBanner user={user} onVerified={() => setEmailVerified(true)} />
      )}

      <TaskForm onSubmit={handleCreate} />

      <div className="flex flex-col gap-1">
        <button
          type="button"
          onClick={handleSendSummary}
          disabled={sendingSummary || tasks.length === 0 || !emailVerified}
          className="rounded border px-4 py-2 disabled:opacity-50"
        >
          {sendingSummary ? 'Enviando...' : 'Enviar resumen por correo'}
        </button>
        {!loading && tasks.length === 0 && (
          <p className="text-center text-sm">Crea una tarea para poder enviar el resumen.</p>
        )}
      </div>

      {loading ? (
        <p className="text-center">Cargando tareas...</p>
      ) : (
        <TaskList tasks={tasks} onToggle={handleToggle} onDelete={handleDelete} />
      )}
    </main>
  )
}
