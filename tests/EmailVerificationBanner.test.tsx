import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import type { User } from 'firebase/auth'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { EmailVerificationBanner } from '../src/components/EmailVerificationBanner'
import { refreshEmailVerification, resendVerificationEmail } from '../src/services/authService'

vi.mock('../src/services/authService', () => ({
  refreshEmailVerification: vi.fn(),
  resendVerificationEmail: vi.fn(),
}))

const fakeUser = { email: 'kevin@test.com' } as User

function renderBanner() {
  const onVerified = vi.fn()
  render(<EmailVerificationBanner user={fakeUser} onVerified={onVerified} />)
  return { onVerified, user: userEvent.setup() }
}

describe('EmailVerificationBanner', () => {
  beforeEach(() => {
    vi.mocked(refreshEmailVerification).mockReset()
    vi.mocked(resendVerificationEmail).mockReset()
  })

  it('muestra el correo al que se envió el enlace', () => {
    renderBanner()

    expect(screen.getByText('kevin@test.com')).toBeInTheDocument()
  })

  it('reenvía el correo de verificación', async () => {
    vi.mocked(resendVerificationEmail).mockResolvedValue(undefined)
    const { user } = renderBanner()

    await user.click(screen.getByRole('button', { name: 'Reenviar correo' }))

    expect(resendVerificationEmail).toHaveBeenCalledWith(fakeUser)
  })

  it('avisa al componente padre cuando el correo ya está verificado', async () => {
    vi.mocked(refreshEmailVerification).mockResolvedValue(true)
    const { user, onVerified } = renderBanner()

    await user.click(screen.getByRole('button', { name: 'Ya lo verifiqué' }))

    await waitFor(() => expect(onVerified).toHaveBeenCalledTimes(1))
  })

  it('no avisa al padre si el correo sigue sin verificar', async () => {
    vi.mocked(refreshEmailVerification).mockResolvedValue(false)
    const { user, onVerified } = renderBanner()

    await user.click(screen.getByRole('button', { name: 'Ya lo verifiqué' }))

    await waitFor(() => expect(refreshEmailVerification).toHaveBeenCalledWith(fakeUser))
    expect(onVerified).not.toHaveBeenCalled()
  })
})
