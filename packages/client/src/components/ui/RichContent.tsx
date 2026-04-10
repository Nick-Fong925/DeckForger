import DOMPurify from 'dompurify'
import { type ReactElement } from 'react'

// Only permit the structural/semantic tags Tiptap produces.
// ALLOWED_ATTR: [] strips every attribute — no class, style, href, src, or event handlers.
// RETURN_DOM: false is explicit so the cast to string is structurally guaranteed,
// not just assumed (if RETURN_DOM were ever set to true, sanitize returns a Node, not string).
const CLEAN_CONFIG = {
  ALLOWED_TAGS: ['p', 'strong', 'em', 'ul', 'ol', 'li', 'code', 'pre', 'h1', 'h2', 'h3', 'h4', 'br', 'blockquote'],
  ALLOWED_ATTR: [] as string[],
  RETURN_DOM: false as const,
  RETURN_DOM_FRAGMENT: false as const,
}

type RichContentProps = {
  content: string
  className?: string
}

export default function RichContent({ content, className = '' }: RichContentProps): ReactElement {
  const sanitized = DOMPurify.sanitize(content, CLEAN_CONFIG) as unknown as string

  return (
    <div
      className={`rich-content ${className}`.trim()}
      dangerouslySetInnerHTML={{ __html: sanitized }}
    />
  )
}
