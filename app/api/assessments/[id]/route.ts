import { cookies } from 'next/headers'
import {
  loadAssessmentOrDraft,
  draftCookie,
  draftApiCookie,
  draftCookieOptions
} from '@/lib/assessments/drafts'
import { z } from 'zod'
import { privateHeaders, privateRequest } from '@/lib/assessments/http'
import { submitSchema } from '@/lib/assessments/contracts'
import { repository, evaluateAssessment } from '@/lib/assessments/server'
import { readBoundedJson } from '@/lib/server/limits'
import { refreshPublicAssessment } from '@/lib/assessments/public-cache'

export const dynamic = 'force-dynamic'
export const maxDuration = 150
export async function GET(
  request: Request,
  context: RouteContext<'/api/assessments/[id]'>
) {
  return privateRequest(request, async (owner) => {
    const id = z.uuid().parse((await context.params).id)
    return Response.json(
      await loadAssessmentOrDraft(
        owner,
        id,
        (await cookies()).get(draftApiCookie)?.value
      ),
      {
        headers: privateHeaders
      }
    )
  })
}
export async function POST(
  request: Request,
  context: RouteContext<'/api/assessments/[id]'>
) {
  return privateRequest(request, async (owner) => {
    const id = z.uuid().parse((await context.params).id)
    const input = submitSchema.parse(await readBoundedJson(request, 32_000))
    if (input.assessmentId !== id)
      return Response.json(
        { code: 'invalid_input', error: 'Refresh the page and try again.' },
        { status: 400, headers: privateHeaders }
      )
    const initial = await loadAssessmentOrDraft(
      owner,
      id,
      (await cookies()).get(draftApiCookie)?.value
    )
    const result = await repository().submit(
      owner,
      input,
      evaluateAssessment,
      request.signal,
      initial.unsaved ? initial.assessment : undefined
    )
    if (initial.unsaved) {
      const cookieStore = await cookies()
      cookieStore.set(draftCookie, '', { ...draftCookieOptions(id), maxAge: 0 })
      cookieStore.set(draftApiCookie, '', {
        ...draftCookieOptions(id),
        path: `/api/assessments/${id}`,
        maxAge: 0
      })
    }
    return Response.json(result, {
      status:
        result.operation.status === 'running'
          ? 202
          : result.operation.status === 'succeeded'
            ? 200
            : 503,
      headers: privateHeaders
    })
  })
}
export async function PATCH(
  request: Request,
  context: RouteContext<'/api/assessments/[id]'>
) {
  return privateRequest(request, async (owner) => {
    const id = z.uuid().parse((await context.params).id)
    const input = z
      .strictObject({
        expectedRevision: z.number().int().nonnegative(),
        visibility: z.enum(['private', 'public'])
      })
      .parse(await readBoundedJson(request, 2048))
    await repository().setVisibility(
      owner,
      id,
      input.expectedRevision,
      input.visibility
    )
    refreshPublicAssessment(id, input.visibility === 'public')
    return Response.json(await repository().load(owner, id), {
      headers: privateHeaders
    })
  })
}
export async function DELETE(
  request: Request,
  context: RouteContext<'/api/assessments/[id]'>
) {
  return privateRequest(request, async (owner) => {
    const id = z.uuid().parse((await context.params).id)
    await repository().remove(owner, id)
    refreshPublicAssessment(id, false)
    return new Response(null, { status: 204, headers: privateHeaders })
  })
}
