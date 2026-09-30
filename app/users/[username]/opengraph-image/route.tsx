import { publicImageCacheHeaders } from '@/lib/sharing/image-cache'
import { loadSocialPortrait } from '@/lib/sharing/portraits'
import { ImageResponse } from 'takumi-js/response'
import { loadPersona } from '@/components/landing/data'
import { SocialCard, socialImageOptions } from '@/lib/sharing/social-card'

// A plain route handler rather than the opengraph-image file convention: it
// stays outside app/[locale] at its published, language-neutral URL, which
// profile metadata in every locale advertises (see pageMetadata callers).
export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ username: string }> }
) {
  const profile = await loadPersona((await params).username)
  if (!profile) return new Response(null, { status: 404 })
  const { person } = profile
  return new ImageResponse(
    SocialCard({
      person: { ...person, portrait: await loadSocialPortrait(person.avatar) }
    }),
    { ...socialImageOptions, headers: publicImageCacheHeaders }
  )
}
