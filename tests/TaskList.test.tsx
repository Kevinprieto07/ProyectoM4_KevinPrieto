import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { TaskList } from '../src/components/TaskList'
import { makeTask } from './mocks/tasks'

describe('TaskList', () => {
  it('muestra el estado vacío con un botón para agregar la primera tarea', async () => {
    const onAdd = vi.fn()
    render(
      <TaskList tasks={[]} onToggle={vi.fn()} onEdit={vi.fn()} onDelete={vi.fn()} onAdd={onAdd} />,
    )

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

    render(
      <TaskList
        tasks={tasks}
        onToggle={vi.fn()}
        onEdit={vi.fn()}
        onDelete={vi.fn()}
        onAdd={vi.fn()}
      />,
    )

    expect(screen.getAllByRole('listitem')).toHaveLength(2)
    expect(screen.getByText('Comprar pan')).toBeInTheDocument()
    expect(screen.getByText('Llamar a mamá')).toBeInTheDocument()
  })

  it('separa las tareas en Pendientes y Completadas, con las importantes primero', () => {
    const tasks = [
      makeTask({ id: '1', title: 'Comprar pan' }),
      makeTask({ id: '2', title: 'Estudiar cálculo', important: true }),
      makeTask({ id: '3', title: 'Pagar el arriendo', completed: true }),
    ]

    render(
      <TaskList
        tasks={tasks}
        onToggle={vi.fn()}
        onEdit={vi.fn()}
        onDelete={vi.fn()}
        onAdd={vi.fn()}
      />,
    )

    const pending = screen.getByRole('region', { name: /pendientes/i })
    const completed = screen.getByRole('region', { name: /completadas/i })
    const pendingItems = within(pending).getAllByRole('listitem')

    expect(pendingItems).toHaveLength(2)
    expect(pendingItems[0]).toHaveTextContent('Estudiar cálculo')
    expect(pendingItems[1]).toHaveTextContent('Comprar pan')
    expect(within(completed).getByText('Pagar el arriendo')).toBeInTheDocument()
  })

  it('muestra el trofeo cuando no hay pendientes y oculta Completadas si está vacía', () => {
    const { rerender } = render(
      <TaskList
        tasks={[makeTask({ id: '1', completed: true })]}
        onToggle={vi.fn()}
        onEdit={vi.fn()}
        onDelete={vi.fn()}
        onAdd={vi.fn()}
      />,
    )

    expect(screen.getByText('No tienes tareas pendientes')).toBeInTheDocument()

    rerender(
      <TaskList
        tasks={[makeTask({ id: '2' })]}
        onToggle={vi.fn()}
        onEdit={vi.fn()}
        onDelete={vi.fn()}
        onAdd={vi.fn()}
      />,
    )

    expect(screen.queryByRole('region', { name: /completadas/i })).not.toBeInTheDocument()
  })
})
