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
    submit: screen.getByRole('button', { name: 'Agregar tarea' }),
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
    expect(onSubmit).toHaveBeenCalledWith({ title: 'Comprar pan', description: 'Integral' })
    await waitFor(() => expect(title).toHaveValue(''))
    expect(description).toHaveValue('')
  })

  it('conserva lo escrito si onSubmit falla', async () => {
    const { user, title, submit } = renderForm(vi.fn().mockRejectedValue(new Error('fallo')))

    await user.type(title, 'Comprar pan')
    await user.click(submit)

    await waitFor(() => expect(submit).toBeEnabled())
    expect(title).toHaveValue('Comprar pan')
  })
})
