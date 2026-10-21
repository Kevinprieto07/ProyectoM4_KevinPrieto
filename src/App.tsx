import { Toaster } from 'react-hot-toast'
import { AuthProvider } from './features/auth/AuthProvider'
import { AppRouter } from './routes/AppRouter'

function App() {
  return (
    <AuthProvider>
      <AppRouter />
      <Toaster />
    </AuthProvider>
  )
}

export default App
