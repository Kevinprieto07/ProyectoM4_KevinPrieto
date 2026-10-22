import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { FirebaseError } from 'firebase/app'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { LoginPage } from '../src/pages/LoginPage'
import { loginWithEmail } from '../src/services/authService'

vi.mock('../src/services/authService', () => ({
  loginWithEmail: vi.fn(),
  loginWithGoogle: vi.fn(),
}))

function renderLogin() {
  render(
    <MemoryRouter>
      <LoginPage />
    </MemoryRouter>,
  )
  return {
    user: userEvent.setup(),
    email: screen.getByLabelText('Correo electrónico'),
    password: screen.getByLabelText('Contraseña'),
    submit: screen.getByRole('button', { name: 'Entrar' }),
  }
}

describe('LoginPage', () => {
  beforeEach(() => {
    vi.mocked(loginWithEmail).mockReset()
  })

  it('muestra los errores debajo de cada campo y no llama a Firebase', async () => {
    const { user, submit } = renderLogin()

    await user.click(submit)

    expect(screen.getByText('Escribe tu correo electrónico.')).toBeInTheDocument()
    expect(screen.getByText('Escribe tu contraseña.')).toBeInTheDocument()
    expect(loginWithEmail).not.toHaveBeenCalled()
  })

  it('inicia sesión con el correo y la contraseña escritos', async () => {
    vi.mocked(loginWithEmail).mockResolvedValue(undefined)
    const { user, email, password, submit } = renderLogin()

    await user.type(email, 'kevin@test.com')
    await user.type(password, '123456')
    await user.click(submit)

    expect(loginWithEmail).toHaveBeenCalledWith('kevin@test.com', '123456')
  })

  it('muestra un error claro si Firebase rechaza las credenciales', async () => {
    vi.mocked(loginWithEmail).mockRejectedValue(
      new FirebaseError('auth/invalid-credential', 'Firebase: Error (auth/invalid-credential).'),
    )
    const { user, email, password, submit } = renderLogin()

    await user.type(email, 'kevin@test.com')
    await user.type(password, 'incorrecta')
    await user.click(submit)

    expect(await screen.findByText('Correo o contraseña incorrectos.')).toBeInTheDocument()
  })
})
