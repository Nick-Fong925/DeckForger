import { type ReactElement } from 'react'
import RichCardField from '@/components/deck/RichCardField'

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
    <div className="card flex flex-col gap-4 p-4">
      <div className="flex items-center justify-between">
        <p
          className="text-xs font-bold uppercase tracking-widest"
          style={{ color: 'var(--color-ink-muted)' }}
        >
          #{index + 1}
        </p>
        <button
          type="button"
          onClick={onRemove}
          className="btn btn-ghost"
          style={{ color: 'var(--color-coral)', minHeight: 'unset', padding: '0.25rem 0.5rem' }} // minHeight: unset — intentional exception to 44px rule
          aria-label="Remove card"
        >
          ✕
        </button>
      </div>

      <div className="space-y-1">
        <p
          className="text-xs font-bold uppercase tracking-widest"
          style={{ color: 'var(--color-ink-muted)' }}
        >
          Front
        </p>
        <RichCardField value={front} onChange={onFrontChange} />
      </div>

      <div className="space-y-1">
        <p
          className="text-xs font-bold uppercase tracking-widest"
          style={{ color: 'var(--color-ink-muted)' }}
        >
          Back
        </p>
        <RichCardField value={back} onChange={onBackChange} />
      </div>
    </div>
  )
}
