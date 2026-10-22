import { useState, type FormEvent } from 'react'
import toast from 'react-hot-toast'
import { AuthCard } from '../components/AuthCard'
import { FormField } from '../components/FormField'
import { useAuth } from '../hooks/useAuth'
import { logout } from '../services/authService'
import { saveUsername } from '../services/userService'
import { getAuthError, type AuthErrors } from '../utils/authErrors'
import { validateUsername } from '../utils/validation'

export function ChooseUsernamePage() {
  const { user } = useAuth()
  const [username, setUsername] = useState('')
  const [errors, setErrors] = useState<AuthErrors>({})
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!user) return

    const usernameError = validateUsername(username.trim())
    if (usernameError) {
      setErrors({ username: usernameError })
      return
    }

    setErrors({})
    setSubmitting(true)
    try {
      await saveUsername(user, username.trim())
      toast.success(`¡Listo, ${username.trim()}!`)
    } catch (error) {
      setErrors(getAuthError(error))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <AuthCard
      title="Elige tu nombre de usuario"
      subtitle="Es la primera vez que entras. ¿Cómo quieres que te llamemos?"
    >
      <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-3.5">
        <FormField
          id="username"
          label="Nombre de usuario"
          autoComplete="username"
          placeholder="kevin_p"
          value={username}
          onChange={(event) => setUsername(event.target.value)}
          error={errors.username}
        />
        <button type="submit" disabled={submitting} className="btn btn-primary mt-1 w-full">
          {submitting ? 'Guardando...' : 'Continuar'}
        </button>
        {errors.form && <p className="text-center text-sm text-danger-text">{errors.form}</p>}
      </form>

      <p className="text-center text-sm">
        <button type="button" onClick={logout} className="link">
          Usar otra cuenta
        </button>
      </p>
    </AuthCard>
  )
}
