import { useState, type ReactElement } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useDeck } from '@/hooks/useDeck'
import ClassicMode from '@/components/study/ClassicMode'
import QuizMode from '@/components/study/QuizMode'

const MIN_QUIZ_CARDS = 4

type StudyMode = 'classic' | 'quiz'

type ModeOption = {
  id: StudyMode
  label: string
  icon: string
  description: string
  detail: string
  minCards?: number
}

const modeOptions: ModeOption[] = [
  {
    id: 'classic',
    label: 'Classic',
    icon: '🧠',
    description: 'Spaced repetition',
    detail: 'Rate each card as Again, Good, or Easy. Hard cards resurface sooner; a card is mastered after two Easy ratings.',
  },
  {
    id: 'quiz',
    label: 'Quiz',
    icon: '🎯',
    description: 'Multiple choice · score tracked',
    detail: 'Pick the correct definition from 4 options. Build streaks for consecutive correct answers and beat your personal best.',
    minCards: MIN_QUIZ_CARDS,
  },
]

export default function StudyPage(): ReactElement {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { data: deck, isLoading, isError } = useDeck(id)
  const [activeMode, setActiveMode] = useState<StudyMode | null>(null)

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

  const cards = deck.cards.map((c) => ({ front: c.front, back: c.back }))

  if (activeMode === 'classic') {
    return <ClassicMode cards={cards} onExit={() => navigate(`/decks/${id}`)} />
  }

  if (activeMode === 'quiz' && id !== undefined) {
    return (
      <QuizMode
        cards={cards}
        deckId={id}
        bestScore={deck.quiz_best_score}
        onExit={() => navigate(`/decks/${id}`)}
      />
    )
  }

  return (
    <div className="w-full max-w-lg md:max-w-xl mx-auto space-y-8">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <Link
            to={`/decks/${id}`}
            className="text-xs font-bold uppercase tracking-widest mb-2 inline-block"
            style={{ color: 'var(--color-ink-muted)' }}
          >
            ← {deck.title}
          </Link>
          <h1 className="font-display text-2xl sm:text-3xl" style={{ color: 'var(--color-ink)' }}>
            Study Mode
          </h1>
          <p className="text-sm mt-1" style={{ color: 'var(--color-ink-muted)' }}>
            {cards.length} {cards.length === 1 ? 'card' : 'cards'} · Choose how you want to study
          </p>
        </div>
      </div>

      <div className="space-y-4">
        {modeOptions.map(({ id: modeId, label, icon, description, detail, minCards }) => {
          const isDisabled = minCards !== undefined && cards.length < minCards
          const bestScore = modeId === 'quiz' ? deck.quiz_best_score : null

          return (
            <div key={modeId} className="card p-6 flex flex-col gap-4">
              <div className="flex items-start gap-4">
                <div
                  className="w-14 h-14 rounded-xl flex items-center justify-center text-3xl flex-shrink-0"
                  style={{
                    background: isDisabled ? 'var(--color-tan)' : 'var(--color-amber)',
                    border: '2px solid var(--color-ink)',
                    boxShadow: '3px 3px 0 var(--color-ink)',
                  }}
                >
                  {icon}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3">
                    <p className="font-display text-xl" style={{ color: 'var(--color-ink)' }}>{label}</p>
                    {bestScore != null && (
                      <span className="text-xs font-bold px-2 py-0.5 rounded"
                        style={{ background: 'var(--color-amber-light)', border: '1.5px solid var(--color-ink)' }}>
                        Best: {bestScore} / {cards.length}
                      </span>
                    )}
                  </div>
                  <p className="text-xs font-bold uppercase tracking-widest" style={{ color: 'var(--color-ink-muted)' }}>
                    {description}
                  </p>
                  <p className="text-sm mt-2 leading-relaxed" style={{ color: 'var(--color-ink-muted)' }}>
                    {detail}
                  </p>
                  {isDisabled && <p className="text-xs font-bold mt-2" style={{ color: 'var(--color-coral)' }}>Needs at least {minCards} cards</p>}
                </div>
              </div>
              <button
                onClick={() => setActiveMode(modeId)}
                disabled={isDisabled}
                className="btn btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Start {label}
              </button>
            </div>
          )
        })}
      </div>
    </div>
  )
}
