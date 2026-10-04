import { z } from 'zod'
import { privateRequest, privateHeaders } from '@/lib/assessments/http'
import { repository } from '@/lib/assessments/server'
import { readBoundedJson } from '@/lib/server/limits'
import { requestCountry } from '@/lib/server/request-country'
export async function POST(
  request: Request,
  context: RouteContext<'/api/assessments/[id]/fork'>
) {
  return privateRequest(request, async (owner) => {
    const id = z.uuid().parse((await context.params).id)
    const input = z
      .strictObject({ requestKey: z.string().min(1).max(120) })
      .parse(await readBoundedJson(request, 2048))
    return Response.json(
      await repository().fork(
        owner,
        id,
        input.requestKey,
        requestCountry(request)
      ),
      { headers: privateHeaders }
    )
  })
}
