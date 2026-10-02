import { z } from 'zod'
import { defaultLocale, isLocale } from '@/i18n/config'
import { privateHeaders, privateRequest } from '@/lib/assessments/http'
import {
  refreshShareLinks,
  warmShareLink
} from '@/lib/assessments/public-cache'
import { shareLinkRepository } from '@/lib/assessments/share-links'
import { loadPersonaComparisons } from '@/components/landing/data'
import { getPool } from '@/lib/db'
import { shareLinkRequestSchema } from '@/lib/sharing/share-links'
import { limitAssessment, readBoundedJson } from '@/lib/server/limits'

// The owner's card-only share link for the current result. Non-owners get the
// same not-found response as other private routes.
export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
export async function GET(
  request: Request,
  context: RouteContext<'/api/assessments/[id]/share-link'>
) {
  return privateRequest(request, async (owner) => {
    const id = z.uuid().parse((await context.params).id)
    return Response.json(
      await shareLinkRepository(getPool()).current(owner, id),
      { headers: privateHeaders }
    )
  })
}
export async function POST(
  request: Request,
  context: RouteContext<'/api/assessments/[id]/share-link'>
) {
  return privateRequest(request, async (owner) => {
    const id = z.uuid().parse((await context.params).id)
    const input = shareLinkRequestSchema.parse(
      await readBoundedJson(request, 2048)
    )
    limitAssessment(`share-link:${owner}`)
    const saved = await shareLinkRepository(getPool()).create(
      owner,
      id,
      input.name,
      await loadPersonaComparisons()
    )
    if (saved.created)
      warmShareLink(
        saved.link.id,
        input.locale && isLocale(input.locale) ? input.locale : defaultLocale
      )
    return Response.json(saved, {
      status: saved.created ? 201 : 200,
      headers: privateHeaders
    })
  })
}
/** Stops sharing: revokes every active link of this assessment. */
export async function DELETE(
  request: Request,
  context: RouteContext<'/api/assessments/[id]/share-link'>
) {
  return privateRequest(request, async (owner) => {
    const id = z.uuid().parse((await context.params).id)
    const revoked = await shareLinkRepository(getPool()).revoke(owner, id)
    refreshShareLinks(revoked)
    return Response.json(
      { revoked: revoked.length },
      { headers: privateHeaders }
    )
  })
}
