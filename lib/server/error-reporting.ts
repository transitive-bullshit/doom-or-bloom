import { createHash, randomUUID } from 'node:crypto'
import { APIError } from '@typesafe-ai/sdk'
import { ZodError } from 'zod'

export function isContextOverflow(error: unknown, depth = 0): boolean {
  if (!(error instanceof Error) || depth > 4) return false
  if (error instanceof APIError && error.status === 400)
    return /max_tokens_exceeded|exceeded token limit|context (?:length|window)|too many tokens/i.test(
      error.message
    )
  return error.cause ? isContextOverflow(error.cause, depth + 1) : false
}

// Never log exception messages or raw provider bodies: either can echo answers,
// credentials, URLs or validation inputs. Stack frames still identify call sites.
export function errorDetails(
  error: unknown,
  depth = 0
): Record<string, unknown> {
  if (!(error instanceof Error)) return { type: 'NonErrorThrown' }
  const known = [
    'Error',
    'TypeError',
    'RangeError',
    'SyntaxError',
    'AbortError',
    'TimeoutError'
  ]
  const systemCode =
    'code' in error &&
    typeof error.code === 'string' &&
    /^(?:E[A-Z0-9_]{2,40}|UND_ERR_[A-Z_]{1,40})$/.test(error.code)
      ? error.code
      : undefined
  const code = isContextOverflow(error)
    ? 'max_tokens_exceeded'
    : (systemCode ??
      (error instanceof ZodError
        ? 'validation_failed'
        : error.name === 'AbortError'
          ? 'request_aborted'
          : error.name === 'TimeoutError'
            ? 'request_timeout'
            : error instanceof APIError
              ? `provider_http_${error.status}`
              : 'unexpected_error'))
  const wrapper = [
    'AssessmentFailure',
    'EvaluationFailure',
    'JourneyFailure',
    'LimitError'
  ].includes(error.constructor.name)
    ? error.constructor.name
    : undefined
  const detail: Record<string, unknown> = {
    wrapper,
    type:
      error instanceof APIError
        ? 'TypeSafeAPIError'
        : error instanceof ZodError
          ? 'ZodError'
          : known.includes(error.name)
            ? error.name
            : 'ApplicationError',
    code,
    stack: error.stack
      ?.split('\n')
      .filter((line) => /^\s+at /.test(line))
      .slice(0, 12)
  }
  detail.fingerprint = createHash('sha256')
    .update(JSON.stringify([detail.type, detail.code, detail.stack]))
    .digest('hex')
    .slice(0, 16)
  if (error instanceof APIError) {
    detail.status = error.status
    if (error.requestId && /^[\w-]{1,120}$/.test(error.requestId))
      detail.providerRequestId = error.requestId
  }
  if (error instanceof ZodError)
    detail.validationCodes = error.issues
      .slice(0, 12)
      .map((issue) => issue.code)
  if (error.cause && depth < 3)
    detail.cause = errorDetails(error.cause, depth + 1)
  return detail
}

export function reportServerError(
  event: string,
  error: unknown,
  context: Record<string, unknown>,
  level: 'error' | 'warn' = 'error'
) {
  console[level](
    JSON.stringify({
      event,
      timestamp: new Date().toISOString(),
      severity: level,
      environment:
        process.env.VERCEL_ENV ?? process.env.NODE_ENV ?? 'development',
      deployment: process.env.VERCEL_DEPLOYMENT_ID,
      commit: process.env.VERCEL_GIT_COMMIT_SHA,
      region: process.env.VERCEL_REGION,
      ...context,
      error: errorDetails(error)
    })
  )
}

export function apiDiagnostics(request: Request, route: string) {
  const requestId = randomUUID()
  const started = performance.now()
  let phase = 'request'
  const metadata: Record<string, unknown> = {}
  return {
    requestId,
    setPhase(value: string, context: Record<string, unknown> = {}) {
      phase = value
      Object.assign(metadata, context)
    },
    headers: { 'X-Request-ID': requestId },
    report(
      error: unknown,
      status: number,
      context: Record<string, unknown> = {}
    ) {
      reportServerError(
        'api_request_failed',
        error,
        {
          ...metadata,
          phase,
          route,
          aborted: request.signal.aborted,
          method: request.method,
          requestId,
          status,
          elapsedMs: Math.round(performance.now() - started),
          ...context
        },
        status >= 500 ? 'error' : 'warn'
      )
    }
  }
}
