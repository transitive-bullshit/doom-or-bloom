import { randomUUID } from 'node:crypto'
import { withDiagnosticContext } from '../server/diagnostic-context'
import 'server-only'
import { ZodError } from 'zod'
import { getAuth } from '../auth/server'
import { hasTrustedOrigin } from '../auth/origin'
import { LimitError } from '../server/limits'
import { reportServerError } from '../server/error-reporting'
import english from '@/messages/en.json'
import { assessmentErrorCode, type AssessmentErrorCode } from './error-messages'
import { AssessmentError } from './contracts'

// API bodies stay English; the browser shows its own localized copy by code.
// A plain lookup keeps next-intl out of scripts that import this module.
const errors = (code: AssessmentErrorCode) => english.Errors[code]

export const privateHeaders = { 'Cache-Control': 'private, no-store' }
export async function privateRequest(
  request: Request,
  action: (ownerId: string) => Promise<Response>
) {
  return withDiagnosticContext(
    {
      requestId: randomUUID(),
      route: '/api/assessments',
      method: request.method
    },
    async () => {
      let phase = 'session'
      try {
        if (request.method !== 'GET' && !hasTrustedOrigin(request))
          throw new AssessmentError(
            'origin',
            403,
            'Use the assessment page to make changes.'
          )
        const session = await getAuth().api.getSession({
          headers: request.headers
        })
        if (!session)
          throw new AssessmentError(
            'unauthorized',
            401,
            'Your browser session is missing or expired. Start a new assessment or sign in.'
          )
        phase = 'assessment_operation'
        return await action(session.user.id)
      } catch (err) {
        if (err instanceof AssessmentError)
          return Response.json(
            {
              code: err.code,
              error: errors(assessmentErrorCode(err.status, err.code))
            },
            { status: err.status, headers: privateHeaders }
          )
        if (err instanceof ZodError || err instanceof SyntaxError)
          return Response.json(
            {
              code: 'invalid_input',
              error: errors('invalid_input')
            },
            { status: 400, headers: privateHeaders }
          )
        if (err instanceof LimitError)
          return Response.json(
            { code: 'limited', error: errors('limited') },
            { status: 429, headers: privateHeaders }
          )
        reportServerError('assessment_request_failed', err, {
          boundary: 'api',
          phase,
          application: { effect: 'request_failed', responseStatus: 503 }
        })
        return Response.json(
          {
            code: 'unavailable',
            error: errors('generic')
          },
          { status: 503, headers: privateHeaders }
        )
      }
    }
  )
}
