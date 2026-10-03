import { loadExamples } from '@/components/landing/data'
import type { MetadataRoute } from 'next'
import { languageAlternates, localizedPath, locales } from '@/i18n/config'
import { blogPosts, isTranslated } from '@/lib/blog/posts'
import { publicPages, siteUrl } from '@/lib/site'

export const dynamic = 'error'
export const revalidate = 172800
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const people = await loadExamples(false)
  // Translated pages list every locale URL, each with the full alternate set.
  // Others (chrome-only translations: the P(doom) hub, the blog index,
  // profiles and English-only posts) list only their indexable English URL.
  const pages = publicPages.flatMap(({ path, translated }) => {
    if (!translated) return [{ url: `${siteUrl}${path}` }]
    const languages = languageAlternates(siteUrl, path)
    return locales.map((locale) => ({
      url: `${siteUrl}${localizedPath(path, locale)}`,
      alternates: { languages }
    }))
  })
  // A translated post lists every locale URL; an English-only post its own.
  const posts = blogPosts().flatMap((post) => {
    const path = `/blog/${post.slug}`
    const lastModified = post.updated ?? post.date
    if (!isTranslated(post.slug))
      return [{ url: `${siteUrl}${path}`, lastModified }]
    const languages = languageAlternates(siteUrl, path)
    return locales.map((locale) => ({
      url: `${siteUrl}${localizedPath(path, locale)}`,
      lastModified,
      alternates: { languages }
    }))
  })
  return [
    ...pages,
    ...posts,
    ...people.map((person) => ({ url: `${siteUrl}/users/${person.slug}` }))
  ]
}
