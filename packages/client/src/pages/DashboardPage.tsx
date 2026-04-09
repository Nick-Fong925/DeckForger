import { type ReactElement } from 'react'
import { Link } from 'react-router-dom'
import { useUploads } from '@/hooks/useUploads'
import UploadListItem from '@/components/uploads/UploadListItem'

export default function DashboardPage(): ReactElement {
  const { data: uploads, isLoading, isError } = useUploads()

  return (
    <div className="space-y-8">
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

      {isLoading && (
        <p className="font-semibold" style={{ color: 'var(--color-ink-muted)' }}>Loading uploads…</p>
      )}

      {isError && (
        <div className="card py-6 text-center">
          <p className="font-bold" style={{ color: 'var(--color-coral)' }}>Failed to load uploads</p>
        </div>
      )}

      {!isLoading && !isError && uploads?.length === 0 && (
        <div className="card flex flex-col items-center justify-center py-16 text-center" style={{ color: 'var(--color-ink-muted)' }}>
          <p className="font-bold text-lg">No uploads yet</p>
          <p className="text-sm mt-1">Upload a PDF, PPTX, CSV, or .apkg file to get started.</p>
        </div>
      )}

      {uploads && uploads.length > 0 && (
        <div className="space-y-3">
          {uploads.map((upload) => (
            <UploadListItem key={upload.id} upload={upload} />
          ))}
        </div>
      )}
    </div>
  )
}
