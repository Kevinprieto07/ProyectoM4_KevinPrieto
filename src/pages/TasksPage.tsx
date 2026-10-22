import { useState } from 'react'
import { Mail, Plus } from 'lucide-react'
import toast from 'react-hot-toast'
import { ConfirmDialog } from '../components/ConfirmDialog'
import { EmailVerificationBanner } from '../components/EmailVerificationBanner'
import { LoadingScreen } from '../components/LoadingScreen'
import { Modal } from '../components/Modal'
import { TaskForm } from '../components/TaskForm'
import { TaskList } from '../components/TaskList'
import { useAuth } from '../hooks/useAuth'
import { useTasks } from '../hooks/useTasks'
import { sendSummary } from '../services/summaryService'
import { createTask, deleteTask, toggleTask, updateTask } from '../services/taskService'
import type { NewTask, Task } from '../types/task'

export function TasksPage() {
  const { user, profile } = useAuth()
  const { tasks, loading } = useTasks(user?.uid ?? null)
  const [sendingSummary, setSendingSummary] = useState(false)
  const [emailVerified, setEmailVerified] = useState(user?.emailVerified ?? false)
  const [addOpen, setAddOpen] = useState(false)
  const [taskToEdit, setTaskToEdit] = useState<Task | null>(null)
  const [taskToDelete, setTaskToDelete] = useState<Task | null>(null)
  const [deleting, setDeleting] = useState(false)

  const summaryHint = !emailVerified
    ? 'Verifica tu correo para poder enviar el resumen.'
    : tasks.length === 0
      ? 'Crea una tarea para poder enviar el resumen.'
      : null

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

  async function handleCreate(task: NewTask) {
    if (!user) return
    try {
      await createTask(user.uid, task)
      setAddOpen(false)
      toast.success('Tarea creada')
    } catch (error) {
      console.error('No se pudo crear la tarea:', error)
      toast.error('No se pudo crear la tarea.')
      throw error
    }
  }

  async function handleUpdate(changes: NewTask) {
    if (!taskToEdit) return
    try {
      await updateTask(taskToEdit.id, changes)
      setTaskToEdit(null)
      toast.success('Tarea actualizada')
    } catch (error) {
      console.error('No se pudo actualizar la tarea:', error)
      toast.error('No se pudo actualizar la tarea.')
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

  async function handleConfirmDelete() {
    if (!taskToDelete) return
    setDeleting(true)
    try {
      await deleteTask(taskToDelete.id)
      setTaskToDelete(null)
      toast.success('Tarea eliminada')
    } catch (error) {
      console.error('No se pudo eliminar la tarea:', error)
      toast.error('No se pudo eliminar la tarea.')
    } finally {
      setDeleting(false)
    }
  }

  return (
    <main className="mx-auto flex w-full max-w-2xl flex-col gap-5 px-4 py-7 sm:py-10">
      {user && !emailVerified && (
        <EmailVerificationBanner user={user} onVerified={() => setEmailVerified(true)} />
      )}

      <h1 className="text-2xl font-bold tracking-tight sm:text-[26px]">Mis tareas</h1>

      <div className="flex flex-col gap-2">
        <div className="flex flex-col gap-2.5 sm:flex-row">
          <button type="button" onClick={() => setAddOpen(true)} className="btn btn-primary">
            <Plus className="size-[18px]" aria-hidden="true" />
            Agregar tarea
          </button>
          <button
            type="button"
            onClick={handleSendSummary}
            disabled={sendingSummary || summaryHint !== null}
            className="btn btn-outline"
          >
            <Mail className="size-[18px]" aria-hidden="true" />
            {sendingSummary ? 'Enviando...' : 'Enviar resumen'}
          </button>
        </div>
        {!loading && summaryHint && <p className="text-[13px] text-muted">{summaryHint}</p>}
      </div>

      {loading ? (
        <LoadingScreen />
      ) : (
        <TaskList
          tasks={tasks}
          onToggle={handleToggle}
          onEdit={setTaskToEdit}
          onDelete={setTaskToDelete}
          onAdd={() => setAddOpen(true)}
        />
      )}

      <Modal open={addOpen} title="Nueva tarea" onClose={() => setAddOpen(false)}>
        <TaskForm onSubmit={handleCreate} onCancel={() => setAddOpen(false)} />
      </Modal>

      <Modal open={taskToEdit !== null} title="Editar tarea" onClose={() => setTaskToEdit(null)}>
        {taskToEdit && (
          <TaskForm
            key={taskToEdit.id}
            initialTask={{
              title: taskToEdit.title,
              description: taskToEdit.description,
              important: taskToEdit.important,
            }}
            submitLabel="Guardar cambios"
            onSubmit={handleUpdate}
            onCancel={() => setTaskToEdit(null)}
          />
        )}
      </Modal>

      <ConfirmDialog
        open={taskToDelete !== null}
        title="¿Eliminar esta tarea?"
        message={
          <>
            <strong className="text-ink">“{taskToDelete?.title}”</strong> se eliminará de forma
            permanente.
          </>
        }
        confirmLabel="Eliminar"
        busy={deleting}
        onConfirm={handleConfirmDelete}
        onCancel={() => setTaskToDelete(null)}
      />
    </main>
  )
}
