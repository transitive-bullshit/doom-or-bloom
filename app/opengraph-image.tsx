import { loadSocialPortrait } from '@/lib/sharing/portraits'
import { ImageResponse } from 'takumi-js/response'
import { loadExamples } from '@/components/landing/data'
import { SocialCard, socialImageOptions } from '@/lib/sharing/social-card'

export const runtime = 'nodejs'
export const alt =
  'Doom or Bloom: explore the AI worldview map, then discover where you land'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/webp'

export default async function Image() {
  const examples = await Promise.all(
    (await loadExamples()).map(async (person) => ({
      ...person,
      portrait: await loadSocialPortrait(person.avatar)
    }))
  )
  const points = examples.flatMap(({ result, portrait }) => {
    const x = result.horizontal.value
    const y = result.experiment?.transformation.value
    return x != null && y != null ? [{ x, y, portrait }] : []
  })
  return new ImageResponse(SocialCard({ points }), socialImageOptions)
}
