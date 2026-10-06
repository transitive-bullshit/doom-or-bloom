import { defaultLocale, locales } from '../../i18n/config'

// Posts whose slug changed, from the old slug to the new one (docs/BLOG.md
// #writing-a-post). Never reuse an old slug for another post.
export const movedPosts: Record<string, string> = {
  // Renamed October 6, 2026, so the post stops competing with /p-doom.
  'what-is-p-doom': 'why-p-doom-estimates-vary'
}

const prefixes = locales.filter((locale) => locale !== defaultLocale).join('|')

/**
 * Permanent (308) redirects from a moved post's old URLs to its new slug, in
 * every locale, with anything under it such as the post card. next.config.ts
 * runs them before the locale redirects, so a remembered language still
 * applies to the new URL.
 */
export function movedPostRedirects() {
  return Object.entries(movedPosts).flatMap(([from, to]) => [
    {
      source: `/blog/${from}/:rest*`,
      destination: `/blog/${to}/:rest*`,
      permanent: true
    },
    {
      source: `/:locale(${prefixes})/blog/${from}/:rest*`,
      destination: `/:locale/blog/${to}/:rest*`,
      permanent: true
    }
  ])
}
