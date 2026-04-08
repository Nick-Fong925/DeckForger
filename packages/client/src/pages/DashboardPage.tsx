import { type ReactElement } from 'react'
import { Link } from 'react-router-dom'
import StatusBadge from '../components/StatusBadge'
import { type UploadStatus } from '@deckforge/shared'

const mockUploads: Array<{
  id: string
  file_name: string
  status: UploadStatus
  created_at: string
}> = [
  { id: '1', file_name: 'biology-notes.pdf', status: 'complete', created_at: '2026-04-07T10:00:00Z' },
  { id: '2', file_name: 'lecture-slides.pptx', status: 'extracting', created_at: '2026-04-07T11:00:00Z' },
  { id: '3', file_name: 'history-chapter.pdf', status: 'error', created_at: '2026-04-07T12:00:00Z' },
]

const fileIcon: Record<string, string> = {
  pdf: '📄',
  pptx: '📊',
  csv: '📋',
  apkg: '🃏',
}

export default function DashboardPage(): ReactElement {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-2xl sm:text-3xl" style={{ color: 'var(--color-ink)' }}>
            Dashboard
          </h1>
          <p className="text-sm font-semibold mt-1" style={{ color: 'var(--color-ink-muted)' }}>
            Your recent uploads
          </p>
        </div>
        <Link to="/upload" className="btn btn-primary gap-2">
          <span>＋</span> New Upload
        </Link>
      </div>

      {/* Upload list */}
      <div className="space-y-3">
        {mockUploads.map((upload) => {
          const ext = upload.file_name.split('.').pop() ?? 'pdf'
          return (
            <div
              key={upload.id}
              className="card card-hover flex items-center gap-4 px-5 py-4"
            >
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 text-xl"
                style={{
                  background: 'var(--color-parchment-dark)',
                  border: '2px solid var(--color-ink)',
                }}
              >
                {fileIcon[ext] ?? '📄'}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-bold truncate" style={{ color: 'var(--color-ink)' }}>
                  {upload.file_name}
                </p>
                <p className="text-xs font-semibold mt-0.5" style={{ color: 'var(--color-ink-muted)' }}>
                  {new Date(upload.created_at).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </p>
              </div>
              <StatusBadge status={upload.status} />
            </div>
          )
        })}
      </div>
    </div>
  )
}
