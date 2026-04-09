import { type ReactElement } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useDeck } from '@/hooks/useDeck'
import ClassicMode from '@/components/study/ClassicMode'

export default function StudyPage(): ReactElement {
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

  const cards = deck.cards.map((c) => ({ front: c.front, back: c.back }))

  return <ClassicMode cards={cards} onExit={() => navigate(`/decks/${id}`)} />
}
