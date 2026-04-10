import { useEffect, type ReactElement } from 'react'
import { useClassicModeState, type Rating } from '@/hooks/useClassicModeState'
import RichContent from '@/components/ui/RichContent'

type Card = {
  front: string
  back: string
}

type ClassicModeProps = {
  cards: Card[]
  onExit: () => void
}

type RatingOption = {
  label: string
  rating: Rating
  icon: string
  color: string
  hint: string
  key: string
}

const ratingOptions: RatingOption[] = [
  { label: 'Again', rating: 'again', icon: '😬', color: 'var(--color-coral)',        hint: 'Back in ~3 cards', key: '1' },
  { label: 'Good',  rating: 'good',  icon: '🙂', color: 'var(--color-amber-light)', hint: 'Back in ~7 cards', key: '2' },
  { label: 'Easy',  rating: 'easy',  icon: '😄', color: 'var(--color-sage)',         hint: '2× easy = done',  key: '3' },
]

export default function ClassicMode({ cards, onExit }: ClassicModeProps): ReactElement {
  const { currentCard, isFlipped, isDone, completed, total, flip, advance } =
    useClassicModeState(cards)

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent): void {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return
      if (e.key === ' ' || e.key === 'Enter') {
        if (!isFlipped) flip()
        return
      }
      if (!isFlipped) return
      const option = ratingOptions.find((o) => o.key === e.key)
      if (option !== undefined) advance(option.rating)
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isFlipped, flip, advance])

  if (isDone) {
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
            {total} {total === 1 ? 'card' : 'cards'} mastered
          </p>
        </div>
        <button onClick={onExit} className="btn btn-primary px-8 py-3">
          Back to Deck
        </button>
      </div>
    )
  }

  if (!currentCard) return <></>

  return (
    <div className="w-full max-w-lg md:max-w-xl mx-auto space-y-6">
      {/* Top bar */}
      <div className="flex items-center justify-between">
        <button onClick={onExit} className="btn btn-ghost text-sm">
          ← Exit
        </button>
        <span className="text-sm font-bold" style={{ color: 'var(--color-ink-muted)' }}>
          {completed} / {total} mastered
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
            width: `${(completed / total) * 100}%`,
            background: 'var(--color-sage)',
          }}
        />
      </div>

      {/* Flashcard */}
      <div
        role="button"
        tabIndex={0}
        onClick={flip}
        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') flip() }}
        className="card w-full min-h-52 sm:min-h-64 flex flex-col items-center justify-center gap-4 p-6 sm:p-8 cursor-pointer transition-colors"
        style={isFlipped ? { background: 'var(--color-amber-light)' } : {}}
      >
        <span
          className="text-xs font-bold uppercase tracking-widest"
          style={{ color: 'var(--color-ink-muted)' }}
        >
          {isFlipped ? 'Answer' : 'Question'}
        </span>
        <div className="font-display text-xl text-center leading-relaxed w-full" style={{ color: 'var(--color-ink)' }}>
          <RichContent content={isFlipped ? currentCard.back : currentCard.front} />
        </div>
        {!isFlipped && (
          <span className="text-xs font-bold" style={{ color: 'var(--color-ink-muted)' }}>
            tap or press <kbd className="px-1.5 py-0.5 rounded text-xs font-bold" style={{ background: 'var(--color-tan)', border: '1.5px solid var(--color-ink)' }}>Space</kbd> to flip
          </span>
        )}
      </div>

      {/* Rating buttons */}
      {isFlipped && (
        <div className="grid grid-cols-3 gap-3">
          {ratingOptions.map(({ label, rating, icon, color, hint, key }) => (
            <button
              key={label}
              onClick={() => advance(rating)}
              className="card flex flex-col items-center gap-1 py-4 sm:py-3 cursor-pointer transition-colors relative"
              style={{ background: color }}
            >
              <kbd
                className="absolute top-2 left-2 px-1.5 py-0.5 rounded text-xs font-bold leading-none"
                style={{ background: 'var(--color-ink)', color: 'var(--color-paper)' }}
              >
                {key}
              </kbd>
              <span className="text-xl">{icon}</span>
              <span className="text-sm font-bold" style={{ color: 'var(--color-ink)' }}>
                {label}
              </span>
              <span className="text-xs" style={{ color: 'var(--color-ink-muted)' }}>
                {hint}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
