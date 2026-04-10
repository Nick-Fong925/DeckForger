import { type ReactElement } from 'react'
import RichContent from '@/components/ui/RichContent'

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
      <RichContent content={front} className="font-bold text-sm" />
      <hr style={{ borderColor: 'var(--color-tan)' }} />
      <RichContent content={back} className="text-sm" />
    </div>
  )
}
