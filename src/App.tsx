import { Toaster } from 'react-hot-toast'
import { AppHeader } from './components/AppHeader'
import { AuthProvider } from './features/auth/AuthProvider'
import { AppRouter } from './routes/AppRouter'

function App() {
  return (
    <AuthProvider>
      <AppHeader />
      <AppRouter />
      <Toaster
        position="bottom-center"
        toastOptions={{
          style: {
            background: 'var(--surface)',
            color: 'var(--ink)',
            border: '1px solid var(--line)',
            borderRadius: '12px',
            fontSize: '14px',
            fontWeight: 500,
          },
          success: { iconTheme: { primary: 'var(--accent)', secondary: '#ffffff' } },
          error: { iconTheme: { primary: 'var(--danger)', secondary: '#ffffff' } },
        }}
      />
    </AuthProvider>
  )
}

export default App
