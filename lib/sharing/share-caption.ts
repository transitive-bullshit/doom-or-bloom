import type { Translator } from '@/i18n/translator'
import { unclearToken } from '@/lib/assessment/present-result'

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

function inferredToken(t: Translator, token: string) {
  if (token.startsWith('<')) return t('Share.under', { value: token.slice(1) })
  if (token.startsWith('>')) return t('Share.over', { value: token.slice(1) })
  return token.replace('≈', '~')
}

/** The prefilled post, one whole message per combination of facts shown. */
export function shareCaption(
  t: Translator,
  {
    risk,
    closest
  }: {
    risk?: Risk | null
    closest?: string
  }
) {
  const token = risk?.token && risk.token !== unclearToken ? risk.token : null
  if (!token)
    return closest
      ? t('Share.caption.closest', { closest })
      : t('Share.caption.none')
  if (risk?.source === 'inferred') {
    const value = inferredToken(t, token)
    return closest
      ? t('Share.caption.inferredClosest', { token: value, closest })
      : t('Share.caption.inferred', { token: value })
  }
  return closest
    ? t('Share.caption.statedClosest', { token, closest })
    : t('Share.caption.stated', { token })
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
