import { loadExamples } from '@/components/landing/data'
import type { MetadataRoute } from 'next'
import { languageAlternates, localizedPath, locales } from '@/i18n/config'
import { blogPosts } from '@/lib/blog/posts'
import { publicPages, siteUrl } from '@/lib/site'

export const dynamic = 'error'
export const revalidate = 172800
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const people = await loadExamples(false)
  // Translated pages list every locale URL, each with the full alternate set.
  // Others (chrome-only translations: the P(doom) hub, the blog, profiles and
  // posts) list only their indexable English URL.
  const pages = publicPages.flatMap(({ path, translated }) => {
    if (!translated) return [{ url: `${siteUrl}${path}` }]
    const languages = languageAlternates(siteUrl, path)
    return locales.map((locale) => ({
      url: `${siteUrl}${localizedPath(path, locale)}`,
      alternates: { languages }
    }))
  })
  return [
    ...pages,
    ...blogPosts().map((post) => ({
      url: `${siteUrl}/blog/${post.slug}`,
      lastModified: post.updated ?? post.date
    })),
    ...people.map((person) => ({ url: `${siteUrl}/users/${person.slug}` }))
  ]
}
