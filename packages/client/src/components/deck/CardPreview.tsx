import { type ReactElement } from 'react'
import RichContent from '@/components/ui/RichContent'

type CardPreviewProps = {
  front: string
  back: string
  index: number
  onEdit: () => void
}

export default function CardPreview({ front, back, index, onEdit }: CardPreviewProps): ReactElement {
  return (
    <div className="card flex flex-col" style={{ height: '180px' }}>
      {/* Header row: card number + pencil */}
      <div className="flex-none flex items-center justify-between px-4 pt-3 pb-1">
        <span
          className="text-xs font-bold uppercase tracking-widest"
          style={{ color: 'var(--color-ink-muted)' }}
        >
          #{index + 1}
        </span>
        <button
          type="button"
          onClick={onEdit}
          aria-label="Edit card"
          className="w-6 h-6 flex items-center justify-center rounded transition-colors"
          style={{ color: 'var(--color-ink-muted)' }}
          onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.color = 'var(--color-ink)' }}
          onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.color = 'var(--color-ink-muted)' }}
        >
          ✎
        </button>
      </div>

      {/* Front — plain text, 2-line clamp */}
      <div className="flex-none px-4 pb-2" style={{ height: '52px', overflow: 'hidden' }}>
        <p
          className="font-bold text-sm leading-snug"
          style={{
            color: 'var(--color-ink)',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          }}
        >
          {front}
        </p>
      </div>

      {/* Divider */}
      <div className="flex-none mx-4" style={{ height: '1px', background: 'var(--color-tan)' }} />

      {/* Back — rich content, fills remaining space, clipped */}
      <div className="flex-1 px-4 py-2 overflow-hidden">
        <RichContent content={back} className="text-xs leading-snug" />
      </div>
    </div>
  )
}
