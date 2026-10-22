import { FirebaseError } from 'firebase/app'
import { describe, expect, it, vi } from 'vitest'
import { getAuthError } from '../src/utils/authErrors'

function firebaseError(code: string) {
  return new FirebaseError(code, `Firebase: Error (${code}).`)
}

describe('getAuthError', () => {
  it('asigna las credenciales incorrectas al formulario', () => {
    expect(getAuthError(firebaseError('auth/invalid-credential'))).toEqual({
      form: 'Correo o contraseña incorrectos.',
    })
  })

  it('asigna el correo duplicado al campo de correo', () => {
    expect(getAuthError(firebaseError('auth/email-already-in-use'))).toEqual({
      email: 'Ya existe una cuenta con este correo.',
    })
  })

  it('asigna la contraseña débil al campo de contraseña', () => {
    expect(getAuthError(firebaseError('auth/weak-password'))).toEqual({
      password: 'La contraseña debe tener al menos 6 caracteres.',
    })
  })

  it('no muestra nada si el usuario cierra la ventana de Google', () => {
    expect(getAuthError(firebaseError('auth/popup-closed-by-user'))).toEqual({})
    expect(getAuthError(firebaseError('auth/cancelled-popup-request'))).toEqual({})
  })

  it('muestra un mensaje genérico para errores desconocidos', () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {})
    const generic = { form: 'Ocurrió un error inesperado. Inténtalo de nuevo.' }

    expect(getAuthError(firebaseError('auth/codigo-desconocido'))).toEqual(generic)
    expect(getAuthError(new Error('fallo'))).toEqual(generic)

    consoleError.mockRestore()
  })
})
