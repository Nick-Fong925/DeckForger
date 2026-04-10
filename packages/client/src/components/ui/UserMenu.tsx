import { useEffect, useRef, useState, type ReactElement } from 'react'
import { useAuth } from '@/hooks/useAuth'

export default function UserMenu(): ReactElement {
  const { user, signOut } = useAuth()
  const [isOpen, setIsOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(e: MouseEvent): void {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  async function handleSignOut(): Promise<void> {
    setIsOpen(false)
    await signOut()
  }

  const initials = user?.displayName
    ? user.displayName.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()
    : '?'

  return (
    <div ref={menuRef} className="relative">
      <button
        onClick={() => setIsOpen((prev) => !prev)}
        className="w-9 h-9 rounded-full overflow-hidden flex items-center justify-center text-sm font-bold focus:outline-none"
        style={{
          border: '2.5px solid var(--color-ink)',
          boxShadow: isOpen ? '1px 1px 0 var(--color-ink)' : '3px 3px 0 var(--color-ink)',
          background: 'var(--color-amber-light)',
          color: 'var(--color-ink)',
          transform: isOpen ? 'translateY(1px)' : undefined,
          transition: 'transform 0.1s ease, box-shadow 0.1s ease',
        }}
        onMouseEnter={(e) => {
          if (!isOpen) {
            e.currentTarget.style.transform = 'translateY(-2px)'
            e.currentTarget.style.boxShadow = '5px 5px 0 var(--color-ink)'
          }
        }}
        onMouseLeave={(e) => {
          if (!isOpen) {
            e.currentTarget.style.transform = ''
            e.currentTarget.style.boxShadow = '3px 3px 0 var(--color-ink)'
          }
        }}
        aria-label="User menu"
      >
        {user?.photoURL ? (
          <img
            src={user.photoURL}
            alt={user.displayName ?? 'User avatar'}
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
        ) : (
          initials
        )}
      </button>

      {isOpen && (
        <div
          className="absolute right-0 mt-2 w-52 rounded-none z-20"
          style={{
            background: 'var(--color-card)',
            border: '2.5px solid var(--color-ink)',
            boxShadow: '4px 4px 0 var(--color-ink)',
          }}
        >
          {user?.displayName && (
            <div
              className="px-4 py-2.5 text-sm font-semibold truncate"
              style={{ borderBottom: '2px solid var(--color-ink)', color: 'var(--color-ink)' }}
            >
              {user.displayName}
            </div>
          )}
          {user?.email && (
            <div
              className="px-4 py-2 text-xs truncate"
              style={{ borderBottom: '2px solid var(--color-ink)', color: 'var(--color-muted, #666)' }}
            >
              {user.email}
            </div>
          )}
          <button
            onClick={handleSignOut}
            className="w-full text-left px-4 py-2.5 text-sm font-semibold hover:opacity-80 transition-opacity"
            style={{ color: 'var(--color-ink)' }}
          >
            Sign out
          </button>
        </div>
      )}
    </div>
  )
}
