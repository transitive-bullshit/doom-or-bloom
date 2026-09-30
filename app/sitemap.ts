import { loadExamples } from '@/components/landing/data'
import type { MetadataRoute } from 'next'
import { defaultLocale, localizedPath, locales } from '@/i18n/config'
import { publicPages, siteUrl } from '@/lib/site'

export const dynamic = 'error'
export const revalidate = 172800
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const people = await loadExamples(false)
  // Translated pages list every locale URL, each with the full alternate set.
  // Others (chrome-only translations) list only their indexable English URL.
  const pages = publicPages.flatMap(({ path, translated }) => {
    if (!translated) return [{ url: `${siteUrl}${path}` }]
    const languages = {
      ...Object.fromEntries(
        locales.map((locale) => [
          locale,
          `${siteUrl}${localizedPath(path, locale)}`
        ])
      ),
      'x-default': `${siteUrl}${localizedPath(path, defaultLocale)}`
    }
    return locales.map((locale) => ({
      url: `${siteUrl}${localizedPath(path, locale)}`,
      alternates: { languages }
    }))
  })
  return [
    ...pages,
    ...people.map((person) => ({ url: `${siteUrl}/users/${person.slug}` }))
  ]
}
