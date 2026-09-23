import { loadSocialPortrait } from '@/lib/sharing/portraits'
import { ImageResponse } from 'takumi-js/response'
import { notFound } from 'next/navigation'
import { loadExamples } from '@/components/landing/data'
import { SocialCard, socialImageOptions } from '@/lib/sharing/social-card'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
export const alt =
  'Simulated AI worldview: Doom–Bloom and scale of transformation, with interpretation range'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/webp'

export default async function Image({
  params
}: {
  params: Promise<{ username: string }>
}) {
  const { username } = await params
  const person = (await loadExamples(false)).find(
    (person) => person.slug === username
  )
  if (!person) notFound()
  return new ImageResponse(
    SocialCard({
      person: { ...person, portrait: await loadSocialPortrait(person.avatar) }
    }),
    socialImageOptions
  )
}
