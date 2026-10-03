import defaultSocialImage from '@/app/opengraph-image.png'
import type { Metadata } from 'next'
import { getLocale, getTranslations } from 'next-intl/server'
import {
  defaultLocale,
  languageAlternates,
  localizedPath,
  locales,
  openGraphLocale,
  type Locale
} from '@/i18n/config'
import { publicPages, siteTitle, siteUrl, type PublicPageKey } from '@/lib/site'
import { siteSocialAlt } from '@/lib/sharing/site-social-card'

/**
 * `translated` pages list every locale as an hreflang alternate, keyed by its
 * BCP 47 tag (English is x-default), and canonicalize to themselves. Other pages have translated chrome
 * only: their non-English URLs are noindex and canonicalize to English.
 */
export function pageMetadata({
  path,
  title,
  description,
  image,
  imageAlt = 'Doom or Bloom — explore the AI worldview map',
  locale,
  translated,
  article,
  feed
}: {
  path: string
  title: string
  description: string
  image?: string
  imageAlt?: string
  locale: Locale
  translated: boolean
  /** A blog post: og:type article with its dates and author. */
  article?: { publishedTime: string; modifiedTime?: string; authors: string[] }
  /** Advertise the blog's RSS feed. */
  feed?: boolean
}): Metadata {
  const url = (target: Locale) => `${siteUrl}${localizedPath(path, target)}`
  // A page without translated content describes itself as its English original.
  const canonical = translated ? locale : defaultLocale
  const fullTitle = siteTitle(title)
  // Import the generated file so its dimensions and cache-busting URL track
  // regeneration (`pnpm social-image:generate`). Every social image is a PNG.
  const images = [
    {
      url: `${siteUrl}${image ?? defaultSocialImage.src}`,
      width: image ? 1200 : defaultSocialImage.width,
      height: image ? 630 : defaultSocialImage.height,
      alt: image ? imageAlt : siteSocialAlt,
      type: 'image/png'
    }
  ]
  const openGraph: NonNullable<Metadata['openGraph']> = {
    ...(article ? { type: 'article', ...article } : { type: 'website' }),
    locale: openGraphLocale(canonical),
    siteName: 'Doom or Bloom',
    title: fullTitle,
    description,
    url: url(canonical)
  }
  const twitter: NonNullable<Metadata['twitter']> = {
    card: 'summary_large_image',
    title: fullTitle,
    description
  }
  openGraph.images = images
  twitter.images = images
  if (translated) {
    openGraph.alternateLocale = locales
      .filter((other) => other !== locale)
      .map(openGraphLocale)
    return {
      title: fullTitle,
      description,
      alternates: {
        canonical: url(canonical),
        languages: languageAlternates(siteUrl, path),
        ...(feed && {
          types: { 'application/rss+xml': `${siteUrl}/blog/rss.xml` }
        })
      },
      openGraph,
      twitter
    }
  }
  return {
    title: fullTitle,
    description,
    alternates: {
      canonical: url(canonical),
      ...(feed && {
        types: { 'application/rss+xml': `${siteUrl}/blog/rss.xml` }
      })
    },
    ...(locale !== defaultLocale && { robots: { index: false, follow: true } }),
    openGraph,
    twitter
  }
}

/** Metadata for an entry in `publicPages`, in the current request's locale. */
export async function publicPageMetadata(
  key: PublicPageKey,
  options: { feed?: boolean } = {}
) {
  const page = publicPages.find((entry) => entry.key === key)!
  const [locale, t] = await Promise.all([getLocale(), getTranslations('Pages')])
  return pageMetadata({
    path: page.path,
    title: t(`${key}.title`),
    description: t(`${key}.description`),
    locale,
    translated: page.translated,
    ...options
  })
}
