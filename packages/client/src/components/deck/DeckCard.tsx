import { type ReactElement } from 'react'
import { Link } from 'react-router-dom'
import type { Deck } from '@deckforge/shared'

type DeckCardProps = {
  deck: Deck
}

export default function DeckCard({ deck }: DeckCardProps): ReactElement {
  const date = new Date(deck.created_at).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })

  return (
    <Link
      to={`/decks/${deck.id}`}
      className="card card-hover flex flex-col gap-2 p-5"
      style={{ color: 'var(--color-ink)' }}
    >
      <p className="font-display text-lg leading-tight">{deck.title}</p>
      <p className="text-xs font-semibold" style={{ color: 'var(--color-ink-muted)' }}>
        {deck.cards.length} {deck.cards.length === 1 ? 'card' : 'cards'} · {date}
      </p>
    </Link>
  )
}
