import type { MetadataRoute } from 'next'
import { siteUrl } from '@/lib/site'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: [
        '/api/',
        '/api$',
        '/assessment$',
        '/assessment/',
        '/assessments$',
        '/assessments?',
        '/assessments/',
        '/public/assessments/*/data$'
      ]
    },
    sitemap: `${siteUrl}/sitemap.xml`
  }
}
