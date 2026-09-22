import defaultSocialImage from '@/app/opengraph-image.jpg'
import type { Metadata } from 'next'
import { siteUrl } from '@/lib/site'

export function pageMetadata({
  path,
  title,
  description,
  image,
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
  // Import the actual file so its dimensions and cache-busting URL track replacements.
  const images = [
    {
      url: `${siteUrl}${image ?? defaultSocialImage.src}`,
      width: image ? 1200 : defaultSocialImage.width,
      height: image ? 630 : defaultSocialImage.height,
      alt: image
        ? imageAlt
        : 'Doom or Bloom — Map your AI worldview. A flowering plant intertwined with copper circuits.',
      type: image ? 'image/webp' : 'image/jpeg'
    }
  ]
  const openGraph: NonNullable<Metadata['openGraph']> = {
    type: 'website',
    locale: 'en_US',
    siteName: 'Doom or Bloom',
    title: fullTitle,
    description,
    url: `${siteUrl}${path}`
  }
  const twitter: NonNullable<Metadata['twitter']> = {
    card: 'summary_large_image',
    title: fullTitle,
    description
  }
  openGraph.images = images
  twitter.images = images
  return {
    title: fullTitle,
    description,
    alternates: { canonical: `${siteUrl}${path}` },
    openGraph,
    twitter
  }
}
