import { useState, type ReactElement } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useDeck } from '@/hooks/useDeck'
import ClassicMode from '@/components/study/ClassicMode'

type StudyMode = 'classic'

type ModeOption = {
  id: StudyMode
  label: string
  icon: string
  description: string
  detail: string
}

const modeOptions: ModeOption[] = [
  {
    id: 'classic',
    label: 'Classic',
    icon: '🧠',
    description: 'Spaced repetition',
    detail: 'Rate each card as Again, Good, or Easy. Hard cards resurface sooner; a card is mastered after two Easy ratings.',
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

  return (
    <div className="w-full max-w-lg md:max-w-xl mx-auto space-y-8">
      {/* Header */}
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

      {/* Mode cards */}
      <div className="space-y-4">
        {modeOptions.map(({ id: modeId, label, icon, description, detail }) => (
          <div
            key={modeId}
            className="card p-6 flex flex-col gap-4"
          >
            <div className="flex items-start gap-4">
              <div
                className="w-14 h-14 rounded-xl flex items-center justify-center text-3xl flex-shrink-0"
                style={{
                  background: 'var(--color-amber)',
                  border: '2px solid var(--color-ink)',
                  boxShadow: '3px 3px 0 var(--color-ink)',
                }}
              >
                {icon}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-display text-xl" style={{ color: 'var(--color-ink)' }}>{label}</p>
                <p className="text-xs font-bold uppercase tracking-widest" style={{ color: 'var(--color-ink-muted)' }}>
                  {description}
                </p>
                <p className="text-sm mt-2 leading-relaxed" style={{ color: 'var(--color-ink-muted)' }}>
                  {detail}
                </p>
              </div>
            </div>
            <button
              onClick={() => setActiveMode(modeId)}
              className="btn btn-primary w-full"
            >
              Start {label}
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}
