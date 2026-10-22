import { SESv2Client, SendEmailCommand } from '@aws-sdk/client-sesv2'
import { createRemoteJWKSet, jwtVerify } from 'jose'

const MAX_TASKS = 100
const MAX_TITLE_LENGTH = 100
const MAX_DESCRIPTION_LENGTH = 500
const MAX_USERNAME_LENGTH = 20

const FIREBASE_JWKS = createRemoteJWKSet(
  new URL(
    'https://www.googleapis.com/service_accounts/v1/jwk/securetoken@system.gserviceaccount.com',
  ),
)

const ses = new SESv2Client({
  region: process.env.SES_AWS_REGION,
  credentials: {
    accessKeyId: process.env.SES_AWS_ACCESS_KEY_ID ?? '',
    secretAccessKey: process.env.SES_AWS_SECRET_ACCESS_KEY ?? '',
  },
})

interface SummaryTask {
  title: string
  description: string
  completed: boolean
}

interface SummaryRequest {
  username: string
  timeZone: string
  tasks: SummaryTask[]
}

function json(status: number, body: Record<string, string>) {
  return Response.json(body, { status })
}

async function getTokenUser(request: Request) {
  const authorization = request.headers.get('authorization') ?? ''
  if (!authorization.startsWith('Bearer ')) return null

  const projectId = process.env.VITE_FIREBASE_PROJECT_ID
  try {
    const { payload } = await jwtVerify(authorization.slice('Bearer '.length), FIREBASE_JWKS, {
      issuer: `https://securetoken.google.com/${projectId}`,
      audience: projectId,
    })
    if (typeof payload.email !== 'string') return null
    return { email: payload.email, emailVerified: payload.email_verified === true }
  } catch {
    return null
  }
}

function isValidTimeZone(timeZone: string) {
  try {
    new Intl.DateTimeFormat('es', { timeZone })
    return true
  } catch {
    return false
  }
}

export function parseSummaryRequest(body: unknown): SummaryRequest | null {
  if (typeof body !== 'object' || body === null) return null
  const { username, timeZone, tasks } = body as Record<string, unknown>

  if (typeof username !== 'string' || username.length > MAX_USERNAME_LENGTH) return null
  if (typeof timeZone !== 'string' || !isValidTimeZone(timeZone)) return null
  if (!Array.isArray(tasks) || tasks.length > MAX_TASKS) return null

  const validTasks = tasks.every(
    (task) =>
      typeof task?.title === 'string' &&
      task.title.length > 0 &&
      task.title.length <= MAX_TITLE_LENGTH &&
      typeof task.description === 'string' &&
      task.description.length <= MAX_DESCRIPTION_LENGTH &&
      typeof task.completed === 'boolean',
  )
  if (!validTasks) return null

  return {
    username,
    timeZone,
    tasks: tasks.map((task) => ({
      title: task.title,
      description: task.description,
      completed: task.completed,
    })),
  }
}

function plural(count: number, singular: string, pluralWord: string) {
  return `${count} ${count === 1 ? singular : pluralWord}`
}

function formatTaskList(tasks: SummaryTask[], bullet: string) {
  return tasks
    .map((task) => {
      const description = task.description
        ? `\n  ${task.description.replaceAll('\n', '\n  ')}`
        : ''
      return `${bullet} ${task.title}${description}`
    })
    .join('\n')
}

export function buildSummaryText({ username, tasks }: SummaryRequest) {
  const greeting = `Hola, ${username || 'usuario'}:`

  if (tasks.length === 0) {
    return `${greeting}\n\nNo tienes tareas registradas.\n`
  }

  const pending = tasks.filter((task) => !task.completed)
  const completed = tasks.filter((task) => task.completed)

  const sections = [
    greeting,
    `Tienes ${plural(tasks.length, 'tarea', 'tareas')}: ${plural(pending.length, 'pendiente', 'pendientes')} y ${plural(completed.length, 'completada', 'completadas')}.`,
  ]
  if (pending.length > 0) sections.push(`PENDIENTES\n${formatTaskList(pending, '•')}`)
  if (completed.length > 0) sections.push(`COMPLETADAS\n${formatTaskList(completed, '✓')}`)

  return `${sections.join('\n\n')}\n`
}

function escapeHtml(value: string) {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;')
}

