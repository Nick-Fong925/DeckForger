import { useState, type ReactElement } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useDeck } from '@/hooks/useDeck'
import { useDeckEditor } from '@/hooks/useDeckEditor'
import { useUpdateDeck } from '@/hooks/useUpdateDeckCards'
import { useDeleteDeck } from '@/hooks/useDeleteDeck'
import CardPreview from '@/components/deck/CardPreview'
import CardFormRow from '@/components/deck/CardFormRow'
import DeckDetailActions, { type PageMode } from '@/components/deck/DeckDetailActions'

// Strips HTML tags and checks for non-whitespace content
function isHtmlEmpty(html: string): boolean {
  return !html.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').trim()
}

export default function DeckDetailPage(): ReactElement {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { data: deck, isLoading, isError } = useDeck(id)
  const [mode, setMode] = useState<PageMode>('view')
  const editor = useDeckEditor({ cards: [] })
  const { mutate: save, isPending: isSaving } = useUpdateDeck(id ?? '')
  const { mutate: remove, isPending: isDeleting } = useDeleteDeck()

  function handleEditStart(): void {
    if (!deck) return
    editor.reset(deck)
    setMode('edit')
  }

  function handleSave(): void {
    const validCards = editor.cards.filter((c) => !isHtmlEmpty(c.front) && !isHtmlEmpty(c.back))
    if (validCards.length === 0) return
    const description = editor.description.trim() || null
    save({ cards: validCards, description }, { onSuccess: () => setMode('view') })
  }

  function handleDeleteConfirm(): void {
    if (!id) return
    remove(id, { onSuccess: () => navigate('/decks') })
  }

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

  const displayedCardCount = mode === 'edit' ? editor.cards.length : deck.cards.length

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex-1 min-w-0">
          <Link
            to="/decks"
            className="text-xs font-bold uppercase tracking-widest mb-2 inline-block"
            style={{ color: 'var(--color-ink-muted)' }}
          >
            ← My Decks
          </Link>
          <h1 className="font-display text-2xl sm:text-3xl" style={{ color: 'var(--color-ink)' }}>
            {deck.title}
          </h1>
          {mode === 'edit' ? (
            <input
              type="text"
              value={editor.description}
              onChange={(e) => editor.handleDescriptionChange(e.target.value)}
              placeholder="Add a description…"
              maxLength={500}
              className="mt-2 w-full rounded-lg border px-3 py-2 text-sm"
              style={{ borderColor: 'var(--color-tan)', background: 'var(--color-card)', color: 'var(--color-ink)' }}
            />
          ) : (
            deck.description && (
              <p className="text-sm mt-1" style={{ color: 'var(--color-ink-muted)' }}>{deck.description}</p>
            )
          )}
          <p className="text-sm font-semibold mt-1" style={{ color: 'var(--color-ink-muted)' }}>
            {displayedCardCount} {displayedCardCount === 1 ? 'card' : 'cards'}
          </p>
        </div>

        <DeckDetailActions
          mode={mode}
          isSaving={isSaving}
          isDeleting={isDeleting}
          onEditStart={handleEditStart}
          onStudy={() => navigate(`/decks/${id}/study`)}
          onSave={handleSave}
          onSetMode={setMode}
          onDeleteConfirm={handleDeleteConfirm}
        />
      </div>

      {mode === 'edit' ? (
        <div className="space-y-3">
          {editor.cards.map((card, i) => (
            <CardFormRow
              key={card.id}
              index={i}
              front={card.front}
              back={card.back}
              onFrontChange={(v) => editor.handleCardChange(i, 'front', v)}
              onBackChange={(v) => editor.handleCardChange(i, 'back', v)}
              onRemove={() => editor.handleRemoveCard(i)}
            />
          ))}
          <button type="button" onClick={editor.handleAddCard} className="btn btn-secondary w-full">
            + Add Card
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {deck.cards.map((card, i) => (
            <CardPreview key={card.id} front={card.front} back={card.back} index={i} />
          ))}
        </div>
      )}
    </div>
  )
}
