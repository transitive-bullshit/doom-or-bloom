import { loadPersonaComparisons } from '@/components/landing/data'
import { loadPublished } from '@/lib/assessments/public-server'
import { resultCardData } from '@/lib/sharing/card-data'
import { renderShareCard } from '@/lib/sharing/render-card'
export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const saved = await loadPublished((await params).id)
  const result =
    saved.kind === 'simulation'
      ? saved.simulation.journey.result!
      : saved.assessment.result!
  const data = resultCardData(result, await loadPersonaComparisons())
  const bytes = await renderShareCard(data, {
    format: 'webp',
    title:
      saved.kind === 'simulation'
        ? `${saved.profile.name}’s AI worldview`.slice(0, 64)
        : undefined,
    simulated: saved.kind === 'simulation'
  })
  return new Response(new Uint8Array(bytes), {
    headers: {
      'Content-Type': 'image/webp',
      'Cache-Control': 'private, no-store',
      'X-Robots-Tag': 'noindex'
    }
  })
}
