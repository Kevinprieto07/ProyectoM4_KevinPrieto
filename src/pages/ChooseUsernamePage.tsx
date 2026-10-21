import { useState, type FormEvent } from 'react'
import toast from 'react-hot-toast'
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
    <main className="mx-auto flex max-w-md flex-col gap-4 p-4">
      <h1 className="text-2xl font-bold">Elige tu nombre de usuario</h1>
      <p>Es la primera vez que entras. ¿Cómo quieres que te llamemos?</p>

      <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
        <FormField
          id="username"
          label="Nombre de usuario"
          autoComplete="username"
          value={username}
          onChange={(event) => setUsername(event.target.value)}
          error={errors.username}
        />

        <button
          type="submit"
          disabled={submitting}
          className="rounded border px-4 py-2 disabled:opacity-50"
        >
          {submitting ? 'Guardando...' : 'Continuar'}
        </button>
        {errors.form && <p className="text-sm text-red-600">{errors.form}</p>}
      </form>

      <button type="button" onClick={logout} className="underline">
        Usar otra cuenta
      </button>
    </main>
  )
}
