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
 * Ids for headings in order, numbering repeats as GitHub does ("results",
 * "results-1"), skipping any id already taken, even by a heading that reads
 * like a numbered one.
 */
function uniqueHeadingIds(texts: string[]) {
  const used = new Set<string>()
  return texts.map((text) => {
    const base = headingId(text)
    let id = base
    for (let n = 1; used.has(id); n++) id = `${base}-${n}`
    used.add(id)
    return id
  })
}

/**
 * Maps each heading's text as it renders in `body` to its ids, one per
 * occurrence in order, taken from the English heading in the same position.
 * `english` is the English body, or omitted when `body` is the English.
 */
export function headingIds(body: string, english = body) {
  const ids = uniqueHeadingIds(postHeadings(english))
  const byText: Record<string, string[]> = {}
  postHeadings(body).forEach((text, index) => {
    ;(byText[text] ??= []).push(ids[index] ?? headingId(text))
  })
  return byText
}
