import { findPublished } from '@/lib/assessments/public-server'
import { repository } from '@/lib/assessments/server'
import { publicShareCard } from '@/lib/sharing/public-card'
import { renderShareCard } from '@/lib/sharing/render-card'

export const runtime = 'nodejs'
// Generated and revoked with the page: at build, on first request for new
// shares, and when publication changes expire both paths.
export const dynamic = 'force-static'
export const dynamicParams = true
export const revalidate = 172800

export function generateStaticParams() {
  return repository().publishedParticipantPaths()
}
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const saved = await findPublished((await params).id)
  // Return rather than throw notFound(): Next caches a thrown not-found route
  // response forever and without path tags, so publication could not replace it.
  if (!saved) return new Response(null, { status: 404 })
  const card = await publicShareCard(saved)
  const bytes = await renderShareCard(card.data, {
    devicePixelRatio: 1,
    title: card.title,
    simulated: card.simulated
  })
  return new Response(new Uint8Array(bytes), {
    headers: { 'Content-Type': 'image/png' }
  })
}
