import toast from 'react-hot-toast'
import { useAuth } from '../hooks/useAuth'
import { logout } from '../services/authService'

export function TasksPage() {
  const { user, profile } = useAuth()

  async function handleLogout() {
    await logout()
    toast.success('Sesión cerrada')
  }

  return (
    <main className="mx-auto flex max-w-2xl flex-col gap-4 p-4">
      <header className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Mis tareas</h1>
          <p className="text-sm">
            Hola, {profile?.username} ({user?.email})
          </p>
        </div>
        <button type="button" onClick={handleLogout} className="rounded border px-4 py-2">
          Cerrar sesión
        </button>
      </header>
    </main>
  )
}
