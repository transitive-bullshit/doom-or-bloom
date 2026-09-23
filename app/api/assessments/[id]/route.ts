import { z } from 'zod'
import { privateHeaders, privateRequest } from '@/lib/assessments/http'
import { submitSchema } from '@/lib/assessments/contracts'
import { repository, evaluateAssessment } from '@/lib/assessments/server'
import { readBoundedJson } from '@/lib/server/limits'

export const dynamic = 'force-dynamic'
export const maxDuration = 150
export async function GET(
  request: Request,
  context: RouteContext<'/api/assessments/[id]'>
) {
  return privateRequest(request, async (owner) => {
    const id = z.uuid().parse((await context.params).id)
    return Response.json(await repository().load(owner, id), {
      headers: privateHeaders
    })
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
    const result = await repository().submit(
      owner,
      input,
      evaluateAssessment,
      request.signal
    )
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
    await repository().remove(owner, z.uuid().parse((await context.params).id))
    return new Response(null, { status: 204, headers: privateHeaders })
  })
}
