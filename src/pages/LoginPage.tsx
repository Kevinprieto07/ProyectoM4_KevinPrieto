import { useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import toast from 'react-hot-toast'
import { FormField } from '../components/FormField'
import { GoogleButton } from '../components/GoogleButton'
import { ROUTES } from '../routes/paths'
import { loginWithEmail } from '../services/authService'
import { getAuthError, type AuthErrors } from '../utils/authErrors'
import { hasErrors, validateEmail } from '../utils/validation'

export function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [errors, setErrors] = useState<AuthErrors>({})
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const validationErrors: AuthErrors = {
      email: validateEmail(email.trim()),
      password: password ? undefined : 'Escribe tu contraseña.',
    }
    if (hasErrors(validationErrors)) {
      setErrors(validationErrors)
      return
    }

    setErrors({})
    setSubmitting(true)
    try {
      await loginWithEmail(email.trim(), password)
      toast.success('¡Bienvenido!')
    } catch (error) {
      setErrors(getAuthError(error))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <main className="mx-auto flex max-w-md flex-col gap-4 p-4">
      <h1 className="text-2xl font-bold">Iniciar sesión</h1>

      <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
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
          autoComplete="current-password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          error={errors.password}
        />

        <button
          type="submit"
          disabled={submitting}
          className="rounded border px-4 py-2 disabled:opacity-50"
        >
          {submitting ? 'Entrando...' : 'Entrar'}
        </button>
        {errors.form && <p className="text-sm text-red-600">{errors.form}</p>}
      </form>

      <GoogleButton disabled={submitting} onErrors={setErrors} />

      <p>
        ¿No tienes cuenta?{' '}
        <Link to={ROUTES.register} className="underline">
          Regístrate
        </Link>
      </p>
    </main>
  )
}
