import { describe, expect, it } from 'vitest'
import {
  hasErrors,
  validateEmail,
  validatePassword,
  validatePasswordConfirmation,
  validateTaskDescription,
  validateTaskTitle,
  validateUsername,
} from '../src/utils/validation'

describe('validateUsername', () => {
  it('acepta nombres con letras, números, guion bajo, punto, tildes y ñ', () => {
    expect(validateUsername('kevin_p')).toBeUndefined()
    expect(validateUsername('josé.peña')).toBeUndefined()
    expect(validateUsername('user123')).toBeUndefined()
  })

  it('pide un nombre cuando está vacío', () => {
    expect(validateUsername('')).toBe('Escribe un nombre de usuario.')
  })

  it.each(['kevin p', 'ab', 'a'.repeat(21), 'kevin!'])('rechaza "%s"', (username) => {
    expect(validateUsername(username)).toBe('Usa de 3 a 20 caracteres: letras, números, _ o .')
  })
})

describe('validateEmail', () => {
  it('acepta un correo válido', () => {
    expect(validateEmail('kevin@gmail.com')).toBeUndefined()
  })

  it('pide el correo cuando está vacío', () => {
    expect(validateEmail('')).toBe('Escribe tu correo electrónico.')
  })

  it.each(['kevin@gmail', 'kevin.gmail.com', 'kevin @gmail.com'])('rechaza "%s"', (email) => {
    expect(validateEmail(email)).toBe('El correo no es válido.')
  })
})

describe('validatePassword', () => {
  it('acepta 6 caracteres o más', () => {
    expect(validatePassword('123456')).toBeUndefined()
  })

  it('pide la contraseña cuando está vacía', () => {
    expect(validatePassword('')).toBe('Escribe una contraseña.')
  })

  it('rechaza menos de 6 caracteres', () => {
    expect(validatePassword('12345')).toBe('La contraseña debe tener al menos 6 caracteres.')
  })
})

describe('validatePasswordConfirmation', () => {
  it('acepta contraseñas iguales', () => {
    expect(validatePasswordConfirmation('123456', '123456')).toBeUndefined()
  })

  it('pide la confirmación cuando está vacía', () => {
    expect(validatePasswordConfirmation('123456', '')).toBe('Confirma tu contraseña.')
  })

  it('rechaza contraseñas distintas', () => {
    expect(validatePasswordConfirmation('123456', '654321')).toBe('Las contraseñas no coinciden.')
  })
})

describe('validateTaskTitle', () => {
  it('acepta hasta 100 caracteres', () => {
    expect(validateTaskTitle('a'.repeat(100))).toBeUndefined()
  })

  it('pide un título cuando está vacío', () => {
    expect(validateTaskTitle('')).toBe('Escribe un título.')
  })

  it('rechaza más de 100 caracteres', () => {
    expect(validateTaskTitle('a'.repeat(101))).toBe(
      'El título puede tener como máximo 100 caracteres.',
    )
  })
})

describe('validateTaskDescription', () => {
  it('acepta una descripción vacía o de hasta 500 caracteres', () => {
    expect(validateTaskDescription('')).toBeUndefined()
    expect(validateTaskDescription('a'.repeat(500))).toBeUndefined()
  })

  it('rechaza más de 500 caracteres', () => {
    expect(validateTaskDescription('a'.repeat(501))).toBe(
      'La descripción puede tener como máximo 500 caracteres.',
    )
  })
})

describe('hasErrors', () => {
  it('detecta si hay algún mensaje de error', () => {
    expect(hasErrors({ email: undefined, password: undefined })).toBe(false)
    expect(hasErrors({ email: 'El correo no es válido.', password: undefined })).toBe(true)
  })
})
