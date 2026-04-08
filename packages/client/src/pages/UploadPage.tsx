import { useState, type ReactElement } from 'react'

const acceptedTypes = [
  { ext: 'PDF', icon: '📄', desc: 'Extract text and generate cards with AI' },
  { ext: 'PPTX', icon: '📊', desc: 'Extract slides and generate cards with AI' },
  { ext: 'CSV', icon: '📋', desc: 'Import front/back columns directly' },
  { ext: 'APKG', icon: '🃏', desc: 'Import an existing Anki deck' },
]

export default function UploadPage(): ReactElement {
  const [file, setFile] = useState<File | null>(null)
  const [dragging, setDragging] = useState(false)

  function handleDrop(e: React.DragEvent) {
    e.preventDefault()
    setDragging(false)
    const dropped = e.dataTransfer.files[0]
    if (dropped) setFile(dropped)
  }

  return (
    <div className="w-full max-w-2xl space-y-8">
      <div>
        <h1 className="font-display text-2xl sm:text-3xl" style={{ color: 'var(--color-ink)' }}>
          Upload a File
        </h1>
        <p className="text-sm font-semibold mt-1" style={{ color: 'var(--color-ink-muted)' }}>
          We'll turn it into a deck you can study
        </p>
      </div>

      {/* Drop zone */}
      <div
        onDrop={handleDrop}
        onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
        onDragLeave={() => setDragging(false)}
        className="card flex flex-col items-center gap-3 py-10 px-6 sm:py-12 sm:px-8 text-center transition-colors"
        style={
          dragging
            ? { background: 'var(--color-amber-light)', borderColor: 'var(--color-ink)' }
            : {}
        }
      >
        <span className="text-5xl">{dragging ? '🎯' : '☁️'}</span>
        <p className="font-bold text-lg" style={{ color: 'var(--color-ink)' }}>
          Drop your file here
        </p>
        <p className="text-sm font-semibold" style={{ color: 'var(--color-ink-muted)' }}>
          PDF, PPTX, CSV, or APKG
        </p>
        <label className="btn btn-secondary mt-2 cursor-pointer">
          Browse files
          <input
            type="file"
            accept=".pdf,.pptx,.csv,.apkg"
            className="sr-only"
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
          />
        </label>
      </div>

      {/* Selected file */}
      {file && (
        <div className="card flex items-center gap-4 px-5 py-4">
          <span className="text-2xl">📎</span>
          <div className="flex-1 min-w-0">
            <p className="font-bold truncate" style={{ color: 'var(--color-ink)' }}>
              {file.name}
            </p>
            <p className="text-xs font-semibold mt-0.5" style={{ color: 'var(--color-ink-muted)' }}>
              {(file.size / 1024).toFixed(0)} KB
            </p>
          </div>
          <button className="btn btn-primary">Generate Deck</button>
        </div>
      )}

      {/* Supported types */}
      <div>
        <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: 'var(--color-ink-muted)' }}>
          Supported formats
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {acceptedTypes.map(({ ext, icon, desc }) => (
            <div
              key={ext}
              className="card flex items-start gap-3 p-4"
            >
              <span className="text-xl shrink-0">{icon}</span>
              <div>
                <p className="font-bold text-sm" style={{ color: 'var(--color-ink)' }}>
                  {ext}
                </p>
                <p className="text-xs mt-0.5 font-semibold leading-snug" style={{ color: 'var(--color-ink-muted)' }}>
                  {desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
