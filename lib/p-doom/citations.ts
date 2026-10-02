/** A work the P(doom) hub cites or recommends. */
export type HubSource = {
  title: string
  url: string
  /** Author or organization. */
  by: string
  year: number
}

/** Prose split into plain text, emphasis (titles) and citation markers. */
export type Segment = { text: string } | { emphasis: string } | { cite: string }

const markup = /\[\^([a-z0-9-]+)\]|\*([^*]+)\*/g

/** Splits hub prose: `*Title*` is emphasis and `[^key]` cites a source. */
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

/** A citation marker: its footnote number, and an anchor on its first use. */
export type Citation = { number: number; id?: string }
export type Footnote = HubSource & { number: number }

/**
 * Numbers footnotes in order of first citation. A source cited again keeps its
 * number; only its first marker carries the anchor footnotes link back to.
 */
export function footnoteRegistry() {
  const numbers = new Map<string, number>()
  const footnotes: Footnote[] = []
  return {
    cite: (source: HubSource): Citation => {
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

const citationId = (number: number) => `cite-${number}`
export const footnoteId = (number: number) => `source-${number}`
