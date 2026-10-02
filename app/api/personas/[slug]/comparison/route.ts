import { z } from 'zod'
import { loadPersona } from '@/components/landing/data'
import { personaComparison } from '@/lib/sharing/compare-data'

// A selected simulated user's public map point and values, for a participant
// who started from their page. Unfeatured users are included.
export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
export async function GET(
  _request: Request,
  context: RouteContext<'/api/personas/[slug]/comparison'>
) {
  const slug = z
    .string()
    .regex(/^[a-z0-9_-]{1,80}$/)
    .safeParse((await context.params).slug)
  const profile = slug.success ? await loadPersona(slug.data) : null
  if (!profile)
    return Response.json(
      { code: 'not_found' },
      { status: 404, headers: { 'Cache-Control': 'no-store' } }
    )
  return Response.json(personaComparison(profile.person), {
    headers: {
      // Public profile data, refreshed like the profile page.
      'Cache-Control':
        'public, max-age=300, s-maxage=86400, stale-while-revalidate=86400',
      'X-Robots-Tag': 'noindex'
    }
  })
}
