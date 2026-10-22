import { render, screen } from '@testing-library/react'
import type { User } from 'firebase/auth'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'
import type { AuthContextValue } from '../src/features/auth/AuthContext'
import { useAuth } from '../src/hooks/useAuth'
import { ProtectedRoute } from '../src/routes/ProtectedRoute'
import { ROUTES } from '../src/routes/paths'

vi.mock('../src/hooks/useAuth', () => ({ useAuth: vi.fn() }))

const fakeUser = { uid: 'user-1', email: 'kevin@test.com' } as User

function renderWithAuth(auth: AuthContextValue) {
  vi.mocked(useAuth).mockReturnValue(auth)
  render(
    <MemoryRouter initialEntries={[ROUTES.tasks]}>
      <Routes>
        <Route element={<ProtectedRoute />}>
          <Route path={ROUTES.tasks} element={<p>Página protegida</p>} />
        </Route>
        <Route path={ROUTES.login} element={<p>Página de login</p>} />
        <Route path={ROUTES.chooseUsername} element={<p>Página de elegir usuario</p>} />
      </Routes>
    </MemoryRouter>,
  )
}

describe('ProtectedRoute', () => {
  it('muestra "Cargando..." mientras se comprueba la sesión', () => {
    renderWithAuth({ user: null, profile: null, loading: true })

    expect(screen.getByText('Cargando...')).toBeInTheDocument()
  })

  it('redirige al login si no hay sesión', () => {
    renderWithAuth({ user: null, profile: null, loading: false })

    expect(screen.getByText('Página de login')).toBeInTheDocument()
  })

  it('redirige a elegir usuario si hay sesión pero no perfil', () => {
    renderWithAuth({ user: fakeUser, profile: null, loading: false })

    expect(screen.getByText('Página de elegir usuario')).toBeInTheDocument()
  })

  it('muestra la página protegida si hay sesión y perfil', () => {
    renderWithAuth({ user: fakeUser, profile: { username: 'kevin_p' }, loading: false })

    expect(screen.getByText('Página protegida')).toBeInTheDocument()
  })
})
