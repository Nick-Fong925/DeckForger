import { type ReactElement } from 'react'
import { Link } from 'react-router-dom'

export type StudyMode = 'classic' | 'speed' | 'quiz'

interface ModeSelectProps {
  deckId: string
  onSelect: (mode: StudyMode) => void
}

type ModeConfig = {
  id: StudyMode
  label: string
  description: string
  icon: string
  color: string
}

const modes: ModeConfig[] = [
  { id: 'classic', label: 'Classic',     description: 'Flip cards at your own pace. Rate yourself after each.', icon: '🃏', color: 'var(--color-amber-light)' },
  { id: 'speed',   label: 'Speed Round', description: 'Cards advance on a timer. Stay sharp!',                  icon: '⚡', color: 'var(--color-sky)' },
  { id: 'quiz',    label: 'Quiz',        description: 'Pick the right answer from 4 options.',                   icon: '🎯', color: 'var(--color-sage)' },
]

export default function ModeSelect({ deckId: _deckId, onSelect }: ModeSelectProps): ReactElement {
  return (
    <div className="w-full max-w-md md:max-w-lg space-y-6">
      <div className="flex items-center gap-3">
        <Link to="/decks" className="btn btn-ghost text-sm">
          ← Back
        </Link>
      </div>

      <div>
        <h1 className="font-display text-2xl sm:text-3xl" style={{ color: 'var(--color-ink)' }}>
          Choose a Mode
        </h1>
        <p className="text-sm font-semibold mt-1" style={{ color: 'var(--color-ink-muted)' }}>
          How do you want to study today?
        </p>
      </div>

      <div className="space-y-3">
        {modes.map((m) => (
          <button
            key={m.id}
            onClick={() => onSelect(m.id)}
            className="card card-hover w-full text-left flex items-center gap-4 p-5"
          >
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl shrink-0"
              style={{
                background: m.color,
                border: '2px solid var(--color-ink)',
              }}
            >
              {m.icon}
            </div>
            <div>
              <p className="font-display text-lg" style={{ color: 'var(--color-ink)' }}>
                {m.label}
              </p>
              <p className="text-sm font-semibold mt-0.5" style={{ color: 'var(--color-ink-muted)' }}>
                {m.description}
              </p>
            </div>
            <span className="ml-auto text-xl" style={{ color: 'var(--color-ink-muted)' }}>
              →
            </span>
          </button>
        ))}
      </div>
    </div>
  )
}
