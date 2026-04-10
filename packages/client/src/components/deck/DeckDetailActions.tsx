import type { ReactElement } from 'react'

export type PageMode = 'view' | 'edit' | 'confirm-delete'

type DeckDetailActionsProps = {
  mode: PageMode
  isSaving: boolean
  isDeleting: boolean
  onEditStart: () => void
  onStudy: () => void
  onSave: () => void
  onSetMode: (mode: PageMode) => void
  onDeleteConfirm: () => void
}

export default function DeckDetailActions({
  mode,
  isSaving,
  isDeleting,
  onEditStart,
  onStudy,
  onSave,
  onSetMode,
  onDeleteConfirm,
}: DeckDetailActionsProps): ReactElement {
  return (
    <div className="flex gap-2 shrink-0">
      {mode === 'view' && (
        <>
          <button className="btn btn-secondary" onClick={onEditStart}>Edit Cards</button>
          <button className="btn btn-primary" onClick={onStudy}>Study Now</button>
          <button
            className="btn btn-secondary"
            style={{ color: 'var(--color-coral)', borderColor: 'var(--color-coral)', boxShadow: '3px 3px 0 var(--color-coral)' }}
            onClick={() => onSetMode('confirm-delete')}
          >
            Delete
          </button>
        </>
      )}
      {mode === 'edit' && (
        <>
          <button className="btn btn-secondary" onClick={() => onSetMode('view')} disabled={isSaving}>Cancel</button>
          <button className="btn btn-primary" onClick={onSave} disabled={isSaving}>
            {isSaving ? 'Saving…' : 'Save'}
          </button>
        </>
      )}
      {mode === 'confirm-delete' && (
        <div className="flex items-center gap-3">
          <span className="text-sm font-semibold" style={{ color: 'var(--color-ink)' }}>
            Delete this deck?
          </span>
          <button className="btn btn-secondary" onClick={() => onSetMode('view')} disabled={isDeleting}>Cancel</button>
          <button
            className="btn btn-primary"
            style={{ background: 'var(--color-coral)' }}
            onClick={onDeleteConfirm}
            disabled={isDeleting}
          >
            {isDeleting ? 'Deleting…' : 'Yes, delete'}
          </button>
        </div>
      )}
    </div>
  )
}
