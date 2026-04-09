import { type ReactElement } from 'react'
import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'

export default function ProtectedRoute(): ReactElement {
  const { user, isLoading } = useAuth()

  if (isLoading) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ background: 'var(--color-parchment)' }}
      >
        <span className="font-display text-xl" style={{ color: 'var(--color-ink-muted)' }}>
          Loading...
        </span>
      </div>
    )
  }

  if (!user) return <Navigate to="/login" replace />
  return <Outlet />
}
