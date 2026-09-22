import type { Metadata } from 'next'
import { siteUrl } from '@/lib/site'

export function pageMetadata({
  path,
  title,
  description,
  image = '/opengraph-image',
  imageAlt = 'Doom or Bloom — explore the AI worldview map'
}: {
  path: string
  title: string
  description: string
  image?: string
  imageAlt?: string
}): Metadata {
  const fullTitle =
    title === 'Doom or Bloom' ? title : `${title} | Doom or Bloom`
  const images = [
    {
      url: `${siteUrl}${image}`,
      width: 1200,
      height: 630,
      alt: imageAlt,
      type: 'image/webp'
    }
  ]
  return {
    title: fullTitle,
    description,
    alternates: { canonical: `${siteUrl}${path}` },
    openGraph: {
      type: 'website',
      locale: 'en_US',
      siteName: 'Doom or Bloom',
      title: fullTitle,
      description,
      url: `${siteUrl}${path}`,
      images
    },
    twitter: {
      card: 'summary_large_image',
      title: fullTitle,
      description,
      images
    }
  }
}
