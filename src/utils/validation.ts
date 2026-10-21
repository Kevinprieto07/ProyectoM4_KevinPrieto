const USERNAME_REGEX = /^[\p{L}\p{N}_.]{3,20}$/u
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const MIN_PASSWORD_LENGTH = 6

export function validateUsername(username: string) {
  if (!username) return 'Escribe un nombre de usuario.'
  if (!USERNAME_REGEX.test(username)) {
    return 'Usa de 3 a 20 caracteres: letras, números, _ o .'
  }
}

export function validateEmail(email: string) {
  if (!email) return 'Escribe tu correo electrónico.'
  if (!EMAIL_REGEX.test(email)) return 'El correo no es válido.'
}

export function validatePassword(password: string) {
  if (!password) return 'Escribe una contraseña.'
  if (password.length < MIN_PASSWORD_LENGTH) {
    return `La contraseña debe tener al menos ${MIN_PASSWORD_LENGTH} caracteres.`
  }
}

export function validatePasswordConfirmation(password: string, confirmation: string) {
  if (!confirmation) return 'Confirma tu contraseña.'
  if (password !== confirmation) return 'Las contraseñas no coinciden.'
}

export function hasErrors(errors: Record<string, string | undefined>) {
  return Object.values(errors).some(Boolean)
}
