import { translatorFor } from '@/i18n/translators'
import { defaultLocale, isLocale } from '@/i18n/config'
import { publicImageCacheHeaders } from '@/lib/sharing/image-cache'
import { loadSocialPortrait } from '@/lib/sharing/portraits'
import { ImageResponse } from 'takumi-js/response'
import { loadPersona } from '@/components/landing/data'
import { SocialCard, socialImageOptions } from '@/lib/sharing/social-card'
import { cardRenderOptions, cardTranslator } from '@/lib/sharing/card-renderer'

// A plain route handler rather than the opengraph-image file convention: it
// stays outside app/[locale] at its published URL. Profile metadata in other
// languages adds `locale` to that URL for a card in their language.
export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ username: string }> }
) {
  const profile = await loadPersona((await params).username)
  if (!profile) return new Response(null, { status: 404 })
  const { person } = profile
  const param = new URL(request.url).searchParams.get('locale')
  const locale = isLocale(param) ? param : defaultLocale
  return new ImageResponse(
    SocialCard({
      t: cardTranslator(await translatorFor(locale), locale),
      person: { ...person, portrait: await loadSocialPortrait(person.avatar) }
    }),
    {
      ...socialImageOptions,
      ...(await cardRenderOptions(locale)),
      headers: publicImageCacheHeaders
    }
  )
}
