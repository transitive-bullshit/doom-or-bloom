import type { MetadataRoute } from 'next'
import { defaultLocale, locales } from '@/i18n/config'
import { siteUrl } from '@/lib/site'

// Owner routes exist under every locale prefix; English has none.
const ownerRoutes = locales.flatMap((locale) => {
  const prefix = locale === defaultLocale ? '' : `/${locale}`
  return [
    `${prefix}/assessment$`,
    `${prefix}/assessment/`,
    `${prefix}/assessments$`,
    `${prefix}/assessments?`,
    `${prefix}/assessments/`
  ]
})

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: [
        '/api/',
        '/api$',
        ...ownerRoutes,
        '/public/assessments/*/data$'
      ]
    },
    sitemap: `${siteUrl}/sitemap.xml`
  }
}
