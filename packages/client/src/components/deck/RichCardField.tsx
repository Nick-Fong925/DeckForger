import { useEditor, EditorContent } from '@tiptap/react'
import { StarterKit } from '@tiptap/starter-kit'
import { useEffect, type ReactElement } from 'react'

type ToolbarButtonProps = {
  onClick: () => void
  isActive: boolean
  label: string
  title: string
}

// onMouseDown + preventDefault keeps editor focus so the selection is preserved
// when a toolbar button is clicked — without this, toggleBold etc. lose the selection
function ToolbarButton({ onClick, isActive, label, title }: ToolbarButtonProps): ReactElement {
  return (
    <button
      type="button"
      onMouseDown={(e) => { e.preventDefault(); onClick() }}
      title={title}
      className="w-7 h-7 flex items-center justify-center rounded text-xs font-bold transition-colors"
      style={{
        background: isActive ? 'var(--color-ink)' : 'transparent',
        color: isActive ? 'var(--color-card)' : 'var(--color-ink)',
      }}
    >
      {label}
    </button>
  )
}

// Tiptap's empty doc serialises to <p></p>; treat that as equivalent to '' for sync
const normalizeHtml = (html: string): string => (html === '<p></p>' ? '' : html)

type RichCardFieldProps = {
  value: string
  onChange: (html: string) => void
}

export default function RichCardField({ value, onChange }: RichCardFieldProps): ReactElement | null {
  const editor = useEditor({
    extensions: [StarterKit],
    content: value,
    editorProps: {
      attributes: { class: 'rich-editor-input' },
    },
    onUpdate: ({ editor: e }) => onChange(e.getHTML()),
  })

  // Sync external value changes (e.g. entering edit mode resets cards to stored HTML)
  useEffect(() => {
    if (!editor) return
    if (normalizeHtml(editor.getHTML()) !== normalizeHtml(value)) {
      editor.commands.setContent(value)
    }
  }, [value, editor])

  if (!editor) return null

  return (
    <div
      className="rounded-lg overflow-hidden"
      style={{ border: '1.5px solid var(--color-tan)', background: 'var(--color-card)' }}
    >
      {/* Toolbar */}
      <div
        className="flex gap-0.5 px-2 py-1.5"
        style={{ borderBottom: '1.5px solid var(--color-tan)', background: 'var(--color-parchment)' }}
      >
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBold().run()}
          isActive={editor.isActive('bold')}
          label="B"
          title="Bold (Ctrl+B)"
        />
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleItalic().run()}
          isActive={editor.isActive('italic')}
          label="I"
          title="Italic (Ctrl+I)"
        />
        <div style={{ width: '1px', background: 'var(--color-tan)', margin: '2px 4px' }} />
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          isActive={editor.isActive('bulletList')}
          label="•–"
          title="Bullet list"
        />
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          isActive={editor.isActive('orderedList')}
          label="1."
          title="Numbered list"
        />
        <div style={{ width: '1px', background: 'var(--color-tan)', margin: '2px 4px' }} />
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleCode().run()}
          isActive={editor.isActive('code')}
          label="<>"
          title="Inline code"
        />
      </div>
      {/* Editor area */}
      <EditorContent editor={editor} />
    </div>
  )
}
