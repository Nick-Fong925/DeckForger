import { type ReactElement } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import type { Deck } from '@deckforge/shared'

type DeckCardProps = {
  deck: Deck
}

export default function DeckCard({ deck }: DeckCardProps): ReactElement {
  const navigate = useNavigate()

  const date = new Date(deck.created_at).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })

  return (
    <div className="card flex flex-col gap-3 p-5">
      <Link
        to={`/decks/${deck.id}`}
        className="flex flex-col gap-1 flex-1 min-w-0"
        style={{ color: 'var(--color-ink)' }}
      >
        <p className="font-display text-lg leading-tight">{deck.title}</p>
        <p className="text-xs font-semibold" style={{ color: 'var(--color-ink-muted)' }}>
          {deck.cards.length} {deck.cards.length === 1 ? 'card' : 'cards'} · {date}
        </p>
      </Link>

      <button
        type="button"
        onClick={() => navigate(`/decks/${deck.id}/study`)}
        className="btn btn-primary w-full"
      >
        Study →
      </button>
    </div>
  )
}
