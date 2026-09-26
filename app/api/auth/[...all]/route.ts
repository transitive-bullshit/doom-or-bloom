import { randomUUID } from 'node:crypto'
import { withDiagnosticContext } from '@/lib/server/diagnostic-context'
import { reportServerError } from '@/lib/server/error-reporting'
import { hasTrustedOrigin } from '@/lib/auth/origin'
import { getAuth } from '@/lib/auth/server'

export const dynamic = 'force-dynamic'
export async function GET(request: Request) {
  return handle(request)
}
export async function POST(request: Request) {
  if (!hasTrustedOrigin(request)) return new Response(null, { status: 403 })
  return handle(request)
}

function handle(request: Request) {
  return withDiagnosticContext(
    {
      requestId: randomUUID(),
      route: '/api/auth/[...all]',
      method: request.method
    },
    async () => {
      try {
        const response = await getAuth().handler(request)
        if (response.status >= 400)
          reportServerError(
            'auth_request_failed',
            undefined,
            {
              boundary: 'auth',
              application: {
                effect: 'auth_response_returned',
                responseStatus: response.status
              }
            },
            response.status >= 500 ? 'error' : 'warn'
          )
        return response
      } catch (err) {
        reportServerError('auth_request_failed', err, {
          boundary: 'auth',
          application: { effect: 'exception_rethrown' }
        })
        throw err
      }
    }
  )
}
