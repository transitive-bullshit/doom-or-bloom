import { z } from 'zod'
import { privateHeaders, privateRequest } from '@/lib/assessments/http'
import { repository } from '@/lib/assessments/server'
import { readBoundedJson } from '@/lib/server/limits'
import { serverEnv } from '@/lib/server/env'

export const dynamic = 'force-dynamic'
export async function GET(request: Request) {
  return privateRequest(request, async (owner) =>
    Response.json(await repository().list(owner), { headers: privateHeaders })
  )
}
export async function POST(request: Request) {
  return privateRequest(request, async (owner) => {
    const input = z
      .strictObject({
        requestKey: z.string().min(1).max(120),
        onlyIfEmpty: z.boolean().default(false)
      })
      .parse(await readBoundedJson(request, 2048))
    return Response.json(
      await repository().create(
        owner,
        input.requestKey,
        serverEnv().model,
        input.onlyIfEmpty
      ),
      { headers: privateHeaders }
    )
  })
}
