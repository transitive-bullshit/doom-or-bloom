import defaultSocialImage from '@/app/opengraph-image.png'
import type { Metadata } from 'next'
import { siteUrl } from '@/lib/site'
import { siteSocialAlt } from '@/lib/sharing/site-social-card'

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
