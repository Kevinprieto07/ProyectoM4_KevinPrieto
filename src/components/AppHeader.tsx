import { LogOut } from 'lucide-react'
import toast from 'react-hot-toast'
import { useAuth } from '../hooks/useAuth'
import { logout } from '../services/authService'
import { Logo } from './Logo'
import { ThemeToggle } from './ThemeToggle'

export function AppHeader() {
  const { user, profile } = useAuth()

  async function handleLogout() {
    await logout()
    toast.success('Sesión cerrada')
  }

  return (
    <header className="sticky top-0 z-10 border-b border-line bg-surface/95 backdrop-blur">
      <div className="mx-auto flex max-w-2xl items-center justify-between gap-3 px-4 py-3">
        <Logo />
        <div className="flex items-center gap-2">
          {user && profile && (
            <span className="hidden text-sm font-medium sm:inline">{profile.username}</span>
          )}
          <ThemeToggle />
          {user && (
            <button
              type="button"
              onClick={handleLogout}
              aria-label="Cerrar sesión"
              title="Cerrar sesión"
              className="icon-btn size-10"
            >
              <LogOut className="size-5" aria-hidden="true" />
            </button>
          )}
        </div>
      </div>
    </header>
  )
}
