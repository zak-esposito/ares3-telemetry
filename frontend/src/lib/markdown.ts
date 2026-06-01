import { marked } from 'marked'
import DOMPurify from 'dompurify'

marked.setOptions({ gfm: true, breaks: true })

/**
 * Converts the advisor's Markdown into sanitised HTML ready for injection.
 * marked does not sanitise, so the LLM-generated output is run through
 * DOMPurify before it ever reaches dangerouslySetInnerHTML.
 */
export function renderMarkdown(source: string): string {
  const html = marked.parse(source, { async: false })
  return DOMPurify.sanitize(html)
}
