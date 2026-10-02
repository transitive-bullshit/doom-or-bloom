import { shareLinkComparison } from '@/lib/sharing/compare-data'
import { findShareLink } from '@/lib/assessments/share-link-server'

// What a recipient's browser compares against: the sharer's map point,
// worldview values, P(doom) token and closest thought leaders. Never answers.
// Checked on every request, so a revoked link stops comparing immediately.
export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
const headers = { 'Cache-Control': 'no-store', 'X-Robots-Tag': 'noindex' }
export async function GET(
  _request: Request,
  context: RouteContext<'/api/share-links/[id]'>
) {
  const link = await findShareLink((await context.params).id)
  if (!link)
    return Response.json({ code: 'not_found' }, { status: 404, headers })
  return Response.json(shareLinkComparison(link), { headers })
}
