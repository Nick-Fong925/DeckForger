import { type ReactElement, type FormEvent, useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useCreateDeck } from '@/hooks/useCreateDeck'
import { useCreateDeckForm } from '@/hooks/useCreateDeckForm'
import CardFormRow from '@/components/deck/CardFormRow'

// Strips HTML tags and checks for non-whitespace content
function isHtmlEmpty(html: string): boolean {
  return !html.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').trim()
}

export default function CreateDeckPage(): ReactElement {
  const navigate = useNavigate()
  const { mutate, isPending, isError, error } = useCreateDeck()
  const {
    title, description, cards,
    handleTitleChange, handleDescriptionChange,
    handleCardChange, handleAddCard, handleRemoveCard,
  } = useCreateDeckForm()
  const [titleError, setTitleError] = useState(false)
  const titleRef = useRef<HTMLInputElement>(null)

  const hasValidCards = cards.some((c) => !isHtmlEmpty(c.front) && !isHtmlEmpty(c.back))
  const canSubmit = !isPending && hasValidCards

  function handleSubmit(e: FormEvent): void {
    e.preventDefault()
    if (!title.trim()) {
      setTitleError(true)
      titleRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })
      titleRef.current?.focus()
      return
    }
    setTitleError(false)
    mutate(
      {
        upload_id: null,
        title: title.trim(),
        description: description.trim() || undefined,
        cards: cards.filter((c) => !isHtmlEmpty(c.front) && !isHtmlEmpty(c.back)),
      },
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
            Deck Title <span style={{ color: 'var(--color-coral)' }}>*</span>
          </label>
          <input
            ref={titleRef}
            type="text"
            placeholder="e.g. Biology Chapter 4"
            value={title}
            onChange={(e) => { handleTitleChange(e.target.value); if (titleError) setTitleError(false) }}
            className={`w-full rounded-lg border px-4 py-3 font-semibold ${titleError ? 'border-2' : ''}`}
            style={{
              borderColor: titleError ? 'var(--color-coral)' : 'var(--color-tan)',
              background: titleError ? 'color-mix(in srgb, var(--color-coral) 8%, var(--color-card))' : 'var(--color-card)',
              color: 'var(--color-ink)',
            }}
          />
          {titleError && (
            <p className="text-xs font-semibold mt-1" style={{ color: 'var(--color-coral)' }}>
              Required
            </p>
          )}
        </div>

        <div className="space-y-2">
          <label className="text-xs font-bold uppercase tracking-widest" style={{ color: 'var(--color-ink-muted)' }}>
            Description
          </label>
          <input
            type="text"
            placeholder="e.g. Key terms and definitions for the midterm"
            value={description}
            onChange={(e) => handleDescriptionChange(e.target.value)}
            maxLength={500}
            className="w-full rounded-lg border px-4 py-3"
            style={{ borderColor: 'var(--color-tan)', background: 'var(--color-card)', color: 'var(--color-ink)' }}
          />
        </div>

        <div className="space-y-3">
          <p className="text-xs font-bold uppercase tracking-widest" style={{ color: 'var(--color-ink-muted)' }}>
            Cards
          </p>
          {cards.map((card, i) => (
            <CardFormRow
              key={card.id}
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

        <button type="submit" disabled={isPending} className="btn btn-primary w-full">
          {isPending ? 'Creating…' : 'Create Deck'}
        </button>
      </form>
    </div>
  )
}
