import type { MetadataRoute } from 'next'
import { personaPages, publicPages, siteUrl } from '@/lib/site'

export default function sitemap(): MetadataRoute.Sitemap {
  return [...publicPages, ...personaPages].map(({ path }) => ({
    url: `${siteUrl}${path}`
  }))
}
