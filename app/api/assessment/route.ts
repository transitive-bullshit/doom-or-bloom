import { apiDiagnostics } from '@/lib/server/error-reporting'
import { AssessmentFailure } from '@/lib/server/assessment-failure'
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
  const diagnostics = apiDiagnostics(request, '/api/assessment')
  const headers = { 'Cache-Control': 'no-store', ...diagnostics.headers }
  let inputValidated = false
  try {
    if (!isSameOriginRequest(request))
      return Response.json(
        { error: 'Use the local assessment page to submit answers.' },
        { status: 403, headers }
      )
    diagnostics.setPhase('parse_input')
    const input = requestSchema.parse(await readBoundedJson(request))
    inputValidated = true
    diagnostics.setPhase('configure_evaluator', {
      operation: input.operation.type,
      answerCount: input.assessment.answers.length,
      submittedAnswerBytes:
        input.operation.type === 'answer'
          ? Buffer.byteLength(input.operation.text)
          : 0,
      promptCount: input.assessment.prompts.length,
      evidenceCount: input.assessment.evidence.length,
      answerBytes: Buffer.byteLength(JSON.stringify(input.assessment.answers)),
      contentVersion: input.assessment.versions.content,
      model: input.assessment.versions.model
    })
    const env = serverEnv()
    if (env.provider === 'live' && !process.env.TYPESAFE_API_KEY?.trim()) {
      diagnostics.report(new Error('Missing configuration'), 503, {
        code: 'evaluator_not_configured'
      })
      return Response.json(
        {
          error:
            'The evaluator is not configured. Your answer is saved; please try again later.',
          code: 'evaluator_not_configured'
        },
        { status: 503, headers }
      )
    }
    const provider =
      env.provider === 'fixture'
        ? createFixtureProvider()
        : createLiveProvider(env.model)
    diagnostics.setPhase('schedule_evaluation')
    const result = await runLimited(
      `${input.assessment.id}:${input.requestId}`,
      input,
      async () => {
        limitAssessment(input.assessment.id)
        diagnostics.setPhase('evaluate')
        const response = await runAssessment(
          input,
          provider,
          loadBundle(input.assessment.versions.content),
          true,
          request.signal,
          diagnostics.requestId
        )
        diagnostics.setPhase('validate_output')
        assessmentSchema.parse(response.assessment)
        return response
      }
    )
    diagnostics.setPhase('serialize_response')
    return Response.json(result, { headers })
  } catch (err) {
    if (err instanceof AssessmentFailure) {
      diagnostics.report(err, 503)
      return Response.json(
        { error: err.message, debug: err.trace },
        { status: 503, headers }
      )
    }
    let status = 500
    let message =
      'That operation could not be completed. Your answer is still saved; try again.'
    if (err instanceof LimitError) {
      status = err.status
      message = err.message
    } else if (
      !inputValidated &&
      (err instanceof ZodError || err instanceof SyntaxError)
    ) {
      status = 400
      message =
        'This answer or saved assessment has an invalid format or exceeds the local limits. Export or restart if needed.'
    } else if (err instanceof APIError) {
      status = 503
      message =
        err.status === 401
          ? 'The TypeSafe key was not accepted. Check .env.local.'
          : 'The evaluator is temporarily unavailable. Your answer is saved; please retry.'
    }
    diagnostics.report(err, status)
    return Response.json({ error: message }, { status, headers })
  }
}
