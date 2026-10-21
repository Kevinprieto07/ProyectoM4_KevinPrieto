import { Navigate, Outlet } from 'react-router-dom'
import { LoadingScreen } from '../components/LoadingScreen'
import { useAuth } from '../hooks/useAuth'
import { ROUTES } from './paths'

export function ProfileSetupRoute() {
  const { user, profile, loading } = useAuth()

  if (loading) return <LoadingScreen />
  if (!user) return <Navigate to={ROUTES.login} replace />
  if (profile) return <Navigate to={ROUTES.tasks} replace />

  return <Outlet />
}
