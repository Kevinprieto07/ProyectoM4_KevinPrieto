import { LoaderCircle } from 'lucide-react'

export function LoadingScreen() {
  return (
    <div className="flex items-center justify-center gap-2 p-16 text-muted">
      <LoaderCircle className="size-5 animate-spin text-brand-text" aria-hidden="true" />
      <p>Cargando...</p>
    </div>
  )
}
