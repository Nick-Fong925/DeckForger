import { type ReactElement } from 'react'

export default function DecksPage(): ReactElement {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-2xl sm:text-3xl" style={{ color: 'var(--color-ink)' }}>
          My Decks
        </h1>
        <p className="text-sm font-semibold mt-1" style={{ color: 'var(--color-ink-muted)' }}>
          0 decks ready to study
        </p>
      </div>

      {/* Deck grid — populated once deck API is wired */}
      <div
        className="card flex flex-col items-center justify-center py-16 text-center"
        style={{ color: 'var(--color-ink-muted)' }}
      >
        <p className="font-bold text-lg">No decks yet</p>
        <p className="text-sm mt-1">Upload a file to generate your first deck.</p>
      </div>
    </div>
  )
}
