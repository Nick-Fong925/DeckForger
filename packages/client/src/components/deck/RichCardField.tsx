import { useEditor, EditorContent } from '@tiptap/react'
import { StarterKit } from '@tiptap/starter-kit'
import { TextStyle } from '@tiptap/extension-text-style'
import { Extension } from '@tiptap/core'
import { useEffect, useRef, type ReactElement } from 'react'

// Custom FontSize extension — stores fontSize as an inline style via TextStyle
const FontSize = Extension.create({
  name: 'fontSize',
  addGlobalAttributes() {
    return [{
      types: ['textStyle'],
      attributes: {
        fontSize: {
          default: null,
          parseHTML: (el) => (el as HTMLElement).style.fontSize || null,
          renderHTML: (attrs) => attrs.fontSize ? { style: `font-size: ${attrs.fontSize}` } : {},
        },
      },
    }]
  },
  addCommands() {
    return {
      setFontSize: (fontSize: string) => ({ chain }) =>
        chain().setMark('textStyle', { fontSize }).run(),
      unsetFontSize: () => ({ chain }) =>
        chain().setMark('textStyle', { fontSize: null }).removeEmptyTextStyle().run(),
    }
  },
})

const FONT_SIZES: { label: string; value: string }[] = [
  { label: 'S',  value: '0.75rem' },
  { label: 'M',  value: '0.875rem' },
  { label: 'L',  value: '1.125rem' },
  { label: 'XL', value: '1.5rem' },
]
const DEFAULT_SIZE = '0.875rem'

const EDITOR_HEIGHT_PX: Record<'normal' | 'large', number> = {
  normal: 120,
  large:  240,
}

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
  size?: 'normal' | 'large'
}

export default function RichCardField({ value, onChange, size = 'normal' }: RichCardFieldProps): ReactElement | null {
  const maxHeightPx = EDITOR_HEIGHT_PX[size]
  // Ref so the onUpdate closure always sees the current maxHeightPx without re-creating the editor
  const maxHeightRef = useRef(maxHeightPx)
  maxHeightRef.current = maxHeightPx

  const editor = useEditor({
    extensions: [StarterKit, TextStyle, FontSize],
    content: value,
    editorProps: {
      attributes: { class: 'rich-editor-input' },
      handleKeyDown: (_view, event) => {
        // Tab would create list indentation and grow content — block it entirely.
        // Users navigate between fields with Tab via normal browser focus order.
        if (event.key === 'Tab') {
          event.preventDefault()
          return true
        }
        return false
      },
    },
    onUpdate: ({ editor: e }) => {
      // If the content now exceeds the box height, revert and bail — don't call onChange.
      if (e.view.dom.scrollHeight > maxHeightRef.current) {
        e.commands.undo()
        return
      }
      onChange(e.getHTML())
    },
  })

  // Sync external value changes (e.g. entering edit mode resets cards to stored HTML)
  useEffect(() => {
    if (!editor) return
    if (normalizeHtml(editor.getHTML()) !== normalizeHtml(value)) {
      editor.commands.setContent(value)
    }
  }, [value, editor])

  if (!editor) return null

  const activeFontSize = FONT_SIZES.find((s) =>
    editor.isActive('textStyle', { fontSize: s.value })
  )?.value ?? DEFAULT_SIZE

  return (
    <div
      className="rounded-lg overflow-hidden"
      style={{ border: '1.5px solid var(--color-tan)', background: 'var(--color-card)' }}
    >
      {/* Toolbar */}
      <div
        className="flex gap-0.5 px-2 py-1.5 flex-wrap"
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
        <div style={{ width: '1px', background: 'var(--color-tan)', margin: '2px 4px' }} />
        {FONT_SIZES.map((s) => (
          <ToolbarButton
            key={s.value}
            onClick={() => editor.chain().focus().selectAll().setFontSize(s.value).run()}
            isActive={activeFontSize === s.value}
            label={s.label}
            title={`Font size: ${s.label}`}
          />
        ))}
      </div>
      {/* Editor area — hard-clipped; overflow is hidden and content is blocked at the limit */}
      <div style={{ height: `${maxHeightPx}px`, overflow: 'hidden' }}>
        <EditorContent editor={editor} />
      </div>
    </div>
  )
}
