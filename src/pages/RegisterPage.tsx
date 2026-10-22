import { useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import toast from 'react-hot-toast'
import { AuthCard } from '../components/AuthCard'
import { Divider } from '../components/Divider'
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
    <AuthCard title="Crea tu cuenta" subtitle="Empieza a recordar lo importante.">
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
          autoComplete="new-password"
          placeholder="Mínimo 6 caracteres"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          error={errors.password}
        />
        <FormField
          id="confirmPassword"
          label="Confirmar contraseña"
          type="password"
          autoComplete="new-password"
          placeholder="Repite la contraseña"
          value={confirmPassword}
          onChange={(event) => setConfirmPassword(event.target.value)}
          error={errors.confirmPassword}
        />
        <button type="submit" disabled={submitting} className="btn btn-primary mt-1 w-full">
          {submitting ? 'Creando cuenta...' : 'Crear cuenta'}
        </button>
        {errors.form && <p className="text-center text-sm text-danger-text">{errors.form}</p>}
      </form>

      <Divider />
      <GoogleButton disabled={submitting} onErrors={setErrors} />

      <p className="text-center text-sm text-muted">
        ¿Ya tienes cuenta?{' '}
        <Link to={ROUTES.login} className="link">
          Inicia sesión
        </Link>
      </p>
    </AuthCard>
  )
}
