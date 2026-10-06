// Section ids for post headings, so a link can open a section of a post
// (`/blog/<slug>#<id>`). Ids come from the English heading text. A
// translation keeps the English heading levels in order (lib/blog/l10n.ts), so
// its headings take the ids of the English headings in the same position and
// a link opens the same section in every language (docs/BLOG.md#writing-a-post).

/** "How Doom or Bloom estimates P(doom)" becomes "how-doom-or-bloom-estimates-pdoom". */
export function headingId(text: string) {
  return text
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/gu, '')
    .toLowerCase()
    .replace(/[^\p{L}\p{M}\p{N}\s-]/gu, '')
    .trim()
    .replace(/[\s-]+/gu, '-')
}

/** A Markdown heading's text as it renders: no link targets, emphasis or escapes. */
const headingText = (markdown: string) =>
  markdown
    .replace(/\[([^\]]*)\]\([^)]*\)/gu, '$1')
    .replace(/[*_`]/gu, '')
    .replace(/\\(.)/gu, '$1')
    .trim()

/** The text of each section heading (levels 2 to 6) in a post body, in order. */
export const postHeadings = (body: string) =>
  [
    ...body
      .replace(/```[\s\S]*?```/gu, '')
      .matchAll(/^#{2,6}\s+(.+?)\s*#*\s*$/gmu)
  ].map(([, text]) => headingText(text!))

/**
 * Maps each heading's text as it renders in `body` to its id, taken from the
 * English heading in the same position. `english` is the English body, or
 * omitted when `body` is the English.
 */
export function headingIds(body: string, english = body) {
  const ids = postHeadings(english).map(headingId)
  return Object.fromEntries(
    postHeadings(body).map((text, index) => [
      text,
      ids[index] ?? headingId(text)
    ])
  )
}
