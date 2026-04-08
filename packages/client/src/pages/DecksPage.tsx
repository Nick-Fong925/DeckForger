import { type ReactElement } from 'react'
import { Link } from 'react-router-dom'

const mockDecks = [
  { id: '1', title: 'Biology Notes',     cardCount: 42, created_at: '2026-04-06T10:00:00Z' },
  { id: '2', title: 'History Chapter 3', cardCount: 27, created_at: '2026-04-05T10:00:00Z' },
  { id: '3', title: 'Spanish Vocab',     cardCount: 65, created_at: '2026-04-04T10:00:00Z' },
]

const DEFAULT_DECK_COLOR = 'var(--color-amber-light)'

const deckColors = [
  DEFAULT_DECK_COLOR,
  'var(--color-sky)',
  'var(--color-sage)',
  'var(--color-coral)',
]

export default function DecksPage(): ReactElement {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-2xl sm:text-3xl" style={{ color: 'var(--color-ink)' }}>
          My Decks
        </h1>
        <p className="text-sm font-semibold mt-1" style={{ color: 'var(--color-ink-muted)' }}>
          {mockDecks.length} deck{mockDecks.length !== 1 ? 's' : ''} ready to study
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {mockDecks.map((deck, i) => {
          const deckColor = deckColors[i % deckColors.length] ?? DEFAULT_DECK_COLOR
          return (
            <div key={deck.id} className="card card-hover flex flex-col overflow-hidden">
              {/* Color band */}
              <div className="h-3" style={{ background: deckColor }} />
              <div className="p-5 flex flex-col gap-4 flex-1">
                <div>
                  <h2 className="font-display text-lg leading-tight" style={{ color: 'var(--color-ink)' }}>
                    {deck.title}
                  </h2>
                  <p className="text-xs font-bold mt-1" style={{ color: 'var(--color-ink-muted)' }}>
                    {deck.cardCount} cards
                  </p>
                </div>
                <div className="flex gap-2 mt-auto">
                  <Link
                    to={`/decks/${deck.id}/study`}
                    className="btn btn-primary flex-1 text-sm py-2"
                  >
                    Study
                  </Link>
                  <button className="btn btn-secondary text-sm py-2 px-3">
                    ⬇
                  </button>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
