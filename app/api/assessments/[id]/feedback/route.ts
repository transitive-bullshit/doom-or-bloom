import { z } from 'zod'
import { privateHeaders, privateRequest } from '@/lib/assessments/http'
import { feedbackRequestSchema } from '@/lib/assessments/feedback'
import { feedbackRepository } from '@/lib/assessments/feedback-repository'
import { getPool } from '@/lib/db'
import { limitAssessment, readBoundedJson } from '@/lib/server/limits'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
export async function GET(
  request: Request,
  context: RouteContext<'/api/assessments/[id]/feedback'>
) {
  return privateRequest(request, async (owner) => {
    const id = z.uuid().parse((await context.params).id)
    return Response.json(
      { feedback: await feedbackRepository(getPool()).list(owner, id) },
      { headers: privateHeaders }
    )
  })
}
export async function POST(
  request: Request,
  context: RouteContext<'/api/assessments/[id]/feedback'>
) {
  return privateRequest(request, async (owner) => {
    const id = z.uuid().parse((await context.params).id)
    const input = feedbackRequestSchema.parse(
      await readBoundedJson(request, 16_000)
    )
    limitAssessment(`feedback:${owner}`)
    return Response.json(
      {
        feedback: await feedbackRepository(getPool()).record(owner, id, input)
      },
      { headers: privateHeaders }
    )
  })
}
