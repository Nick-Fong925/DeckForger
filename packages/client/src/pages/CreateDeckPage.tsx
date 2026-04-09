import { type ReactElement, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { useCreateDeck } from '@/hooks/useCreateDeck'
import { useCreateDeckForm } from '@/hooks/useCreateDeckForm'
import CardFormRow from '@/components/deck/CardFormRow'

export default function CreateDeckPage(): ReactElement {
  const navigate = useNavigate()
  const { mutate, isPending, isError, error } = useCreateDeck()
  const { title, cards, handleTitleChange, handleCardChange, handleAddCard, handleRemoveCard } =
    useCreateDeckForm()

  const hasValidCards = cards.some((c) => c.front.trim() && c.back.trim())
  const canSubmit = !isPending && title.trim().length > 0 && hasValidCards

  function handleSubmit(e: FormEvent): void {
    e.preventDefault()
    mutate(
      { upload_id: null, title: title.trim(), cards: cards.filter((c) => c.front.trim() && c.back.trim()) },
      { onSuccess: (deck) => navigate(`/decks/${deck.id}`) },
    )
  }

  return (
    <div className="space-y-8 max-w-3xl">
      <div>
        <h1 className="font-display text-2xl sm:text-3xl" style={{ color: 'var(--color-ink)' }}>
          Create Deck
        </h1>
        <p className="text-sm font-semibold mt-1" style={{ color: 'var(--color-ink-muted)' }}>
          Add cards manually
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <label className="text-xs font-bold uppercase tracking-widest" style={{ color: 'var(--color-ink-muted)' }}>
            Deck Title
          </label>
          <input
            type="text"
            placeholder="e.g. Biology Chapter 4"
            value={title}
            onChange={(e) => handleTitleChange(e.target.value)}
            className="w-full rounded-lg border px-4 py-3 font-semibold"
            style={{ borderColor: 'var(--color-tan)', background: 'var(--color-card)', color: 'var(--color-ink)' }}
          />
        </div>

        <div className="space-y-3">
          <p className="text-xs font-bold uppercase tracking-widest" style={{ color: 'var(--color-ink-muted)' }}>
            Cards
          </p>
          {cards.map((card, i) => (
            <CardFormRow
              key={i}
              index={i}
              front={card.front}
              back={card.back}
              onFrontChange={(v) => handleCardChange(i, 'front', v)}
              onBackChange={(v) => handleCardChange(i, 'back', v)}
              onRemove={() => handleRemoveCard(i)}
            />
          ))}
          <button type="button" onClick={handleAddCard} className="btn btn-secondary w-full">
            + Add Card
          </button>
        </div>

        {isError && (
          <p className="text-sm font-semibold" style={{ color: 'var(--color-coral)' }}>
            {error.message}
          </p>
        )}

        <button type="submit" disabled={!canSubmit} className="btn btn-primary w-full">
          {isPending ? 'Creating…' : 'Create Deck'}
        </button>
      </form>
    </div>
  )
}
