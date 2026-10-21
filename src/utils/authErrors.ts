import { FirebaseError } from 'firebase/app'

export type AuthField = 'username' | 'email' | 'password' | 'confirmPassword' | 'form'

export type AuthErrors = Partial<Record<AuthField, string>>

const ERRORS: Record<string, { field: AuthField; message: string }> = {
  'auth/invalid-credential': { field: 'form', message: 'Correo o contraseña incorrectos.' },
  'auth/wrong-password': { field: 'form', message: 'Correo o contraseña incorrectos.' },
  'auth/user-not-found': { field: 'form', message: 'Correo o contraseña incorrectos.' },
  'auth/email-already-in-use': { field: 'email', message: 'Ya existe una cuenta con este correo.' },
  'auth/invalid-email': { field: 'email', message: 'El correo no es válido.' },
  'auth/weak-password': { field: 'password', message: 'La contraseña debe tener al menos 6 caracteres.' },
  'auth/too-many-requests': { field: 'form', message: 'Demasiados intentos. Espera unos minutos.' },
  'auth/network-request-failed': { field: 'form', message: 'Sin conexión. Revisa tu internet.' },
  'auth/popup-blocked': {
    field: 'form',
    message: 'El navegador bloqueó la ventana de Google. Permite las ventanas emergentes.',
  },
  'auth/account-exists-with-different-credential': {
    field: 'form',
    message: 'Este correo ya está registrado con otro método de inicio de sesión.',
  },
  'permission-denied': { field: 'form', message: 'No tienes permiso para realizar esta acción.' },
}

const SILENT_ERRORS = ['auth/popup-closed-by-user', 'auth/cancelled-popup-request']

export function getAuthError(error: unknown): AuthErrors {
  if (error instanceof FirebaseError) {
    if (SILENT_ERRORS.includes(error.code)) return {}
    const known = ERRORS[error.code]
    if (known) return { [known.field]: known.message }
  }
  console.error(error)
  return { form: 'Ocurrió un error inesperado. Inténtalo de nuevo.' }
}
