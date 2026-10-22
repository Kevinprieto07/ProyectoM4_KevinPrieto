import { useState, type FormEvent } from 'react'
import type { NewTask } from '../types/task'
import { hasErrors, validateTaskDescription, validateTaskTitle } from '../utils/validation'
import { FormField } from './FormField'
import { TextAreaField } from './TextAreaField'

interface TaskFormProps {
  onSubmit: (task: NewTask) => Promise<void>
  onCancel?: () => void
  initialTask?: NewTask
  submitLabel?: string
}

type TaskFormErrors = Partial<Record<'title' | 'description', string>>

export function TaskForm({
  onSubmit,
  onCancel,
  initialTask,
  submitLabel = 'Guardar tarea',
}: TaskFormProps) {
  const [title, setTitle] = useState(initialTask?.title ?? '')
  const [description, setDescription] = useState(initialTask?.description ?? '')
  const [important, setImportant] = useState(initialTask?.important ?? false)
  const [errors, setErrors] = useState<TaskFormErrors>({})
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const task = { title: title.trim(), description: description.trim(), important }
    const validationErrors: TaskFormErrors = {
      title: validateTaskTitle(task.title),
      description: validateTaskDescription(task.description),
    }
    if (hasErrors(validationErrors)) {
      setErrors(validationErrors)
      return
    }

    setErrors({})
    setSubmitting(true)
    try {
      await onSubmit(task)
      setTitle('')
      setDescription('')
      setImportant(false)
    } catch {
      return
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
      <FormField
        id="task-title"
        label="Título"
        placeholder="Ej.: Comprar pan"
        autoFocus
        value={title}
        onChange={(event) => setTitle(event.target.value)}
        error={errors.title}
      />
      <TextAreaField
        id="task-description"
        label="Descripción"
        hint="(opcional)"
        placeholder="Detalles, lugar, hora…"
        value={description}
        onChange={(event) => setDescription(event.target.value)}
        error={errors.description}
      />
      <label
        htmlFor="task-important"
        className="flex w-fit cursor-pointer items-center gap-2.5 text-sm font-medium select-none"
      >
        <input
          id="task-important"
          type="checkbox"
          checked={important}
          onChange={(event) => setImportant(event.target.checked)}
          className="size-[18px] cursor-pointer accent-important"
        />
        Marcar como importante
      </label>
      <div className="flex flex-wrap justify-end gap-2">
        {onCancel && (
          <button type="button" onClick={onCancel} className="btn btn-ghost">
            Cancelar
          </button>
        )}
        <button type="submit" disabled={submitting} className="btn btn-primary">
          {submitting ? 'Guardando...' : submitLabel}
        </button>
      </div>
    </form>
  )
}
