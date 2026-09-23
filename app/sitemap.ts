import { loadExamples } from '@/components/landing/data'
import type { MetadataRoute } from 'next'
import { publicPages, siteUrl } from '@/lib/site'

export const dynamic = 'force-dynamic'
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const personaPages = (await loadExamples(false)).map((person) => ({
    path: `/users/${person.slug}`
  }))
  return [...publicPages, ...personaPages].map(({ path }) => ({
    url: `${siteUrl}${path}`
  }))
}
