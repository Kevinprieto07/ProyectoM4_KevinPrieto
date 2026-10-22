import type { User } from 'firebase/auth'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { sendSummary } from '../src/services/summaryService'
import { makeTask } from './mocks/tasks'

const fakeUser = { getIdToken: vi.fn().mockResolvedValue('token-123') } as unknown as User

function mockFetch(status: number, body: Record<string, string>) {
  const fetchMock = vi.fn().mockResolvedValue(Response.json(body, { status }))
  vi.stubGlobal('fetch', fetchMock)
  return fetchMock
}

describe('sendSummary', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('envía el token y todas las tareas con su estado a la función', async () => {
    const fetchMock = mockFetch(200, { message: 'Resumen enviado a kevin@test.com' })
    const tasks = [
      makeTask({ id: '1', title: 'Comprar pan', description: 'Integral' }),
      makeTask({ id: '2', title: 'Pagar el arriendo', completed: true, important: true }),
    ]

    const message = await sendSummary(fakeUser, 'kevin_p', tasks)

    expect(message).toBe('Resumen enviado a kevin@test.com')
    expect(fakeUser.getIdToken).toHaveBeenCalledWith(true)
    const [url, options] = fetchMock.mock.calls[0]
    expect(url).toBe('/api/send-summary')
    expect(options.method).toBe('POST')
    expect(options.headers.Authorization).toBe('Bearer token-123')
    const body = JSON.parse(options.body)
    expect(body.username).toBe('kevin_p')
    expect(body.tasks).toEqual([
      { title: 'Comprar pan', description: 'Integral', completed: false, important: false },
      { title: 'Pagar el arriendo', description: 'Integral', completed: true, important: true },
    ])
  })

  it('lanza el mensaje de error que devuelve el servidor', async () => {
    mockFetch(502, { error: 'AWS rechazó el envío.' })

    await expect(sendSummary(fakeUser, 'kevin_p', [makeTask()])).rejects.toThrow(
      'AWS rechazó el envío.',
    )
  })
})
