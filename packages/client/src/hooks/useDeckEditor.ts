import { useState } from 'react'
import type { Card } from '@deckforge/shared'

type CardRow = { id: string; front: string; back: string }

type DeckSnapshot = { cards: Card[]; description?: string | null }

type DeckEditorState = {
  cards: CardRow[]
  description: string
  handleDescriptionChange: (value: string) => void
  handleCardChange: (index: number, field: 'front' | 'back', value: string) => void
  handleAddCard: () => void
  handleRemoveCard: (index: number) => void
  reset: (deck: DeckSnapshot) => void
}

export function useDeckEditor(initial: DeckSnapshot): DeckEditorState {
  const [cards, setCards] = useState<CardRow[]>(() =>
    initial.cards.map((c) => ({ id: c.id, front: c.front, back: c.back })),
  )
  const [description, setDescription] = useState(initial.description ?? '')

  function handleDescriptionChange(value: string): void {
    setDescription(value)
  }

  function handleCardChange(index: number, field: 'front' | 'back', value: string): void {
    setCards((prev) => prev.map((card, i) => (i === index ? { ...card, [field]: value } : card)))
  }

  function handleAddCard(): void {
    setCards((prev) => [...prev, { id: crypto.randomUUID(), front: '', back: '' }])
  }

  function handleRemoveCard(index: number): void {
    setCards((prev) => prev.filter((_, i) => i !== index))
  }

  function reset(deck: DeckSnapshot): void {
    setCards(deck.cards.map((c) => ({ id: c.id, front: c.front, back: c.back })))
    setDescription(deck.description ?? '')
  }

  return { cards, description, handleDescriptionChange, handleCardChange, handleAddCard, handleRemoveCard, reset }
}
