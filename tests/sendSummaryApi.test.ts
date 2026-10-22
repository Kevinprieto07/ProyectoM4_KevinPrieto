import { beforeEach, describe, expect, it, vi } from 'vitest'
import { POST } from '../api/send-summary'

const { sendMock, jwtVerifyMock } = vi.hoisted(() => ({
  sendMock: vi.fn(),
  jwtVerifyMock: vi.fn(),
}))

vi.mock('@aws-sdk/client-sesv2', () => ({
  SESv2Client: class {
    send = sendMock
  },
  SendEmailCommand: class {
    input: unknown
    constructor(input: unknown) {
      this.input = input
    }
  },
}))
vi.mock('jose', () => ({ createRemoteJWKSet: vi.fn(), jwtVerify: jwtVerifyMock }))

const validBody = {
  username: 'kevin_p',
  timeZone: 'America/Bogota',
  tasks: [
    { title: 'Comprar pan', description: 'Integral', completed: false },
    { title: 'Pagar el arriendo', description: '', completed: true },
  ],
}

function makeRequest(body: unknown, token: string | null = 'token-valido') {
  return new Request('http://localhost/api/send-summary', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: typeof body === 'string' ? body : JSON.stringify(body),
  })
}

describe('POST /api/send-summary', () => {
  beforeEach(() => {
    sendMock.mockReset()
    jwtVerifyMock.mockReset()
    jwtVerifyMock.mockResolvedValue({
      payload: { email: 'kevin@test.com', email_verified: true },
    })
    vi.stubEnv('SES_FROM_EMAIL', 'remitente@test.com')
  })

  it('responde 401 si no llega el token', async () => {
    const response = await POST(makeRequest(validBody, null))

    expect(response.status).toBe(401)
    expect(sendMock).not.toHaveBeenCalled()
  })

  it('responde 401 si el token no es válido', async () => {
    jwtVerifyMock.mockRejectedValue(new Error('firma inválida'))

    const response = await POST(makeRequest(validBody, 'token-falso'))

    expect(response.status).toBe(401)
    expect(sendMock).not.toHaveBeenCalled()
  })

  it('responde 403 si el correo del usuario no está verificado', async () => {
    jwtVerifyMock.mockResolvedValue({
      payload: { email: 'kevin@test.com', email_verified: false },
    })

    const response = await POST(makeRequest(validBody))

    expect(response.status).toBe(403)
    expect((await response.json()).error).toBe('Verifica tu correo antes de enviar resúmenes.')
    expect(sendMock).not.toHaveBeenCalled()
  })

  it('responde 400 si el cuerpo no es JSON', async () => {
    const response = await POST(makeRequest('esto no es json'))

    expect(response.status).toBe(400)
  })

  it('responde 400 si los datos no son válidos', async () => {
    const response = await POST(makeRequest({ ...validBody, tasks: 'tareas' }))

    expect(response.status).toBe(400)
    expect(sendMock).not.toHaveBeenCalled()
  })

  it('envía el correo con SES al usuario del token', async () => {
    sendMock.mockResolvedValue({})

    const response = await POST(makeRequest(validBody))

    expect(response.status).toBe(200)
    expect(await response.json()).toEqual({ message: 'Resumen enviado a kevin@test.com' })
    expect(sendMock).toHaveBeenCalledTimes(1)
    const { input } = sendMock.mock.calls[0][0]
    expect(input.FromEmailAddress).toBe('remitente@test.com')
    expect(input.Destination.ToAddresses).toEqual(['kevin@test.com'])
    expect(input.Content.Simple.Subject.Data).toMatch(/^Resumen de tus tareas - /)
    expect(input.Content.Simple.Body.Text.Data).toContain('• Comprar pan')
    expect(input.Content.Simple.Body.Text.Data).toContain('✓ Pagar el arriendo')
    expect(input.Content.Simple.Body.Html.Data).toContain('Remember-tasks')
  })

  it('explica el modo sandbox si SES rechaza el envío', async () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {})
    sendMock.mockRejectedValue(
      Object.assign(new Error('Email address is not verified.'), { name: 'MessageRejected' }),
    )

    const response = await POST(makeRequest(validBody))

    expect(response.status).toBe(502)
    expect((await response.json()).error).toContain('modo sandbox')
    consoleError.mockRestore()
  })
})
