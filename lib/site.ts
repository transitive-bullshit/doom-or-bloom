import type { Messages } from 'next-intl'

export const siteUrl = 'https://www.doom-or-bloom.com'

/**
 * Discoverable static pages. Titles and descriptions live in
 * messages/<locale>.json under `Pages.<key>`. `translated` marks pages whose
 * main content exists in every enabled locale: only those advertise hreflang
 * alternates and let search engines index their non-English URLs.
 */
export const publicPages = [
  { key: 'home', path: '/', translated: true },
  { key: 'about', path: '/about', translated: false },
  { key: 'privacy', path: '/privacy', translated: false },
  { key: 'users', path: '/users', translated: true }
] as const satisfies readonly {
  key: keyof Messages['Pages']
  path: string
  translated: boolean
}[]
export type PublicPageKey = (typeof publicPages)[number]['key']
