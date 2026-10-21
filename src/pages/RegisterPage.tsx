import { useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import toast from 'react-hot-toast'
import { FormField } from '../components/FormField'
import { GoogleButton } from '../components/GoogleButton'
import { ROUTES } from '../routes/paths'
import { registerWithEmail } from '../services/authService'
import { getAuthError, type AuthErrors } from '../utils/authErrors'
import {
  hasErrors,
  validateEmail,
  validatePassword,
  validatePasswordConfirmation,
  validateUsername,
} from '../utils/validation'

export function RegisterPage() {
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [errors, setErrors] = useState<AuthErrors>({})
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const validationErrors: AuthErrors = {
      username: validateUsername(username.trim()),
      email: validateEmail(email.trim()),
      password: validatePassword(password),
      confirmPassword: validatePasswordConfirmation(password, confirmPassword),
    }
    if (hasErrors(validationErrors)) {
      setErrors(validationErrors)
      return
    }

    setErrors({})
    setSubmitting(true)
    try {
      await registerWithEmail(username.trim(), email.trim(), password)
      toast.success(`¡Bienvenido, ${username.trim()}!`)
    } catch (error) {
      setErrors(getAuthError(error))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <main className="mx-auto flex max-w-md flex-col gap-4 p-4">
      <h1 className="text-2xl font-bold">Crear cuenta</h1>

      <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
        <FormField
          id="username"
          label="Nombre de usuario"
          autoComplete="username"
          value={username}
          onChange={(event) => setUsername(event.target.value)}
          error={errors.username}
        />
        <FormField
          id="email"
          label="Correo electrónico"
          type="email"
          autoComplete="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          error={errors.email}
        />
        <FormField
          id="password"
          label="Contraseña"
          type="password"
          autoComplete="new-password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          error={errors.password}
        />
        <FormField
          id="confirmPassword"
          label="Confirmar contraseña"
          type="password"
          autoComplete="new-password"
          value={confirmPassword}
          onChange={(event) => setConfirmPassword(event.target.value)}
          error={errors.confirmPassword}
        />

        <button
          type="submit"
          disabled={submitting}
          className="rounded border px-4 py-2 disabled:opacity-50"
        >
          {submitting ? 'Creando cuenta...' : 'Crear cuenta'}
        </button>
        {errors.form && <p className="text-sm text-red-600">{errors.form}</p>}
      </form>

      <GoogleButton disabled={submitting} onErrors={setErrors} />

      <p>
        ¿Ya tienes cuenta?{' '}
        <Link to={ROUTES.login} className="underline">
          Inicia sesión
        </Link>
      </p>
    </main>
  )
}
