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
  // The post and what is under it are separate rules: Vercel turns an empty
  // `:rest*` into a trailing slash, which would cost a second redirect.
  return Object.entries(movedPosts).flatMap(([from, to]) =>
    [
      [`/blog/${from}`, `/blog/${to}`],
      [`/blog/${from}/:rest+`, `/blog/${to}/:rest+`],
      [`/:locale(${prefixes})/blog/${from}`, `/:locale/blog/${to}`],
      [
        `/:locale(${prefixes})/blog/${from}/:rest+`,
        `/:locale/blog/${to}/:rest+`
      ]
    ].map(([source, destination]) => ({
      source: source!,
      destination: destination!,
      permanent: true
    }))
  )
}
