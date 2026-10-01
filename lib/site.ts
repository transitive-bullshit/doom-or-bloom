import type { Messages } from 'next-intl'

export const siteUrl = 'https://www.doom-or-bloom.com'

/** The site's author, credited in structured data and on blog posts. */
export const siteCreator = {
  name: 'Travis Fischer',
  url: 'https://x.com/transitive_bs'
} as const

/**
 * Discoverable static pages. Titles and descriptions live in
 * messages/<locale>.json under `Pages.<key>`. `translated` marks pages whose
 * main content exists in every enabled locale: only those advertise hreflang
 * alternates and let search engines index their non-English URLs. The P(doom)
 * hub keeps an English body under translated chrome.
 */
export const publicPages = [
  { key: 'home', path: '/', translated: true },
  { key: 'about', path: '/about', translated: true },
  { key: 'privacy', path: '/privacy', translated: true },
  { key: 'users', path: '/users', translated: true },
  { key: 'pdoom', path: '/p-doom', translated: false }
] as const satisfies readonly {
  key: keyof Messages['Pages']
  path: string
  translated: boolean
}[]
export type PublicPageKey = (typeof publicPages)[number]['key']
