import { useEffect, useRef, type ReactElement } from 'react'
import { useQuizModeState, type QuizQuestion } from '@/hooks/useQuizModeState'
import { useUpdateQuizScore } from '@/hooks/useUpdateQuizScore'
import RichContent from '@/components/ui/RichContent'

type Card = { front: string; back: string }

type QuizOptionProps = {
  text: string
  keyHint: string
  isSelected: boolean
  isCorrect: boolean
  isAnswered: boolean
  onClick: () => void
}

function QuizOption({ text, keyHint, isSelected, isCorrect, isAnswered, onClick }: QuizOptionProps): ReactElement {
  let bg = 'var(--color-paper)'
  if (isAnswered && isCorrect) bg = 'var(--color-sage)'
  else if (isAnswered && isSelected && !isCorrect) bg = 'var(--color-coral)'
  return (
    <button onClick={onClick} disabled={isAnswered}
      className="card w-full text-left px-4 py-3 font-semibold transition-colors disabled:cursor-default relative"
      style={{ background: bg }}>
      <kbd className="absolute top-2 left-2 px-1.5 py-0.5 rounded text-xs font-bold leading-none"
        style={{ background: 'var(--color-ink)', color: 'var(--color-paper)' }}>{keyHint}</kbd>
      <span className="pl-6 block"><RichContent content={text} /></span>
    </button>
  )
}

type QuizDoneProps = {
  score: number
  total: number
  isNewBest: boolean
  prevBest: number | null | undefined
  onExit: () => void
}

function QuizDone({ score, total, isNewBest, prevBest, onExit }: QuizDoneProps): ReactElement {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-5 text-center">
      <div className="w-24 h-24 rounded-2xl flex items-center justify-center text-5xl"
        style={{ background: 'var(--color-amber)', border: '2.5px solid var(--color-ink)', boxShadow: '4px 4px 0 var(--color-ink)' }}>
        {score === total ? '🏆' : '🎯'}
      </div>
      <div>
        <h2 className="font-display text-3xl" style={{ color: 'var(--color-ink)' }}>Quiz complete!</h2>
        <p className="font-bold text-4xl mt-1" style={{ color: 'var(--color-ink)' }}>{score} / {total}</p>
        {isNewBest && <p className="text-sm font-bold mt-2" style={{ color: 'var(--color-sage)' }}>New personal best!</p>}
        {!isNewBest && prevBest !== null && prevBest !== undefined && (
          <p className="text-sm mt-2" style={{ color: 'var(--color-ink-muted)' }}>Personal best: {prevBest} / {total}</p>
        )}
      </div>
      <button onClick={onExit} className="btn btn-primary px-8 py-3">Back to Deck</button>
    </div>
  )
}

export type QuizModeProps = {
  cards: Card[]
  deckId: string
  bestScore: number | null | undefined
  onExit: () => void
}

export default function QuizMode({ cards, deckId, bestScore, onExit }: QuizModeProps): ReactElement {
  const { question, selected, isAnswered, score, streak, questionIndex, total, isDone, selectAnswer, advance } =
    useQuizModeState(cards)
  const { mutate: saveScore } = useUpdateQuizScore(deckId)
  const scoreSavedRef = useRef(false)
  const isNewBest = score > (bestScore ?? -1)

  useEffect(() => {
    if (isDone && !scoreSavedRef.current) {
      scoreSavedRef.current = true
      saveScore(score)
    }
  }, [isDone, score, saveScore])

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent): void {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return
      if (!isAnswered && question !== null) {
        const idx = ['1', '2', '3', '4'].indexOf(e.key)
        if (idx !== -1 && question.options[idx] !== undefined) selectAnswer(question.options[idx]!)
      } else if (isAnswered && (e.key === ' ' || e.key === 'Enter')) {
        advance()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isAnswered, question, selectAnswer, advance])

  if (isDone) {
    return <QuizDone score={score} total={total} isNewBest={isNewBest} prevBest={bestScore} onExit={onExit} />
  }
  if (!question) return <></>

  return (
    <div className="w-full max-w-lg md:max-w-xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <button onClick={onExit} className="btn btn-ghost text-sm">← Exit</button>
        <div className="flex items-center gap-4">
          {streak >= 2 && (
            <span className="text-sm font-bold" style={{ color: 'var(--color-coral)' }}>🔥 {streak}</span>
          )}
          <span className="text-sm font-bold" style={{ color: 'var(--color-ink-muted)' }}>
            {score} / {total}
          </span>
        </div>
      </div>

      <div className="h-3 rounded-full overflow-hidden"
        style={{ background: 'var(--color-tan)', border: '2px solid var(--color-ink)' }}>
        <div className="h-full rounded-full transition-all duration-300"
          style={{ width: `${(questionIndex / total) * 100}%`, background: 'var(--color-amber)' }} />
      </div>

      <div className="card w-full min-h-40 flex flex-col items-center justify-center gap-2 p-6 sm:p-8">
        <span className="text-xs font-bold uppercase tracking-widest" style={{ color: 'var(--color-ink-muted)' }}>
          Question {questionIndex + 1} of {total}
        </span>
        <div className="font-display text-xl text-center leading-relaxed w-full" style={{ color: 'var(--color-ink)' }}>
          <RichContent content={question.card.front} />
        </div>
      </div>

      <div className="space-y-3">
        {question.options.map((opt, i) => (
          <QuizOption key={i} text={opt} keyHint={String(i + 1)}
            isSelected={selected === opt} isCorrect={opt === question.correctBack}
            isAnswered={isAnswered} onClick={() => selectAnswer(opt)} />
        ))}
      </div>

      {isAnswered && (
        <button onClick={advance} className="btn btn-primary w-full">
          {questionIndex + 1 < total ? 'Next →' : 'See Results'}
        </button>
      )}
    </div>
  )
}
