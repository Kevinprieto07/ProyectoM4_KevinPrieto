import { useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import toast from 'react-hot-toast'
import { AuthCard } from '../components/AuthCard'
import { Divider } from '../components/Divider'
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
    <AuthCard title="Bienvenido de nuevo" subtitle="Organiza tu día, sin olvidos.">
      <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-3.5">
        <FormField
          id="email"
          label="Correo electrónico"
          type="email"
          autoComplete="email"
          placeholder="tucorreo@gmail.com"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          error={errors.email}
        />
        <FormField
          id="password"
          label="Contraseña"
          type="password"
          autoComplete="current-password"
          placeholder="••••••••"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          error={errors.password}
        />
        <button type="submit" disabled={submitting} className="btn btn-primary mt-1 w-full">
          {submitting ? 'Entrando...' : 'Entrar'}
        </button>
        {errors.form && <p className="text-center text-sm text-danger-text">{errors.form}</p>}
      </form>

      <Divider />
      <GoogleButton disabled={submitting} onErrors={setErrors} />

      <p className="text-center text-sm text-muted">
        ¿No tienes cuenta?{' '}
        <Link to={ROUTES.register} className="link">
          Regístrate
        </Link>
      </p>
    </AuthCard>
  )
}
