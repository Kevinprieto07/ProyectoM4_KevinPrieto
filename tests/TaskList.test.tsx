import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { TaskList } from '../src/components/TaskList'
import { makeTask } from './mocks/tasks'

describe('TaskList', () => {
  it('muestra un mensaje cuando no hay tareas', () => {
    render(<TaskList tasks={[]} onToggle={vi.fn()} onDelete={vi.fn()} />)

    expect(screen.getByText('No tienes tareas. ¡Crea la primera!')).toBeInTheDocument()
    expect(screen.queryByRole('list')).not.toBeInTheDocument()
  })

  it('muestra un elemento por cada tarea', () => {
    const tasks = [
      makeTask({ id: '1', title: 'Comprar pan' }),
      makeTask({ id: '2', title: 'Llamar a mamá' }),
    ]

    render(<TaskList tasks={tasks} onToggle={vi.fn()} onDelete={vi.fn()} />)

    expect(screen.getAllByRole('listitem')).toHaveLength(2)
    expect(screen.getByText('Comprar pan')).toBeInTheDocument()
    expect(screen.getByText('Llamar a mamá')).toBeInTheDocument()
  })
})
