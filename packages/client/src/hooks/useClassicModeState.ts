import { useState } from 'react'

type Card = {
  front: string
  back: string
}

type QueueCard = Card & { easyCount: number }

export type Rating = 'again' | 'good' | 'easy'

const AGAIN_OFFSET = 3
const GOOD_OFFSET = 7
const EASY_OFFSET = 10

type ClassicModeState = {
  currentCard: Card | null
  isFlipped: boolean
  isDone: boolean
  completed: number
  total: number
  flip: () => void
  advance: (rating: Rating) => void
}

export function useClassicModeState(cards: Card[]): ClassicModeState {
  const [queue, setQueue] = useState<QueueCard[]>(() =>
    cards.map((c) => ({ ...c, easyCount: 0 })),
  )
  const [isFlipped, setIsFlipped] = useState(false)
  const [completed, setCompleted] = useState(0)

  const total = cards.length
  const currentCard = queue[0] ?? null
  const isDone = queue.length === 0

  function flip(): void {
    setIsFlipped((f) => !f)
  }

  function advance(rating: Rating): void {
    const current = queue[0]
    if (!current) return

    const rest = queue.slice(1)

    if (rating === 'again') {
      const insertAt = Math.min(AGAIN_OFFSET, rest.length)
      const next = [...rest]
      next.splice(insertAt, 0, { ...current, easyCount: 0 })
      setQueue(next)
    } else if (rating === 'good') {
      const insertAt = Math.min(GOOD_OFFSET, rest.length)
      const next = [...rest]
      next.splice(insertAt, 0, current)
      setQueue(next)
    } else {
      if (current.easyCount >= 1) {
        setQueue(rest)
        setCompleted((c) => c + 1)
      } else {
        const insertAt = Math.min(EASY_OFFSET, rest.length)
        const next = [...rest]
        next.splice(insertAt, 0, { ...current, easyCount: 1 })
        setQueue(next)
      }
    }

    setIsFlipped(false)
  }

  return { currentCard, isFlipped, isDone, completed, total, flip, advance }
}
