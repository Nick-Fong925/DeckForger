import { useState } from 'react'

type CardRow = {
  id: string
  front: string
  back: string
}

type CreateDeckFormState = {
  title: string
  description: string
  cards: CardRow[]
  handleTitleChange: (value: string) => void
  handleDescriptionChange: (value: string) => void
  handleCardChange: (index: number, field: 'front' | 'back', value: string) => void
  handleAddCard: () => void
  handleRemoveCard: (index: number) => void
}

export function useCreateDeckForm(): CreateDeckFormState {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [cards, setCards] = useState<CardRow[]>([{ id: crypto.randomUUID(), front: '', back: '' }])

  function handleTitleChange(value: string): void {
    setTitle(value)
  }

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

  return { title, description, cards, handleTitleChange, handleDescriptionChange, handleCardChange, handleAddCard, handleRemoveCard }
}
