import { type ReactElement } from 'react'
import { Link } from 'react-router-dom'
import { useDecks } from '@/hooks/useDecks'
import DeckCard from '@/components/deck/DeckCard'

export default function DecksPage(): ReactElement {
  const { data: decks, isLoading, isError } = useDecks()

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-2xl sm:text-3xl" style={{ color: 'var(--color-ink)' }}>
            My Decks
          </h1>
          <p className="text-sm font-semibold mt-1" style={{ color: 'var(--color-ink-muted)' }}>
            {decks ? `${decks.length} ${decks.length === 1 ? 'deck' : 'decks'} ready to study` : ''}
          </p>
        </div>
        <Link to="/decks/new" className="btn btn-primary gap-2">
          <span>＋</span> Create Deck
        </Link>
      </div>

      {isLoading && (
        <p className="font-semibold" style={{ color: 'var(--color-ink-muted)' }}>Loading decks…</p>
      )}

      {isError && (
        <div className="card py-6 text-center">
          <p className="font-bold" style={{ color: 'var(--color-coral)' }}>Failed to load decks</p>
        </div>
      )}

      {!isLoading && !isError && decks?.length === 0 && (
        <div className="card flex flex-col items-center justify-center py-16 text-center gap-2" style={{ color: 'var(--color-ink-muted)' }}>
          <p className="font-bold text-lg">No decks yet</p>
          <p className="text-sm">Upload a file to generate your first deck,</p>
          <p className="text-sm">
            or{' '}
            <Link to="/decks/new" className="font-bold" style={{ color: 'var(--color-amber)' }}>
              create one manually
            </Link>.
          </p>
        </div>
      )}

      {decks && decks.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {decks.map((deck) => (
            <DeckCard key={deck.id} deck={deck} />
          ))}
        </div>
      )}
    </div>
  )
}
