import { useState } from 'react'

type CardRow = {
  front: string
  back: string
}

type CreateDeckFormState = {
  title: string
  cards: CardRow[]
  handleTitleChange: (value: string) => void
  handleCardChange: (index: number, field: 'front' | 'back', value: string) => void
  handleAddCard: () => void
  handleRemoveCard: (index: number) => void
}

export function useCreateDeckForm(): CreateDeckFormState {
  const [title, setTitle] = useState('')
  const [cards, setCards] = useState<CardRow[]>([{ front: '', back: '' }])

  function handleTitleChange(value: string): void {
    setTitle(value)
  }

  function handleCardChange(index: number, field: 'front' | 'back', value: string): void {
    setCards((prev) => prev.map((card, i) => (i === index ? { ...card, [field]: value } : card)))
  }

  function handleAddCard(): void {
    setCards((prev) => [...prev, { front: '', back: '' }])
  }

  function handleRemoveCard(index: number): void {
    setCards((prev) => prev.filter((_, i) => i !== index))
  }

  return { title, cards, handleTitleChange, handleCardChange, handleAddCard, handleRemoveCard }
}
