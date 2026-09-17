import { APIError } from '@typesafe-ai/sdk'
import { ZodError } from 'zod'
import { requestSchema, assessmentSchema } from '@/lib/assessment/schema'
import { loadBundle } from '@/lib/content/loader'
import { runAssessment } from '@/lib/server/engine'
import { serverEnv } from '@/lib/server/env'
import { createLiveProvider } from '@/lib/server/live-provider'
import { createFixtureProvider } from '@/lib/server/provider'
import { isSameOriginRequest } from '@/lib/server/request-origin'
import {
  limitAssessment,
  LimitError,
  readBoundedJson,
  runLimited
} from '@/lib/server/limits'
export const runtime = 'nodejs'
export async function POST(request: Request) {
  const headers = { 'Cache-Control': 'no-store' }
  try {
    if (!isSameOriginRequest(request))
      return Response.json(
        { error: 'Use the local assessment page to submit answers.' },
        { status: 403, headers }
      )
    const input = requestSchema.parse(await readBoundedJson(request))
    const env = serverEnv()
    const provider =
      env.provider === 'fixture'
        ? createFixtureProvider()
        : createLiveProvider(env.model)
    const result = await runLimited(
      `${input.assessment.id}:${input.requestId}`,
      input,
      async () => {
        limitAssessment(input.assessment.id)
        const response = await runAssessment(
          input,
          provider,
          loadBundle(),
          env.debug,
          request.signal
        )
        assessmentSchema.parse(response.assessment)
        return response
      }
    )
    return Response.json(result, { headers })
  } catch (err) {
    let status = 400
    let message =
      'That operation could not be completed. Your answer is still saved; try again.'
    if (err instanceof LimitError) {
      status = err.status
      message = err.message
    } else if (err instanceof ZodError)
      message =
        'This answer or saved assessment has an invalid format or exceeds the local limits. Export or restart if needed.'
    else if (err instanceof APIError) {
      status = 503
      message =
        err.status === 401
          ? 'The TypeSafe key was not accepted. Check .env.local.'
          : 'The evaluator is temporarily unavailable. Your answer is saved; please retry.'
    } else if (err instanceof Error && !err.name.includes('API'))
      message = err.message
    return Response.json({ error: message }, { status, headers })
  }
}
