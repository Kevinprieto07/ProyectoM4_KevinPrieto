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
            Body: { Text: { Data: buildSummaryText(summary), Charset: 'UTF-8' } },
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
