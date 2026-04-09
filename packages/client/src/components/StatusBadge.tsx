import { type ReactElement } from 'react'
import { type UploadStatus } from '@deckforge/shared'

type StatusBadgeProps = {
  status: UploadStatus
}

const statusConfig: Record<UploadStatus, { label: string; bg: string; dot: string }> = {
  uploaded:   { label: 'Uploaded',   bg: 'var(--color-tan)',                   dot: 'var(--color-ink-muted)' },
  extracting: { label: 'Extracting', bg: 'var(--color-status-extracting-bg)',  dot: 'var(--color-status-extracting-dot)' },
  generating: { label: 'Generating', bg: 'var(--color-status-generating-bg)',  dot: 'var(--color-status-generating-dot)' },
  complete:   { label: 'Complete',   bg: 'var(--color-status-complete-bg)',    dot: 'var(--color-status-complete-dot)' },
  error:      { label: 'Error',      bg: 'var(--color-status-error-bg)',       dot: 'var(--color-status-error-dot)' },
}

export default function StatusBadge({ status }: StatusBadgeProps): ReactElement {
  const { label, bg, dot } = statusConfig[status]
  return (
    <span
      className="inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-full shrink-0"
      style={{
        background: bg,
        border: '1.5px solid var(--color-ink)',
        color: 'var(--color-ink)',
      }}
    >
      <span
        className="w-1.5 h-1.5 rounded-full shrink-0"
        style={{ background: dot }}
      />
      {label}
    </span>
  )
}
