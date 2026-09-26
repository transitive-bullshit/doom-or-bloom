import { createHash } from 'node:crypto'
import { reportServerError } from './error-reporting'

const bodyLimit = 8192
const headerNames = [
  'content-type',
  'content-length',
  'server',
  'date',
  'via',
  'retry-after',
  'x-typesafe-request-id',
  'x-request-id',
  'request-id',
  'x-correlation-id',
  'cf-ray',
  'cf-mitigated',
  'x-vercel-id',
  'x-amzn-requestid',
  'x-amz-cf-id',
  'x-amz-cf-pop',
  'x-cache'
]

export function upstreamHeaders(headers: Headers) {
  return Object.fromEntries(
    headerNames.flatMap((name) => {
      const value = headers.get(name)
      return value ? [[name, value.replace(/[\r\n]/g, '').slice(0, 240)]] : []
    })
  )
}

function requestValues(body: string) {
  const values: string[] = []
  const collect = (value: unknown, depth = 0) => {
    if (depth > 16 || values.length >= 2000) return
    if (typeof value === 'string' && value.length >= 4) {
      values.push(value)
      // Also remove echoed sentences, rather than requiring the full answer.
      values.push(
        ...value.split(/(?<=[.!?])\s+|\n/).filter((part) => part.length >= 12)
      )
    } else if (value && typeof value === 'object') {
      for (const child of Object.values(value)) collect(child, depth + 1)
    }
  }
  try {
    collect(JSON.parse(body))
  } catch {
    if (body.includes('=')) collect([...new URLSearchParams(body).values()])
    else collect(body)
  }
  return values.sort((a, b) => b.length - a.length)
}

