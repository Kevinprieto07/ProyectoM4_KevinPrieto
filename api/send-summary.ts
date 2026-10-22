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
}

interface SummaryRequest {
  username: string
  timeZone: string
  tasks: SummaryTask[]
}

function json(status: number, body: Record<string, string>) {
  return Response.json(body, { status })
}

async function getVerifiedEmail(request: Request) {
  const authorization = request.headers.get('authorization') ?? ''
  if (!authorization.startsWith('Bearer ')) return null

  const projectId = process.env.VITE_FIREBASE_PROJECT_ID
  try {
    const { payload } = await jwtVerify(authorization.slice('Bearer '.length), FIREBASE_JWKS, {
      issuer: `https://securetoken.google.com/${projectId}`,
      audience: projectId,
    })
    return typeof payload.email === 'string' ? payload.email : null
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

function parseSummaryRequest(body: unknown): SummaryRequest | null {
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
      task.description.length <= MAX_DESCRIPTION_LENGTH,
  )
  if (!validTasks) return null

  return {
    username,
    timeZone,
    tasks: tasks.map((task) => ({ title: task.title, description: task.description })),
  }
}

function buildSummaryText({ username, tasks }: SummaryRequest) {
  const greeting = `Hola, ${username || 'usuario'}:`

  if (tasks.length === 0) {
    return `${greeting}\n\nNo tienes tareas pendientes. ¡Buen trabajo!\n`
  }

  const count = tasks.length === 1 ? '1 tarea pendiente' : `${tasks.length} tareas pendientes`
  const list = tasks
    .map((task) => {
      const description = task.description
        ? `\n  ${task.description.replaceAll('\n', '\n  ')}`
        : ''
      return `• ${task.title}${description}`
    })
    .join('\n')

  return `${greeting}\n\nTienes ${count}:\n\n${list}\n`
}

export async function POST(request: Request) {
  const email = await getVerifiedEmail(request)
  if (!email) return json(401, { error: 'No autorizado. Inicia sesión de nuevo.' })

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
            Subject: { Data: `Resumen de tus tareas pendientes - ${date}`, Charset: 'UTF-8' },
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
