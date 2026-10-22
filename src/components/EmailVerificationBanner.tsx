import { useState } from 'react'
import type { User } from 'firebase/auth'
import toast from 'react-hot-toast'
import { refreshEmailVerification, resendVerificationEmail } from '../services/authService'
import { getAuthError } from '../utils/authErrors'

interface EmailVerificationBannerProps {
  user: User
  onVerified: () => void
}

export function EmailVerificationBanner({ user, onVerified }: EmailVerificationBannerProps) {
  const [busy, setBusy] = useState(false)

  async function handleResend() {
    setBusy(true)
    try {
      await resendVerificationEmail(user)
      toast.success('Te enviamos un nuevo enlace de verificación.')
    } catch (error) {
      toast.error(getAuthError(error).form ?? 'No se pudo enviar el enlace.')
    } finally {
      setBusy(false)
    }
  }

  async function handleCheck() {
    setBusy(true)
    try {
      const verified = await refreshEmailVerification(user)
      if (verified) {
        toast.success('¡Correo verificado!')
        onVerified()
      } else {
        toast.error('Todavía no has verificado tu correo. Revisa tu bandeja y la carpeta de spam.')
      }
    } catch (error) {
      toast.error(getAuthError(error).form ?? 'No se pudo comprobar la verificación.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <section role="status" className="flex flex-col gap-2 rounded border p-3">
      <p>
        Verifica tu correo para poder enviar resúmenes. Te enviamos un enlace a{' '}
        <strong>{user.email}</strong>.
      </p>
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={handleResend}
          disabled={busy}
          className="rounded border px-3 py-1 disabled:opacity-50"
        >
          Reenviar correo
        </button>
        <button
          type="button"
          onClick={handleCheck}
          disabled={busy}
          className="rounded border px-3 py-1 disabled:opacity-50"
        >
          Ya lo verifiqué
        </button>
      </div>
    </section>
  )
}
