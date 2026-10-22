import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { TaskList } from '../src/components/TaskList'
import { makeTask } from './mocks/tasks'

describe('TaskList', () => {
  it('muestra el estado vacío con un botón para agregar la primera tarea', async () => {
    const onAdd = vi.fn()
    render(<TaskList tasks={[]} onToggle={vi.fn()} onDelete={vi.fn()} onAdd={onAdd} />)

    expect(screen.getByText('Tu lista está vacía')).toBeInTheDocument()
    expect(screen.queryByRole('list')).not.toBeInTheDocument()

    await userEvent.setup().click(screen.getByRole('button', { name: 'Agregar tarea' }))
    expect(onAdd).toHaveBeenCalledTimes(1)
  })

  it('muestra un elemento por cada tarea', () => {
    const tasks = [
      makeTask({ id: '1', title: 'Comprar pan' }),
      makeTask({ id: '2', title: 'Llamar a mamá' }),
    ]

    render(<TaskList tasks={tasks} onToggle={vi.fn()} onDelete={vi.fn()} onAdd={vi.fn()} />)

    expect(screen.getAllByRole('listitem')).toHaveLength(2)
    expect(screen.getByText('Comprar pan')).toBeInTheDocument()
    expect(screen.getByText('Llamar a mamá')).toBeInTheDocument()
  })
})
