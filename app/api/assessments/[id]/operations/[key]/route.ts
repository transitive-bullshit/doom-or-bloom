import { z } from 'zod'
import { privateHeaders, privateRequest } from '@/lib/assessments/http'
import { repository } from '@/lib/assessments/server'

export const dynamic = 'force-dynamic'
export async function GET(
  request: Request,
  context: RouteContext<'/api/assessments/[id]/operations/[key]'>
) {
  return privateRequest(request, async (owner) => {
    const params = z
      .object({ id: z.uuid(), key: z.string().min(1).max(120) })
      .parse(await context.params)
    return Response.json(
      await repository().getOperation(owner, params.id, params.key),
      { headers: privateHeaders }
    )
  })
}
