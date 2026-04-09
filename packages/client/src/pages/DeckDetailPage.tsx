import { type ReactElement } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useDeck } from '@/hooks/useDeck'
import CardPreview from '@/components/deck/CardPreview'

export default function DeckDetailPage(): ReactElement {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { data: deck, isLoading, isError } = useDeck(id)

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <p className="font-bold" style={{ color: 'var(--color-ink-muted)' }}>Loading deck…</p>
      </div>
    )
  }

  if (isError || !deck) {
    return (
      <div className="card flex flex-col items-center py-16 text-center gap-4">
        <p className="font-bold text-lg" style={{ color: 'var(--color-ink)' }}>Deck not found</p>
        <Link to="/decks" className="btn btn-secondary">← Back to My Decks</Link>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <Link to="/decks" className="text-xs font-bold uppercase tracking-widest mb-2 inline-block" style={{ color: 'var(--color-ink-muted)' }}>
            ← My Decks
          </Link>
          <h1 className="font-display text-2xl sm:text-3xl" style={{ color: 'var(--color-ink)' }}>
            {deck.title}
          </h1>
          <p className="text-sm font-semibold mt-1" style={{ color: 'var(--color-ink-muted)' }}>
            {deck.cards.length} {deck.cards.length === 1 ? 'card' : 'cards'}
          </p>
        </div>
        <button
          className="btn btn-primary"
          onClick={() => navigate(`/decks/${id}/study`)}
        >
          Study Now
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {deck.cards.map((card, i) => (
          <CardPreview key={card.id} front={card.front} back={card.back} index={i} />
        ))}
      </div>
    </div>
  )
}
