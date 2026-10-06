import { loadExamples } from '@/components/landing/data'
import type { MetadataRoute } from 'next'
import { languageAlternates, localizedPath, locales } from '@/i18n/config'
import { blogPosts, isTranslated } from '@/lib/blog/posts'
import { hubContent } from '@/lib/p-doom/hub'
import { publicPages, siteUrl } from '@/lib/site'

export const dynamic = 'error'
export const revalidate = 172800
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const people = await loadExamples(false)
  const posts = blogPosts()
  // Only pages with a date their content gives carry a lastmod: the P(doom)
  // hub's newest cited statement, the newest post date for the blog index,
  // each post's date and each profile's generated result. Pages without one
  // (the home page, About, the directory) leave it out rather than guess.
  const lastModified: Partial<
    Record<(typeof publicPages)[number]['key'], string>
  > = {
    pdoom: hubContent(people).asOf,
    blog: posts
      .map((post) => post.updated ?? post.date)
      .reduce((newest, date) => (date > newest ? date : newest), '')
  }
  // Translated pages list every locale URL, each with the full alternate set.
  // Others (chrome-only translations: the P(doom) hub, the blog index,
  // profiles and English-only posts) list only their indexable English URL.
  const pages = publicPages.flatMap(({ key, path, translated }) => {
    const dated = lastModified[key] ? { lastModified: lastModified[key] } : {}
    if (!translated) return [{ url: `${siteUrl}${path}`, ...dated }]
    const languages = languageAlternates(siteUrl, path)
    return locales.map((locale) => ({
      url: `${siteUrl}${localizedPath(path, locale)}`,
      ...dated,
      alternates: { languages }
    }))
  })
  // A translated post lists every locale URL; an English-only post its own.
  const articles = posts.flatMap((post) => {
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
  // A profile changes when its simulation is regenerated or re-scored, the
  // same date its structured data gives as dateModified.
  const profiles = people.map((person) => {
    const generatedAt = person.result.experiment?.generatedAt
    return {
      url: `${siteUrl}/users/${person.slug}`,
      ...(generatedAt && { lastModified: generatedAt })
    }
  })
  return [...pages, ...articles, ...profiles]
}
