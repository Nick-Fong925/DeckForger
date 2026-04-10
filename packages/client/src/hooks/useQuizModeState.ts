import { useState, useMemo, useRef } from 'react'

type Card = {
  front: string
  back: string
}

export type QuizQuestion = {
  card: Card
  options: string[]
  correctBack: string
}

type QuizModeState = {
  question: QuizQuestion | null
  selected: string | null
  isAnswered: boolean
  score: number
  streak: number
  questionIndex: number
  total: number
  isDone: boolean
  selectAnswer: (back: string) => void
  advance: () => void
}

function shuffled<T>(arr: T[]): T[] {
  const copy = [...arr]
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[copy[i]!, copy[j]!] = [copy[j]!, copy[i]!]
  }
  return copy
}

function buildQuestions(cards: Card[]): QuizQuestion[] {
  const deck = shuffled(cards)
  return deck.map((card, idx) => {
    const pool = deck.filter((_, i) => i !== idx).map((c) => c.back)
    const distractors = shuffled(pool).slice(0, 3)
    const options = shuffled([card.back, ...distractors])
    return { card, options, correctBack: card.back }
  })
}

export function useQuizModeState(cards: Card[]): QuizModeState {
  const questions = useMemo(() => buildQuestions(cards), [cards])
  const [questionIndex, setQuestionIndex] = useState(0)
  const [selected, setSelected] = useState<string | null>(null)
  const [score, setScore] = useState(0)
  const [streak, setStreak] = useState(0)
  const answeredRef = useRef(false)

  const total = questions.length
  const isDone = questionIndex >= total
  const question = isDone ? null : (questions[questionIndex] ?? null)
  const isAnswered = selected !== null

  function selectAnswer(back: string): void {
    if (answeredRef.current || isDone || !question) return
    answeredRef.current = true
    setSelected(back)
    if (back === question.correctBack) {
      setScore((s) => s + 1)
      setStreak((s) => s + 1)
    } else {
      setStreak(0)
    }
  }

  function advance(): void {
    answeredRef.current = false
    setSelected(null)
    setQuestionIndex((i) => i + 1)
  }

  return { question, selected, isAnswered, score, streak, questionIndex, total, isDone, selectAnswer, advance }
}
