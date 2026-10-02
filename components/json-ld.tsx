import { getLocale, getTranslations } from 'next-intl/server'
import { breadcrumbTrail } from '@/lib/breadcrumbs'
import {
  breadcrumbJsonLd,
  serializeJsonLd,
  type JsonLdDocument
} from '@/lib/seo/json-ld'

/** Structured data for search engines, rendered in the page body. */
export function JsonLd({ data }: { data: JsonLdDocument }) {
  return (
    <script
      type='application/ld+json'
      dangerouslySetInnerHTML={{ __html: serializeJsonLd(data) }}
    />
  )
}

/** The page's visible breadcrumbs as a BreadcrumbList. */
export async function BreadcrumbJsonLd({
  path,
  title
}: {
  path: string
  /** The last crumb of a page that names itself, such as a blog post. */
  title?: string
}) {
  const [locale, t] = await Promise.all([
    getLocale(),
    getTranslations('Breadcrumbs')
  ])
  const trail = breadcrumbTrail(path, t, title)
  return trail && <JsonLd data={breadcrumbJsonLd(trail, path, locale)} />
}
