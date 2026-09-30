// Prefilled text for share intents. Only the P(doom) token and a thought
// leader's name leave the page; the participant still reviews and posts it.

export const shareTargets = [
  'native',
  'x',
  'threads',
  'bluesky',
  'linkedin',
  'copy_link'
] as const
export type ShareTarget = (typeof shareTargets)[number]

type Risk = {
  source?: 'stated' | 'inferred' | 'public-statement'
  token?: string
}

function inferredToken(token: string) {
  if (token.startsWith('<')) return `under ${token.slice(1)}`
  if (token.startsWith('>')) return `over ${token.slice(1)}`
  return token.replace('≈', '~')
}

export function shareCaption({
  risk,
  closest
}: {
  risk?: Risk | null
  closest?: string
}) {
  const token = risk?.token && risk.token !== 'Unclear' ? risk.token : null
  const doom = !token
    ? null
    : risk?.source === 'inferred'
      ? `Doom or Bloom reads my P(doom) as ${inferredToken(token)}`
      : `My P(doom) is ${token}`
  const lead =
    doom && closest
      ? `${doom}, and my AI worldview lands closest to ${closest}`
      : doom
        ? doom
        : closest
          ? `Just mapped my AI worldview. It lands closest to ${closest}`
          : 'Just mapped my AI worldview in about 3 minutes'
  return `${lead}\n\nWhere do you land?`
}

/** A link back to the site, tagged so first-touch attribution sees the share. */
export function shareUrl(base: string, target: ShareTarget) {
  const url = new URL(base)
  url.searchParams.set('ref', `share-${target.replace('_', '-')}`)
  return url.href
}

/** Opens the platform's composer. None of them can attach an image. */
export function intentUrl(
  target: 'x' | 'threads' | 'bluesky' | 'linkedin',
  caption: string,
  link: string
) {
  const text = encodeURIComponent(`${caption}\n\n${link}`)
  switch (target) {
    case 'x':
      return `https://x.com/intent/post?text=${encodeURIComponent(caption)}&url=${encodeURIComponent(link)}`
    case 'threads':
      return `https://www.threads.com/intent/post?text=${text}`
    case 'bluesky':
      return `https://bsky.app/intent/compose?text=${text}`
    case 'linkedin':
      // LinkedIn ignores prefilled text; the caption is copied first.
      return `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(link)}`
  }
}