// Log error details, never request payload fields, credentials, or cookies.
function redactUpstreamText(text: string, privateValues: string[] = []) {
  for (const value of privateValues) {
    if (value.length < 4) continue
    const representations = [value, JSON.stringify(value).slice(1, -1)]
    try {
      representations.push(encodeURIComponent(value))
    } catch {
      /* Lone surrogates can occur in input; logging must still work. */
    }
    for (const encoded of representations)
      text = text.replaceAll(encoded, '[redacted]')
  }
  return text
    .replace(/\b(Bearer|Basic)\s+[A-Za-z0-9._~+/-]+=*/gi, '$1 [redacted]')
    .replace(/\b(?:sk|ts|pk)[-_][A-Za-z0-9_-]{12,}\b/g, '[redacted]')
    .replace(
      /([?&](?:token|key|code|secret|signature|access_token|api_key)=)[^\s&"<>]+/gi,
      '$1[redacted]'
    )
    .replace(/\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/gi, '[redacted-email]')
    .replace(/\b(?:\d{1,3}\.){3}\d{1,3}\b/g, '[redacted-ip]')
}

function bodyPreview(text: string, privateValues: string[]) {
  try {
    const clean = (value: unknown, depth = 0): unknown => {
      if (depth > 5) return '[depth limit]'
      if (typeof value === 'string')
        return redactUpstreamText(value, privateValues).slice(0, 1000)
      if (Array.isArray(value))
        return value.slice(0, 8).map((entry) => clean(entry, depth + 1))
      if (value && typeof value === 'object')
        return Object.fromEntries(
          Object.entries(value)
            .filter(([key]) =>
              /^(error|errors|message|msg|detail|title|type|code|status|error_type|error_description|request_id|requestId)$/.test(
                key
              )
            )
            .slice(0, 32)
            .map(([key, entry]) => [
              // Unknown fields can contain complete echoed request payloads.
              key,
              clean(entry, depth + 1)
            ])
        )
      return value
    }
    return JSON.stringify(clean(JSON.parse(text))).slice(0, 4096)
  } catch {
    if (/^\s*(?:\{|\[)/.test(text))
      return '[omitted: incomplete JSON error body]'
    // HTML/text is essential to distinguish a firewall challenge from API JSON.
    return redactUpstreamText(text, privateValues).slice(0, 4096)
  }
}

async function sampleBody(response: Response) {
  const reader = response.clone().body?.getReader()
  if (!reader) return { text: '', truncated: false }
  const chunks: Uint8Array[] = []
  let size = 0
  let truncated = false
  let timer: ReturnType<typeof setTimeout> | undefined
  const timeout = new Promise<never>((_, reject) => {
    timer = setTimeout(() => reject(new Error('Diagnostic body deadline')), 300)
  })
  try {
    while (true) {
      const { value, done } = await Promise.race([reader.read(), timeout])
      if (done) break
      const part = value.subarray(0, bodyLimit - size)
      chunks.push(part)
      size += part.length
      if (size >= bodyLimit) {
        truncated = true
        break
      }
    }
  } catch {
    truncated = true
  } finally {
    clearTimeout(timer)
    // A tee cancellation can wait for the SDK's branch; do not await it here.
    void reader.cancel().catch(() => {})
  }
  return { text: Buffer.concat(chunks).toString('utf8'), truncated }
}

export async function upstreamFetch(
  input: Parameters<typeof fetch>[0],
  init: RequestInit | undefined,
  context: { provider: string; event?: string; [key: string]: unknown },
  fetcher: typeof fetch = globalThis.fetch
) {
  const started = performance.now()
  const url = new URL(input instanceof Request ? input.url : String(input))
  const method =
    init?.method ?? (input instanceof Request ? input.method : 'GET')
  const body =
    typeof init?.body === 'string'
      ? init.body
      : init?.body instanceof URLSearchParams
        ? init.body.toString()
        : undefined
  const headers = new Headers(
    init?.headers ?? (input instanceof Request ? input.headers : undefined)
  )
  const privateValues = [
    ...url.searchParams.values(),
    ...['authorization', 'cookie', 'x-api-key'].flatMap((key) => {
      const value = headers.get(key)
      return value ? [value, value.replace(/^(Bearer|Basic)\s+/i, '')] : []
    }),
    ...(body && body.length <= 256_000 ? requestValues(body) : [])
  ]
  const { event = 'upstream_request_failed', ...metadata } = context
  const request = {
    ...metadata,
    boundary: 'upstream_transport',
    method,
    upstreamOrigin: url.origin,
    // Never log query parameters, which may contain tokens or OAuth codes.
    upstreamPath: redactUpstreamText(url.pathname, privateValues),
    requestBytes: body === undefined ? undefined : Buffer.byteLength(body),
    requestSha256:
      body === undefined
        ? undefined
        : createHash('sha256').update(body).digest('hex')
  }
  let response: Response
  try {
    response = await fetcher(input, init)
  } catch (err) {
    reportServerError(event, err, {
      ...request,
      status: null,
      upstream: { source: 'transport', responseReceived: false, status: null },
      application: { effect: 'exception_rethrown' },
      elapsedMs: Math.round(performance.now() - started)
    })
    throw err
  }
  if (!response.ok) {
    // Diagnostic failure must never replace the original HTTP response.
    try {
      const sample = await sampleBody(response)
      const canRedact =
        body !== undefined
          ? body.length <= 256_000
          : !init?.body && !(input instanceof Request && input.body)
      reportServerError(event, undefined, {
        ...request,
        status: response.status,
        elapsedMs: Math.round(performance.now() - started),
        application: { effect: 'http_response_returned_to_caller' },
        upstream: {
          source: 'http_response',
          responseReceived: true,
          status: response.status,
          bodyRepresentation: 'sanitized_preview',
          headers: upstreamHeaders(response.headers),
          bodyPreview: canRedact
            ? bodyPreview(sample.text, privateValues)
            : '[omitted: request body unavailable for redaction]',
          bodyTruncated: sample.truncated || sample.text.length > 4096,
          sampledBodyBytes: Buffer.byteLength(sample.text)
        }
      })
    } catch {
      reportServerError(event, undefined, {
        ...request,
        status: response.status,
        upstream: {
          source: 'http_response',
          responseReceived: true,
          status: response.status
        },
        application: { effect: 'http_response_returned_to_caller' },
        diagnosticCaptureFailed: true
      })
    }
  }
  return response
}

// SDK-owned X OAuth and syndication calls have no per-request fetch hook.
// Install once at server startup; first-party traffic and other hosts pass through.
const installed = Symbol.for('doom-or-bloom.sdk-fetch-logging')
export function installSdkFetchLogging() {
  const current = globalThis.fetch as typeof fetch & { [installed]?: boolean }
  if (current[installed]) return
  const wrapped: typeof current = (input, init) => {
    let host: string
    try {
      host = new URL(input instanceof Request ? input.url : String(input))
        .hostname
    } catch {
      return current(input, init)
    }
    return [
      'api.x.com',
      'api.twitter.com',
      'cdn.syndication.twimg.com',
      'publish.twitter.com'
    ].includes(host)
      ? upstreamFetch(input, init, { provider: 'X' }, current)
      : current(input, init)
  }
  wrapped[installed] = true
  globalThis.fetch = wrapped
}
