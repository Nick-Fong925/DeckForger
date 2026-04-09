import { type ReactElement } from 'react'

type CardFormRowProps = {
  index: number
  front: string
  back: string
  onFrontChange: (value: string) => void
  onBackChange: (value: string) => void
  onRemove: () => void
}

export default function CardFormRow({
  index,
  front,
  back,
  onFrontChange,
  onBackChange,
  onRemove,
}: CardFormRowProps): ReactElement {
  return (
    <div className="card flex flex-col sm:flex-row gap-3 p-4">
      <p className="text-xs font-bold uppercase tracking-widest self-center w-12 shrink-0" style={{ color: 'var(--color-ink-muted)' }}>
        #{index + 1}
      </p>
      <input
        type="text"
        placeholder="Front"
        value={front}
        onChange={(e) => onFrontChange(e.target.value)}
        className="flex-1 rounded-lg border px-3 py-2 text-sm font-semibold"
        style={{ borderColor: 'var(--color-tan)', background: 'var(--color-card)', color: 'var(--color-ink)' }}
      />
      <input
        type="text"
        placeholder="Back"
        value={back}
        onChange={(e) => onBackChange(e.target.value)}
        className="flex-1 rounded-lg border px-3 py-2 text-sm font-semibold"
        style={{ borderColor: 'var(--color-tan)', background: 'var(--color-card)', color: 'var(--color-ink)' }}
      />
      <button
        type="button"
        onClick={onRemove}
        className="btn btn-ghost shrink-0"
        style={{ color: 'var(--color-coral)' }}
        aria-label="Remove card"
      >
        ✕
      </button>
    </div>
  )
}
