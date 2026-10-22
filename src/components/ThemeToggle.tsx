import { Moon, Sun } from 'lucide-react'
import { useTheme } from '../hooks/useTheme'

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme()
  const label = theme === 'dark' ? 'Activar modo claro' : 'Activar modo oscuro'

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={label}
      title={label}
      className="grid size-10 shrink-0 place-items-center rounded-lg border border-line bg-surface text-brand-text transition-colors hover:border-brand-line hover:bg-brand-soft focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-brand/35"
    >
      {theme === 'dark' ? (
        <Sun className="size-5 text-accent-text" aria-hidden="true" />
      ) : (
        <Moon className="size-5" aria-hidden="true" />
      )}
    </button>
  )
}
