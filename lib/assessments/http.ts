import 'server-only'
import { ZodError } from 'zod'
import { getAuth } from '../auth/server'
import { hasTrustedOrigin } from '../auth/origin'
import { LimitError } from '../server/limits'
import { reportServerError } from '../server/error-reporting'
import { assessmentErrorMessage } from './error-messages'
import { AssessmentError } from './contracts'

export const privateHeaders = { 'Cache-Control': 'private, no-store' }
export async function privateRequest(
  request: Request,
  action: (ownerId: string) => Promise<Response>
) {
  try {
    if (request.method !== 'GET' && !hasTrustedOrigin(request))
      throw new AssessmentError(
        'origin',
        403,
        'Use the assessment page to make changes.'
      )
    const session = await getAuth().api.getSession({ headers: request.headers })
    if (!session)
      throw new AssessmentError(
        'unauthorized',
        401,
        'Your browser session is missing or expired. Start a new assessment or sign in.'
      )
    return await action(session.user.id)
  } catch (err) {
    if (err instanceof AssessmentError)
      return Response.json(
        { code: err.code, error: assessmentErrorMessage(err.status, err.code) },
        { status: err.status, headers: privateHeaders }
      )
    if (err instanceof ZodError || err instanceof SyntaxError)
      return Response.json(
        {
          code: 'invalid_input',
          error: assessmentErrorMessage(400, 'invalid_input')
        },
        { status: 400, headers: privateHeaders }
      )
    if (err instanceof LimitError)
      return Response.json(
        { code: 'limited', error: assessmentErrorMessage(429, 'limited') },
        { status: 429, headers: privateHeaders }
      )
    reportServerError('assessment_request_failed', err, {})
    return Response.json(
      {
        code: 'unavailable',
        error: 'Something went wrong. Please try again.'
      },
      { status: 503, headers: privateHeaders }
    )
  }
}
