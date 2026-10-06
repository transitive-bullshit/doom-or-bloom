import {
  citedKeys,
  footnoteRegistry,
  withBylines,
  type Source
} from '@/lib/sources/citations'
import type { MentionPart } from '@/lib/personas/mentions'

// How blog posts cite (docs/BLOG.md#citing-sources): sources are listed once
// in the post's frontmatter under `sources`, keyed by a short name, and prose
// cites one with a `[^key]` marker. Markers number in order of first citation
// in the English post, so every language shows the same numbers, and the
// page ends with the numbered sources. Links to the site's own pages stay
// ordinary Markdown links.

/** Posts published before citations, which still link sources inline. */
export const inlineLinkPosts = new Set([
  'hacker-news-vs-x',
  'why-p-doom-estimates-vary',
  'why-polls-on-ai-disagree'
])

/** Footnote numbers by key, and the numbered sources a post ends with. */
export function postCitations(
  englishBody: string,
  sources: Readonly<Record<string, Source>> = {},
  mention?: (text: string) => MentionPart[]
) {
  const { cite, footnotes } = footnoteRegistry()
  const numbers: Record<string, number> = {}
  for (const key of citedKeys(englishBody)) {
    const source = sources[key]
    if (!source) throw new Error(`Unknown source [^${key}]`)
    numbers[key] = cite(source).number
  }
  return { numbers, footnotes: withBylines(footnotes, mention) }
}

/** External links written in prose rather than cited. */
export const externalLinks = (body: string) => [
  ...[...body.matchAll(/\]\((https?:\/\/[^)\s]+)/gu)].map((match) => match[1]!),
  ...[...body.matchAll(/<(https?:\/\/[^>\s]+)>/gu)].map((match) => match[1]!),
  ...[...body.matchAll(/href=["'](https?:\/\/[^"']+)/gu)].map(
    (match) => match[1]!
  )
]

/**
 * Problems with how a post cites: markers for sources it doesn't list, listed
 * sources it never cites, markers in headings (which number nothing), its own
 * Sources heading (the page adds one) and external links in prose.
 */
export function postCitationProblems(
  slug: string,
  body: string,
  sources: Readonly<Record<string, Source>> = {}
) {
  const problems: string[] = []
  const cited = citedKeys(body)
  for (const key of cited)
    if (!sources[key]) problems.push(`[^${key}] cites no listed source`)
  for (const key of Object.keys(sources))
    if (!cited.includes(key)) problems.push(`source ${key} is never cited`)
  for (const line of body.split('\n')) {
    if (!/^#{1,6}\s/u.test(line)) continue
    if (citedKeys(line).length) problems.push(`a heading cites: ${line}`)
    if (cited.length && /^#{1,6}\s+Sources\s*$/u.test(line))
      problems.push('the page adds the Sources section; remove this heading')
  }
  if (!inlineLinkPosts.has(slug))
    for (const url of externalLinks(body))
      problems.push(`cite ${url} with a [^key] marker instead of a link`)
  return problems
}
