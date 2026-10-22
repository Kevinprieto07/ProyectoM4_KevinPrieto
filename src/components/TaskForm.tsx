import { useState, type FormEvent } from 'react'
import type { NewTask } from '../types/task'
import { hasErrors, validateTaskDescription, validateTaskTitle } from '../utils/validation'
import { FormField } from './FormField'
import { TextAreaField } from './TextAreaField'

interface TaskFormProps {
  onSubmit: (task: NewTask) => Promise<void>
}

type TaskFormErrors = Partial<Record<'title' | 'description', string>>

export function TaskForm({ onSubmit }: TaskFormProps) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [errors, setErrors] = useState<TaskFormErrors>({})
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const task = { title: title.trim(), description: description.trim() }
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
        value={title}
        onChange={(event) => setTitle(event.target.value)}
        error={errors.title}
      />
      <TextAreaField
        id="task-description"
        label="Descripción (opcional)"
        value={description}
        onChange={(event) => setDescription(event.target.value)}
        error={errors.description}
      />
      <button
        type="submit"
        disabled={submitting}
        className="rounded border px-4 py-2 disabled:opacity-50"
      >
        {submitting ? 'Guardando...' : 'Agregar tarea'}
      </button>
    </form>
  )
}