function htmlTaskRows(tasks: SummaryTask[]) {
  return tasks
    .map((task) => {
      const marker = task.completed
        ? '<span style="display:inline-block;width:18px;height:18px;border-radius:50%;background:#10b981;color:#ffffff;font-size:12px;line-height:18px;text-align:center;font-weight:700;">&#10003;</span>'
        : '<span style="display:inline-block;width:14px;height:14px;border-radius:50%;border:2px solid #2563eb;"></span>'
      const title = task.completed
        ? `<span style="color:#64748b;text-decoration:line-through;">${escapeHtml(task.title)}</span>`
        : `<strong style="color:#0f172a;">${escapeHtml(task.title)}</strong>`
      const description = task.description
        ? `<div style="color:#64748b;font-size:14px;margin-top:2px;">${escapeHtml(task.description).replaceAll('\n', '<br>')}</div>`
        : ''
      return `<tr><td style="width:30px;vertical-align:top;padding:7px 0;">${marker}</td><td style="padding:7px 0;font-size:15px;line-height:1.45;">${title}${description}</td></tr>`
    })
    .join('')
}

function htmlSection(label: string, tasks: SummaryTask[]) {
  if (tasks.length === 0) return ''
  return `<p style="margin:24px 0 6px;font-size:11px;letter-spacing:1px;text-transform:uppercase;color:#64748b;font-weight:700;">${label}</p><table role="presentation" width="100%" style="border-collapse:collapse;">${htmlTaskRows(tasks)}</table>`
}

export function buildSummaryHtml({ username, tasks }: SummaryRequest) {
  const pending = tasks.filter((task) => !task.completed)
  const completed = tasks.filter((task) => task.completed)

  const content =
    tasks.length === 0
      ? '<p style="margin:0;color:#64748b;">No tienes tareas registradas.</p>'
      : `<p style="margin:0;">
          <span style="display:inline-block;background:#eff6ff;color:#1d4ed8;border-radius:999px;padding:4px 12px;font-size:13px;font-weight:600;margin:0 6px 6px 0;">${plural(pending.length, 'pendiente', 'pendientes')}</span>
          <span style="display:inline-block;background:#ecfdf5;color:#059669;border-radius:999px;padding:4px 12px;font-size:13px;font-weight:600;margin:0 0 6px;">${plural(completed.length, 'completada', 'completadas')}</span>
        </p>${htmlSection('Pendientes', pending)}${htmlSection('Completadas', completed)}`

  return `<!doctype html>
<html lang="es">
  <body style="margin:0;padding:24px 12px;background:#f6f8fb;font-family:Inter,'Segoe UI',Roboto,Arial,sans-serif;color:#0f172a;">
    <table role="presentation" width="100%" style="max-width:560px;margin:0 auto;background:#ffffff;border:1px solid #e2e8f0;border-radius:16px;border-collapse:separate;overflow:hidden;">
      <tr>
        <td style="background:#2563eb;color:#ffffff;padding:20px 24px;font-size:18px;font-weight:700;">
          <span style="color:#34d399;">&#10003;</span>&nbsp; Remember-tasks
        </td>
      </tr>
      <tr>
        <td style="padding:24px;">
          <h1 style="margin:0 0 14px;font-size:20px;">Hola, ${escapeHtml(username || 'usuario')}:</h1>
          ${content}
        </td>
      </tr>
      <tr>
        <td style="border-top:1px solid #e2e8f0;padding:14px 24px;color:#94a3b8;font-size:12px;">
          Recibiste este correo porque pediste un resumen desde Remember-tasks.
        </td>
      </tr>
    </table>
  </body>
</html>`
}

export async function POST(request: Request) {
  const tokenUser = await getTokenUser(request)
  if (!tokenUser) return json(401, { error: 'No autorizado. Inicia sesión de nuevo.' })
  if (!tokenUser.emailVerified) {
    return json(403, { error: 'Verifica tu correo antes de enviar resúmenes.' })
  }
  const { email } = tokenUser

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return json(400, { error: 'La petición no tiene un formato válido.' })
  }

  const summary = parseSummaryRequest(body)
  if (!summary) return json(400, { error: 'Los datos de las tareas no son válidos.' })

  const date = new Intl.DateTimeFormat('es', { timeZone: summary.timeZone }).format(new Date())

  try {
    await ses.send(
      new SendEmailCommand({
        FromEmailAddress: process.env.SES_FROM_EMAIL,
        Destination: { ToAddresses: [email] },
        Content: {
          Simple: {
            Subject: { Data: `Resumen de tus tareas - ${date}`, Charset: 'UTF-8' },
            Body: {
              Text: { Data: buildSummaryText(summary), Charset: 'UTF-8' },
              Html: { Data: buildSummaryHtml(summary), Charset: 'UTF-8' },
            },
          },
        },
      }),
    )
  } catch (error) {
    console.error('Error al enviar el correo con SES:', error)
    if (error instanceof Error && error.name === 'MessageRejected') {
      return json(502, {
        error:
          'AWS rechazó el envío. Mientras SES esté en modo sandbox, el correo de destino debe estar verificado.',
      })
    }
    return json(502, { error: 'No se pudo enviar el correo. Inténtalo más tarde.' })
  }

  return json(200, { message: `Resumen enviado a ${email}` })
}
