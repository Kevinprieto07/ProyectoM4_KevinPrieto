import toast from 'react-hot-toast'
import { TaskForm } from '../components/TaskForm'
import { TaskList } from '../components/TaskList'
import { useAuth } from '../hooks/useAuth'
import { useTasks } from '../hooks/useTasks'
import { logout } from '../services/authService'
import { createTask, deleteTask, toggleTask } from '../services/taskService'
import type { NewTask, Task } from '../types/task'

export function TasksPage() {
  const { user, profile } = useAuth()
  const { tasks, loading } = useTasks(user?.uid ?? null)

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

      <TaskForm onSubmit={handleCreate} />

      {loading ? (
        <p className="text-center">Cargando tareas...</p>
      ) : (
        <TaskList tasks={tasks} onToggle={handleToggle} onDelete={handleDelete} />
      )}
    </main>
  )
}
