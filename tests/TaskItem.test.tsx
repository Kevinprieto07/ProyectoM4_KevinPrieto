import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { TaskItem } from '../src/components/TaskItem'
import { makeTask } from './mocks/tasks'

function renderItem(task = makeTask()) {
  const onToggle = vi.fn()
  const onDelete = vi.fn()
  render(
    <ul>
      <TaskItem task={task} onToggle={onToggle} onDelete={onDelete} />
    </ul>,
  )
  return { task, onToggle, onDelete, user: userEvent.setup() }
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
})
