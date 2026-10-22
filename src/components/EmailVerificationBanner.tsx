import { useState } from 'react'
import type { User } from 'firebase/auth'
import { Mail } from 'lucide-react'
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
    <section
      role="status"
      className="flex items-start gap-3 rounded-2xl border border-brand-line bg-brand-soft px-4 py-3.5"
    >
      <Mail className="mt-0.5 size-5 shrink-0 text-brand-text" aria-hidden="true" />
      <div className="flex min-w-0 flex-col gap-2.5">
        <p className="text-sm break-words">
          Verifica tu correo para poder enviar resúmenes. Te enviamos un enlace a{' '}
          <strong>{user.email}</strong>.
        </p>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={handleResend}
            disabled={busy}
            className="btn btn-outline px-3 py-1.5 text-[13px]"
          >
            Reenviar correo
          </button>
          <button
            type="button"
            onClick={handleCheck}
            disabled={busy}
            className="btn btn-primary px-3 py-1.5 text-[13px]"
          >
            Ya lo verifiqué
          </button>
        </div>
      </div>
    </section>
  )
}
