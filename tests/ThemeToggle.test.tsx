import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it } from 'vitest'
import { ThemeToggle } from '../src/components/ThemeToggle'

describe('ThemeToggle', () => {
  beforeEach(() => {
    document.documentElement.dataset.theme = 'light'
    localStorage.clear()
  })

  it('ofrece el modo oscuro cuando el tema es claro', () => {
    render(<ThemeToggle />)

    expect(screen.getByRole('button', { name: 'Activar modo oscuro' })).toBeInTheDocument()
  })

  it('cambia al modo oscuro, lo recuerda y ofrece volver al claro', async () => {
    render(<ThemeToggle />)

    await userEvent.setup().click(screen.getByRole('button', { name: 'Activar modo oscuro' }))

    expect(document.documentElement.dataset.theme).toBe('dark')
    expect(localStorage.getItem('theme')).toBe('dark')
    expect(screen.getByRole('button', { name: 'Activar modo claro' })).toBeInTheDocument()
  })

  it('vuelve al modo claro al pulsar de nuevo', async () => {
    document.documentElement.dataset.theme = 'dark'
    render(<ThemeToggle />)

    await userEvent.setup().click(screen.getByRole('button', { name: 'Activar modo claro' }))

    expect(document.documentElement.dataset.theme).toBe('light')
    expect(localStorage.getItem('theme')).toBe('light')
  })
})
