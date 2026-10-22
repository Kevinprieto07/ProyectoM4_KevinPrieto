import { describe, expect, it, vi } from 'vitest'
import { buildSummaryHtml, buildSummaryText, parseSummaryRequest } from '../api/send-summary'

vi.mock('@aws-sdk/client-sesv2', () => ({
  SESv2Client: class {},
  SendEmailCommand: class {},
}))
vi.mock('jose', () => ({ createRemoteJWKSet: vi.fn(), jwtVerify: vi.fn() }))

const pendingTask = { title: 'Comprar pan', description: 'Integral', completed: false }
const completedTask = { title: 'Pagar el arriendo', description: '', completed: true }

const validRequest = {
  username: 'kevin_p',
  timeZone: 'America/Bogota',
  tasks: [pendingTask],
}

describe('parseSummaryRequest', () => {
  it('acepta una petición válida y descarta campos extra', () => {
    const result = parseSummaryRequest({
      ...validRequest,
      tasks: [{ ...pendingTask, id: 'task-1', userId: 'user-1' }],
    })

    expect(result).toEqual(validRequest)
  })

  it.each([
    ['un valor que no es un objeto', 'hola'],
    ['un nombre de usuario muy largo', { ...validRequest, username: 'a'.repeat(21) }],
    ['una zona horaria inexistente', { ...validRequest, timeZone: 'Marte/Olimpo' }],
    ['tareas que no son una lista', { ...validRequest, tasks: 'tareas' }],
    ['más de 100 tareas', { ...validRequest, tasks: Array(101).fill(pendingTask) }],
    ['un título vacío', { ...validRequest, tasks: [{ ...pendingTask, title: '' }] }],
    ['un título de más de 100 caracteres', { ...validRequest, tasks: [{ ...pendingTask, title: 'a'.repeat(101) }] }],
    ['una descripción de más de 500 caracteres', { ...validRequest, tasks: [{ ...pendingTask, description: 'a'.repeat(501) }] }],
    ['una tarea sin estado', { ...validRequest, tasks: [{ title: 'Pan', description: '' }] }],
  ])('rechaza %s', (_case, body) => {
    expect(parseSummaryRequest(body)).toBeNull()
  })
})

describe('buildSummaryText', () => {
  it('resume todas las tareas separadas por estado', () => {
    const text = buildSummaryText({
      ...validRequest,
      tasks: [
        pendingTask,
        { title: 'Llamar a mamá', description: '', completed: false },
        completedTask,
      ],
    })

    expect(text).toContain('Hola, kevin_p:')
    expect(text).toContain('Tienes 3 tareas: 2 pendientes y 1 completada.')
    expect(text).toContain('PENDIENTES\n• Comprar pan\n  Integral\n• Llamar a mamá')
    expect(text).toContain('COMPLETADAS\n✓ Pagar el arriendo')
  })

  it('usa el singular y omite las secciones vacías', () => {
    const text = buildSummaryText(validRequest)

    expect(text).toContain('Tienes 1 tarea: 1 pendiente y 0 completadas.')
    expect(text).not.toContain('COMPLETADAS')
  })

  it('omite la sección de pendientes si todas están completadas', () => {
    const text = buildSummaryText({ ...validRequest, tasks: [completedTask] })

    expect(text).toContain('Tienes 1 tarea: 0 pendientes y 1 completada.')
    expect(text).not.toContain('PENDIENTES')
  })

  it('avisa si no hay tareas', () => {
    expect(buildSummaryText({ ...validRequest, tasks: [] })).toContain(
      'No tienes tareas registradas.',
    )
  })

  it('usa "usuario" si no llega el nombre', () => {
    expect(buildSummaryText({ ...validRequest, username: '' })).toContain('Hola, usuario:')
  })
})

describe('buildSummaryHtml', () => {
  it('incluye la marca, el saludo y las dos secciones', () => {
    const html = buildSummaryHtml({ ...validRequest, tasks: [pendingTask, completedTask] })

    expect(html).toContain('Remember-tasks')
    expect(html).toContain('Hola, kevin_p:')
    expect(html).toContain('1 pendiente')
    expect(html).toContain('1 completada')
    expect(html).toContain('Pendientes')
    expect(html).toContain('Completadas')
    expect(html).toContain('Comprar pan')
    expect(html).toContain('Pagar el arriendo')
  })

  it('escapa el HTML que escriba el usuario', () => {
    const html = buildSummaryHtml({
      ...validRequest,
      username: '<b>kevin</b>',
      tasks: [{ title: '<script>alert(1)</script>', description: 'a & b', completed: false }],
    })

    expect(html).not.toContain('<script>')
    expect(html).toContain('&lt;script&gt;alert(1)&lt;/script&gt;')
    expect(html).toContain('&lt;b&gt;kevin&lt;/b&gt;')
    expect(html).toContain('a &amp; b')
  })

  it('avisa si no hay tareas', () => {
    expect(buildSummaryHtml({ ...validRequest, tasks: [] })).toContain(
      'No tienes tareas registradas.',
    )
  })
})
