import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { TaskForm } from '../src/components/TaskForm'

function renderForm(onSubmit = vi.fn().mockResolvedValue(undefined)) {
  render(<TaskForm onSubmit={onSubmit} />)
  return {
    onSubmit,
    user: userEvent.setup(),
    title: screen.getByLabelText('Título'),
    description: screen.getByLabelText('Descripción (opcional)'),
    submit: screen.getByRole('button', { name: 'Guardar tarea' }),
  }
}

describe('TaskForm', () => {
  it('renderiza el título, la descripción y el botón de enviar', () => {
    const { title, description, submit } = renderForm()

    expect(title).toBeInTheDocument()
    expect(description).toBeInTheDocument()
    expect(submit).toBeEnabled()
  })

  it('muestra un error y no envía si el título está vacío', async () => {
    const { user, submit, onSubmit } = renderForm()

    await user.click(submit)

    expect(screen.getByText('Escribe un título.')).toBeInTheDocument()
    expect(onSubmit).not.toHaveBeenCalled()
  })

  it('llama a onSubmit con los datos sin espacios sobrantes y vacía el formulario', async () => {
    const { user, title, description, submit, onSubmit } = renderForm()

    await user.type(title, '  Comprar pan  ')
    await user.type(description, 'Integral')
    await user.click(submit)

    expect(onSubmit).toHaveBeenCalledTimes(1)
    expect(onSubmit).toHaveBeenCalledWith({
      title: 'Comprar pan',
      description: 'Integral',
      important: false,
    })
    await waitFor(() => expect(title).toHaveValue(''))
    expect(description).toHaveValue('')
  })

  it('envía la tarea como importante si se marca la casilla y luego la desmarca', async () => {
    const { user, title, onSubmit } = renderForm()
    const important = screen.getByLabelText('Marcar como importante')

    expect(important).not.toBeChecked()
    await user.type(title, 'Pagar el arriendo')
    await user.click(important)
    await user.click(screen.getByRole('button', { name: 'Guardar tarea' }))

    expect(onSubmit).toHaveBeenCalledWith({
      title: 'Pagar el arriendo',
      description: '',
      important: true,
    })
    await waitFor(() => expect(important).not.toBeChecked())
  })

  it('conserva lo escrito si onSubmit falla', async () => {
    const { user, title, submit } = renderForm(vi.fn().mockRejectedValue(new Error('fallo')))

    await user.type(title, 'Comprar pan')
    await user.click(submit)

    await waitFor(() => expect(submit).toBeEnabled())
    expect(title).toHaveValue('Comprar pan')
  })

  it('se rellena con initialTask y envía los cambios', async () => {
    const onSubmit = vi.fn().mockResolvedValue(undefined)
    render(
      <TaskForm
        onSubmit={onSubmit}
        initialTask={{ title: 'Comprar pan', description: 'Integral', important: true }}
        submitLabel="Guardar cambios"
      />,
    )
    const user = userEvent.setup()
    const title = screen.getByLabelText('Título')

    expect(title).toHaveValue('Comprar pan')
    expect(screen.getByLabelText('Descripción (opcional)')).toHaveValue('Integral')
    expect(screen.getByLabelText('Marcar como importante')).toBeChecked()

    await user.clear(title)
    await user.type(title, 'Comprar leche')
    await user.click(screen.getByLabelText('Marcar como importante'))
    await user.click(screen.getByRole('button', { name: 'Guardar cambios' }))

    expect(onSubmit).toHaveBeenCalledWith({
      title: 'Comprar leche',
      description: 'Integral',
      important: false,
    })
  })

  it('muestra el botón Cancelar solo si se pasa onCancel', async () => {
    const onCancel = vi.fn()
    render(<TaskForm onSubmit={vi.fn()} onCancel={onCancel} />)

    await userEvent.setup().click(screen.getByRole('button', { name: 'Cancelar' }))

    expect(onCancel).toHaveBeenCalledTimes(1)
  })
})
