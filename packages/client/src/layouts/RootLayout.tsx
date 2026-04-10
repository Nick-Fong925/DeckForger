import { type ReactElement } from 'react'
import { Outlet, NavLink } from 'react-router-dom'
import LogoMark from '@/components/art/LogoMark'
import UserMenu from '@/components/ui/UserMenu'
import { useUploads } from '@/hooks/useUploads'

const navItems = [
  { to: '/decks', label: 'My Decks' },
  { to: '/upload', label: 'Upload' },
]

export default function RootLayout(): ReactElement {
  // Runs the upload polling + cascade deck invalidation globally, regardless of current page
  useUploads()

  return (
    <div className="min-h-screen">
      <nav
        style={{
          background: 'var(--color-card)',
          borderBottom: '2.5px solid var(--color-ink)',
          boxShadow: '0 3px 0 var(--color-ink)',
        }}
        className="sticky top-0 z-10"
      >
        <div className="max-w-4xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <LogoMark size={32} />
            <span className="font-display text-xl" style={{ color: 'var(--color-ink)' }}>
              DeckForge
            </span>
          </div>
          <div className="flex items-center gap-1">
            {navItems.map(({ to, label }) => (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) =>
                  isActive
                    ? 'btn btn-primary text-sm px-3 py-2.5'
                    : 'btn btn-ghost text-sm px-3 py-2.5'
                }
              >
                {label}
              </NavLink>
            ))}
            <div className="ml-2">
              <UserMenu />
            </div>
          </div>
        </div>
      </nav>
      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-10">
        <Outlet />
      </main>
    </div>
  )
}
