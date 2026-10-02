/** A published simulated-user profile that prose can link a name to. */
export type ProfileName = { slug: string; name: string }

/** Prose split into plain text and the names of people with a profile. */
export type MentionPart = { text: string; slug?: string }

/**
 * Splits text into parts, linking each person's first mention. Pass the same
 * set to several calls to link a person only once across them.
 */
export type ProfileMentions = (
  text: string,
  linked?: Set<string>
) => MentionPart[]

const escape = (text: string) => text.replace(/[.*+?^${}()|[\]\\]/gu, '\\$&')
const normalize = (text: string) => text.trim().replace(/\s+/gu, ' ')

/** "Emily M. Bender" is often written without the middle initial. */
function variants(name: string) {
  const bare = name.replace(/\s\p{Lu}\.(?=\s)/gu, '')
  return bare === name ? [name] : [name, bare]
}

/**
 * Finds the full names of people with a published profile, so pages can link
 * each to /users/<slug>. Matching is exact and case-sensitive on whole words.
 * Single-word names (Roon, Mira, Seconds, janus) read as ordinary words too
 * often to link automatically.
 */
export function profileMentions(
  people: readonly ProfileName[]
): ProfileMentions {
  const slugs = new Map<string, string>()
  for (const { slug, name } of people) {
    const full = normalize(name)
    if (!full.includes(' ')) continue
    for (const variant of variants(full))
      if (!slugs.has(variant)) slugs.set(variant, slug)
  }
  if (!slugs.size) return (text) => [{ text }]
  const names = [...slugs.keys()]
    .toSorted((a, b) => b.length - a.length)
    .map((name) => escape(name).replaceAll(' ', '\\s+'))
  // A neighboring letter, digit or hyphen means a longer word or name.
  const pattern = new RegExp(
    `(?<![\\p{L}\\p{N}-])(?:${names.join('|')})(?![\\p{L}\\p{N}-])`,
    'gu'
  )
  return (text, linked = new Set()) => {
    const parts: MentionPart[] = []
    let last = 0
    for (const match of text.matchAll(pattern)) {
      const slug = slugs.get(normalize(match[0]))!
      if (linked.has(slug)) continue
      linked.add(slug)
      if (match.index > last)
        parts.push({ text: text.slice(last, match.index) })
      parts.push({ text: match[0], slug })
      last = match.index + match[0].length
    }
    if (last < text.length || !parts.length)
      parts.push({ text: text.slice(last) })
    return parts
  }
}
