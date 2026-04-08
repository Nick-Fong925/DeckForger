import { useState, type ReactElement } from 'react'

interface Card {
  front: string
  back: string
}

interface ClassicModeProps {
  cards: Card[]
  onExit: () => void
}

type RatingOption = {
  label: string
  icon: string
  color: string
}

const ratingOptions: RatingOption[] = [
  { label: 'Again', icon: '😬', color: 'var(--color-coral)' },
  { label: 'Good',  icon: '🙂', color: 'var(--color-amber-light)' },
  { label: 'Easy',  icon: '😄', color: 'var(--color-sage)' },
]

export default function ClassicMode({ cards, onExit }: ClassicModeProps): ReactElement {
  const [index, setIndex] = useState(0)
  const [flipped, setFlipped] = useState(false)
  const [done, setDone] = useState(false)

  const card = cards[index]

  function advance(): void {
    if (index + 1 >= cards.length) {
      setDone(true)
    } else {
      setIndex((i) => i + 1)
      setFlipped(false)
    }
  }

  if (done) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-5 text-center">
        <div
          className="w-24 h-24 rounded-2xl flex items-center justify-center text-5xl"
          style={{
            background: 'var(--color-amber)',
            border: '2.5px solid var(--color-ink)',
            boxShadow: '4px 4px 0 var(--color-ink)',
          }}
        >
          🎉
        </div>
        <div>
          <h2 className="font-display text-3xl" style={{ color: 'var(--color-ink)' }}>
            Deck complete!
          </h2>
          <p className="text-sm font-semibold mt-1" style={{ color: 'var(--color-ink-muted)' }}>
            {cards.length} cards reviewed
          </p>
        </div>
        <button onClick={onExit} className="btn btn-primary px-8 py-3">
          Study Again
        </button>
      </div>
    )
  }

  if (!card) return <></>

  return (
    <div className="w-full max-w-lg md:max-w-xl mx-auto space-y-6">
      {/* Top bar */}
      <div className="flex items-center justify-between">
        <button onClick={onExit} className="btn btn-ghost text-sm">
          ← Exit
        </button>
        <span className="text-sm font-bold" style={{ color: 'var(--color-ink-muted)' }}>
          {index + 1} / {cards.length}
        </span>
      </div>

      {/* Progress bar */}
      <div
        className="h-3 rounded-full overflow-hidden"
        style={{ background: 'var(--color-tan)', border: '2px solid var(--color-ink)' }}
      >
        <div
          className="h-full rounded-full transition-all duration-300"
          style={{
            width: `${((index + 1) / cards.length) * 100}%`,
            background: 'var(--color-amber)',
          }}
        />
      </div>

      {/* Flashcard */}
      <button
        onClick={() => setFlipped((f) => !f)}
        className="card w-full min-h-52 sm:min-h-64 flex flex-col items-center justify-center gap-4 p-6 sm:p-8 cursor-pointer transition-colors"
        style={flipped ? { background: 'var(--color-amber-light)' } : {}}
      >
        <span
          className="text-xs font-bold uppercase tracking-widest"
          style={{ color: 'var(--color-ink-muted)' }}
        >
          {flipped ? 'Answer' : 'Question'}
        </span>
        <p className="font-display text-xl text-center leading-relaxed" style={{ color: 'var(--color-ink)' }}>
          {flipped ? card.back : card.front}
        </p>
        {!flipped && (
          <span className="text-xs font-bold" style={{ color: 'var(--color-ink-muted)' }}>
            tap to flip
          </span>
        )}
      </button>

      {/* Rating buttons */}
      {flipped && (
        <div className="grid grid-cols-3 gap-3">
          {ratingOptions.map(({ label, icon, color }) => (
            <button
              key={label}
              onClick={advance}
              className="card flex flex-col items-center gap-1 py-4 sm:py-3 cursor-pointer transition-colors"
              style={{ background: color }}
            >
              <span className="text-xl">{icon}</span>
              <span className="text-sm font-bold" style={{ color: 'var(--color-ink)' }}>
                {label}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
