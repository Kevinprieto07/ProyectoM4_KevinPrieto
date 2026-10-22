import { useState } from 'react'

export type Theme = 'light' | 'dark'

function readTheme(): Theme {
  return document.documentElement.dataset.theme === 'dark' ? 'dark' : 'light'
}

function saveTheme(theme: Theme) {
  try {
    localStorage.setItem('theme', theme)
  } catch {
    return
  }
}

export function useTheme() {
  const [theme, setTheme] = useState<Theme>(readTheme)

  function toggleTheme() {
    const next: Theme = theme === 'dark' ? 'light' : 'dark'
    document.documentElement.dataset.theme = next
    saveTheme(next)
    setTheme(next)
  }

  return { theme, toggleTheme }
}
