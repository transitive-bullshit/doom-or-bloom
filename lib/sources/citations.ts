import type { MentionPart } from '@/lib/personas/mentions'

// Numbered sources, shared by every page that cites: the P(doom) hub, About's
// methodology and blog posts. Prose cites a source with a `[^key]` marker; the
// first citation of each source numbers it, and the page ends with the
// numbered list (components/sources). See docs/BLOG.md#citing-sources.

/** A work a page cites or recommends. */
export type Source = {
  title: string
  url: string
  /** Author or organization. */
  by: string
  /** Left off for an undated page, such as a wiki or a code file. */
  year?: number
  /** The full publication date (YYYY-MM-DD), where the data records it. */
  published?: string
}

/** A `[^key]` citation marker; keys are lowercase words joined by hyphens. */
const citeMarker = /\[\^([a-z0-9]+(?:-[a-z0-9]+)*)\]/gu

/** Prose split into plain text, emphasis (titles) and citation markers. */
export type Segment = { text: string } | { emphasis: string } | { cite: string }

const markup = new RegExp(`${citeMarker.source}|\\*([^*]+)\\*`, 'gu')

/** Splits prose: `*Title*` is emphasis and `[^key]` cites a source. */
export function segments(prose: string): Segment[] {
  const parts: Segment[] = []
  let last = 0
  for (const match of prose.matchAll(markup)) {
    if (match.index > last) parts.push({ text: prose.slice(last, match.index) })
    parts.push(match[1] ? { cite: match[1] } : { emphasis: match[2]! })
    last = match.index + match[0].length
  }
  if (last < prose.length) parts.push({ text: prose.slice(last) })
  return parts
}

/** Splits text at citation markers only, for prose whose emphasis is markup. */
export function citationParts(
  text: string
): ({ text: string } | { cite: string })[] {
  const parts: ({ text: string } | { cite: string })[] = []
  let last = 0
  for (const match of text.matchAll(citeMarker)) {
    if (match.index > last) parts.push({ text: text.slice(last, match.index) })
    parts.push({ cite: match[1]! })
    last = match.index + match[0].length
  }
  if (last < text.length) parts.push({ text: text.slice(last) })
  return parts
}

/** Every key a text cites, in order of first citation. */
export const citedKeys = (text: string) => [
  ...new Set([...text.matchAll(citeMarker)].map((match) => match[1]!))
]

/** A citation marker: its footnote number, and an anchor on its first use. */
export type Citation = { number: number; id?: string }
export type Footnote = Source & { number: number }
/** A footnote whose authors link to their profiles. */
export type SourceFootnote = Footnote & { byline: MentionPart[] }

/**
 * Prose with each citation resolved to its footnote number, and the names of
 * people with a profile marked for linking.
 */
export type CitedProse = (MentionPart | { emphasis: string } | Citation)[]

/**
 * Numbers footnotes in order of first citation. A source cited again keeps its
 * number; only its first marker carries the anchor footnotes link back to.
 */
export function footnoteRegistry() {
  const numbers = new Map<string, number>()
  const footnotes: Footnote[] = []
  return {
    cite: (source: Source): Citation => {
      const known = numbers.get(source.url)
      if (known) return { number: known }
      const number = footnotes.length + 1
      numbers.set(source.url, number)
      footnotes.push({ ...source, number })
      return { number, id: citationId(number) }
    },
    footnotes
  }
}

/** Footnotes with bylines split for profile links (or as plain text). */
export const withBylines = (
  footnotes: readonly Footnote[],
  mention: (text: string) => MentionPart[] = (text) => [{ text }]
): SourceFootnote[] =>
  footnotes.map((footnote) => ({ ...footnote, byline: mention(footnote.by) }))

const citationId = (number: number) => `cite-${number}`
export const footnoteId = (number: number) => `source-${number}`
