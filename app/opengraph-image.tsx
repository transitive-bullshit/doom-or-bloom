import { ImageResponse } from 'takumi-js/response'
import { loadExamples } from '@/components/landing/data'
import { SocialCard, socialImageOptions } from '@/lib/sharing/social-card'

export const runtime = 'nodejs'
export const alt =
  'Doom or Bloom: explore the AI worldview map, then discover where you land'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/webp'

export default async function Image() {
  const points = (await loadExamples()).flatMap(({ result }) => {
    const x = result.horizontal.value
    const y = result.experiment?.transformation.value
    return x != null && y != null ? [{ x, y }] : []
  })
  return new ImageResponse(SocialCard({ points }), socialImageOptions)
}
