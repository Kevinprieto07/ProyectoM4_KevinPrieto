import { Navigate, Route, Routes } from 'react-router-dom'
import { ChooseUsernamePage } from '../pages/ChooseUsernamePage'
import { LoginPage } from '../pages/LoginPage'
import { RegisterPage } from '../pages/RegisterPage'
import { TasksPage } from '../pages/TasksPage'
import { ProfileSetupRoute } from './ProfileSetupRoute'
import { ProtectedRoute } from './ProtectedRoute'
import { PublicRoute } from './PublicRoute'
import { ROUTES } from './paths'

export function AppRouter() {
  return (
    <Routes>
      <Route element={<PublicRoute />}>
        <Route path={ROUTES.login} element={<LoginPage />} />
        <Route path={ROUTES.register} element={<RegisterPage />} />
      </Route>

      <Route element={<ProfileSetupRoute />}>
        <Route path={ROUTES.chooseUsername} element={<ChooseUsernamePage />} />
      </Route>

      <Route element={<ProtectedRoute />}>
        <Route path={ROUTES.tasks} element={<TasksPage />} />
      </Route>

      <Route path="*" element={<Navigate to={ROUTES.tasks} replace />} />
    </Routes>
  )
}
