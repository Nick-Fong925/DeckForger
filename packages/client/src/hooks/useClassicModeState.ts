import { useState } from 'react'

type ClassicModeState = {
  index: number
  isFlipped: boolean
  isDone: boolean
  flip: () => void
  advance: (totalCards: number) => void
}

export function useClassicModeState(): ClassicModeState {
  const [index, setIndex] = useState(0)
  const [isFlipped, setIsFlipped] = useState(false)
  const [isDone, setIsDone] = useState(false)

  function flip(): void {
    setIsFlipped((f) => !f)
  }

  function advance(totalCards: number): void {
    if (index + 1 >= totalCards) {
      setIsDone(true)
    } else {
      setIndex((i) => i + 1)
      setIsFlipped(false)
    }
  }

  return { index, isFlipped, isDone, flip, advance }
}
