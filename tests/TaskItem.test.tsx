import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { TaskItem } from '../src/components/TaskItem'
import { makeTask } from './mocks/tasks'

function renderItem(task = makeTask()) {
  const onToggle = vi.fn()
  const onEdit = vi.fn()
  const onDelete = vi.fn()
  render(
    <ul>
      <TaskItem task={task} onToggle={onToggle} onEdit={onEdit} onDelete={onDelete} />
    </ul>,
  )
  return { task, onToggle, onEdit, onDelete, user: userEvent.setup() }
}

describe('TaskItem', () => {
  it('muestra el título y la descripción', () => {
    renderItem()

    expect(screen.getByText('Comprar pan')).toBeInTheDocument()
    expect(screen.getByText('Integral')).toBeInTheDocument()
  })

  it('llama a onToggle al marcar la casilla', async () => {
    const { user, task, onToggle } = renderItem()

    await user.click(screen.getByRole('checkbox', { name: 'Comprar pan' }))

    expect(onToggle).toHaveBeenCalledWith(task)
  })

  it('llama a onEdit al pulsar Editar', async () => {
    const { user, task, onEdit } = renderItem()

    await user.click(screen.getByRole('button', { name: 'Editar "Comprar pan"' }))

    expect(onEdit).toHaveBeenCalledWith(task)
  })

  it('llama a onDelete al pulsar Eliminar', async () => {
    const { user, task, onDelete } = renderItem()

    await user.click(screen.getByRole('button', { name: 'Eliminar "Comprar pan"' }))

    expect(onDelete).toHaveBeenCalledWith(task)
  })

  it('marca la casilla y tacha el título si la tarea está completada', () => {
    renderItem(makeTask({ completed: true }))

    expect(screen.getByRole('checkbox', { name: 'Comprar pan' })).toBeChecked()
    expect(screen.getByText('Comprar pan')).toHaveClass('line-through')
  })

  it('no muestra la etiqueta Importante en una tarea normal', () => {
    renderItem()

    expect(screen.queryByText('Importante')).not.toBeInTheDocument()
  })

  it('muestra la etiqueta Importante en rojo si la tarea es importante', () => {
    renderItem(makeTask({ important: true }))

    expect(screen.getByText('Importante')).toHaveClass('text-important')
  })

  it('apaga la etiqueta Importante si la tarea está completada', () => {
    renderItem(makeTask({ important: true, completed: true }))

    expect(screen.getByText('Importante')).toHaveClass('text-important-muted')
  })
})
