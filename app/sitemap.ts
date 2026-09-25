import { loadExamples } from '@/components/landing/data'
import type { MetadataRoute } from 'next'
import { publicPages, siteUrl } from '@/lib/site'

export const dynamic = 'error'
export const revalidate = 172800
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const people = await loadExamples(false)
  const personaPages = people.map((person) => ({
    path: `/users/${person.slug}`
  }))
  return [...publicPages, ...personaPages].map(({ path }) => ({
    url: `${siteUrl}${path}`
  }))
}
