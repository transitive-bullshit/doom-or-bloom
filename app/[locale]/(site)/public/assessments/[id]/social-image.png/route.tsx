import { translatorFor } from '@/i18n/translators'
import { defaultLocale, isLocale } from '@/i18n/config'
import { findPublished } from '@/lib/assessments/public-server'
import { publicShareCard } from '@/lib/sharing/public-card'
import { renderShareCard } from '@/lib/sharing/render-card'

export const runtime = 'nodejs'
// A published card in another language, cached and revoked like its page
// (see app/public/assessments/[id]/social-image.png for English). Rendered on
// first request rather than at build, like the page in that language.
export const dynamic = 'force-static'
export const dynamicParams = true
export const revalidate = 172800

export function generateStaticParams() {
  return []
}
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ locale: string; id: string }> }
) {
  const { locale, id } = await params
  // English has the unprefixed URL; /en/… redirects there before routing.
  if (!isLocale(locale) || locale === defaultLocale)
    return new Response(null, { status: 404 })
  const saved = await findPublished(id)
  // As in the English route, return rather than throw notFound() so a later
  // publication can replace the cached response.
  if (!saved) return new Response(null, { status: 404 })
  const t = await translatorFor(locale)
  const card = await publicShareCard(saved, t)
  const bytes = await renderShareCard(t, card.data, {
    devicePixelRatio: 1,
    locale,
    title: card.title,
    simulated: card.simulated
  })
  return new Response(new Uint8Array(bytes), {
    headers: { 'Content-Type': 'image/png' }
  })
}
