import { useState } from 'react'
import toast from 'react-hot-toast'
import { loginWithGoogle } from '../services/authService'
import { getAuthError, type AuthErrors } from '../utils/authErrors'

interface GoogleButtonProps {
  disabled?: boolean
  onErrors: (errors: AuthErrors) => void
}

export function GoogleButton({ disabled, onErrors }: GoogleButtonProps) {
  const [loading, setLoading] = useState(false)

  async function handleClick() {
    onErrors({})
    setLoading(true)
    try {
      await loginWithGoogle()
      toast.success('¡Bienvenido!')
    } catch (error) {
      onErrors(getAuthError(error))
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={disabled || loading}
      className="w-full rounded border px-4 py-2 disabled:opacity-50"
    >
      {loading ? 'Conectando con Google...' : 'Continuar con Google'}
    </button>
  )
}
