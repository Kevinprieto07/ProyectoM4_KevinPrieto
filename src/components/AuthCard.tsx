import type { ReactNode } from 'react'

interface AuthCardProps {
  title: string
  subtitle: string
  children: ReactNode
}

export function AuthCard({ title, subtitle, children }: AuthCardProps) {
  return (
    <main className="auth-backdrop flex min-h-[calc(100dvh-4.25rem)] items-center justify-center px-4 py-10">
      <div className="flex w-full max-w-[410px] flex-col gap-5 rounded-[20px] border-2 border-accent bg-surface px-5 py-7 shadow-(--card-shadow) sm:px-7 sm:py-8">
        <div className="flex flex-col gap-1 text-center">
          <h1 className="text-2xl font-bold tracking-tight text-balance">{title}</h1>
          <p className="text-muted">{subtitle}</p>
        </div>
        {children}
      </div>
    </main>
  )
}
