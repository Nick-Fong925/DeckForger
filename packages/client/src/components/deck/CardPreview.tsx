import { type ReactElement } from 'react'

type CardPreviewProps = {
  front: string
  back: string
  index: number
}

export default function CardPreview({ front, back, index }: CardPreviewProps): ReactElement {
  return (
    <div className="card flex flex-col gap-2 p-4">
      <p className="text-xs font-bold uppercase tracking-widest" style={{ color: 'var(--color-ink-muted)' }}>
        Card {index + 1}
      </p>
      <p className="font-bold text-sm" style={{ color: 'var(--color-ink)' }}>
        {front}
      </p>
      <hr style={{ borderColor: 'var(--color-tan)' }} />
      <p className="text-sm" style={{ color: 'var(--color-ink-muted)' }}>
        {back}
      </p>
    </div>
  )
}
