import { translatorFor } from '@/i18n/translators'
import { isLocale } from '@/i18n/config'
import { findShareLink } from '@/lib/assessments/share-link-server'
import { renderShareCard } from '@/lib/sharing/render-card'
import { shareLinkCard } from '@/lib/sharing/share-link-card'

export const runtime = 'nodejs'
// A share link's card in every language (English renders at /en through the
// locale rewrite). Rendered on its first request, cached like the page, and
// expired with it when the link is revoked or its assessment deleted.
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
  const link = isLocale(locale) ? await findShareLink(id) : null
  // Return rather than throw notFound(): Next caches a thrown not-found route
  // response forever and without path tags, so it could not be expired.
  if (!link || !isLocale(locale)) return new Response(null, { status: 404 })
  const t = await translatorFor(locale)
  const bytes = await renderShareCard(t, await shareLinkCard(link), {
    devicePixelRatio: 1,
    locale
  })
  return new Response(new Uint8Array(bytes), {
    headers: { 'Content-Type': 'image/png' }
  })
}
