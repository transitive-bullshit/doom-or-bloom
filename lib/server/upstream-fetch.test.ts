import { afterEach, expect, test, vi } from 'vitest'
import { APIError } from '@typesafe-ai/sdk'
import { expectDiagnostics } from '@/tests/helpers/diagnostics'
import { installSdkFetchLogging, upstreamFetch } from './upstream-fetch'
import { createLiveProvider } from './live-provider'

afterEach(() => {
  vi.unstubAllGlobals()
  vi.unstubAllEnvs()
})

test('403 body and correlation headers survive for diagnostics without consuming the SDK response', async () => {
  const logs = expectDiagnostics({
    event: 'upstream_request_failed',
    severity: 'error',
    status: 403
  })
  const answer = 'This is a private participant answer.'
  const raw = {
    error: {
      code: 'access_denied',
      message: `Blocked: ${answer}. Bearer private-credential`,
      token: 'response-secret',
      input: { answer }
    }
  }
  const response = Response.json(raw, {
    status: 403,
    headers: {
      'x-typesafe-request-id': 'req_test_403',
      'cf-ray': 'ray-IAD',
      'set-cookie': 'session=secret'
    }
  })
  const fetcher = vi.fn<typeof fetch>().mockResolvedValue(response)
  const received = await upstreamFetch(
    'https://api.typesafe.ai/v1/systemone',
    {
      method: 'POST',
      headers: { Authorization: 'Bearer private-credential' },
      body: JSON.stringify({ state: { answer } })
    },
    { provider: 'TypeSafe', requestId: 'app-request', attempt: 1 },
    fetcher
  )
  expect(received).toBe(response)
  expect(await received.json()).toEqual(raw)
  const log = JSON.parse(logs[0]!)
  expect(log).toMatchObject({
    emitter: 'doom-or-bloom',
    eventSource: 'application',
    boundary: 'upstream_transport',
    application: { effect: 'http_response_returned_to_caller' },
    requestId: 'app-request',
    method: 'POST',
    upstreamPath: '/v1/systemone',
    upstream: {
      source: 'http_response',
      status: 403,
      bodyRepresentation: 'sanitized_preview',
      headers: { 'x-typesafe-request-id': 'req_test_403', 'cf-ray': 'ray-IAD' }
    }
  })
  expect(log.error).toBeUndefined()
  expect(log.upstream.bodyPreview).toContain('access_denied')
  expect(logs[0]).not.toMatch(
    /private participant|private-credential|response-secret|session=secret/
  )
  expect(log.requestSha256).toMatch(/^[a-f0-9]{64}$/)
})

test('actual overflow response retains error_type and SDK request ID', async () => {
  const logs = expectDiagnostics(
    { event: 'jev_call_failed', severity: 'error', status: 400 },
    {
      event: 'jev_batch_failed',
      severity: 'error',
      error: { code: 'max_tokens_exceeded' }
    }
  )
  vi.stubEnv('TYPESAFE_API_KEY', 'synthetic-key')
  const body = { detail: { error_type: 'max_tokens_exceeded' } }
  const fetcher = vi.fn<typeof fetch>().mockResolvedValue(
    Response.json(body, {
      status: 400,
      headers: { 'x-typesafe-request-id': 'req_overflow' }
    })
  )
  vi.stubGlobal('fetch', fetcher)
  let cause: unknown
  try {
    await createLiveProvider('jev-1.13.0').evaluate(
      'hello',
      { q: { type: 'noul', instructions: 'A greeting?' } },
      undefined,
      1,
      true
    )
  } catch (err) {
    cause = (err as Error).cause
  }
  expect(cause).toBeInstanceOf(APIError)
  expect(cause).toMatchObject({ body, requestId: 'req_overflow', status: 400 })
  expect(JSON.parse(logs[0]!).upstream.bodyPreview).toBe(JSON.stringify(body))
  expect(JSON.parse(logs[1]!)).toMatchObject({
    eventSource: 'application',
    boundary: 'provider_adapter',
    application: { effect: 'evaluation_batch_aborted' },
    error: {
      code: 'max_tokens_exceeded',
      codeSource: 'application',
      sdk: { name: '@typesafe-ai/sdk', errorType: 'BadRequestError' },
      providerRequestId: 'req_overflow'
    }
  })
  expect(fetcher).toHaveBeenCalledTimes(1)
})

test('firewall HTML retains a bounded excerpt and ray ID with query secrets redacted', async () => {
  const logs = expectDiagnostics({
    event: 'upstream_request_failed',
    severity: 'error',
    status: 403
  })
  const response = new Response(
    '<title>Just a moment...</title> user@example.com 192.0.2.3 ?token=secret-value ' +
      'x'.repeat(20_000),
    {
      status: 403,
      headers: { 'cf-ray': 'example-IAD', 'cf-mitigated': 'challenge' }
    }
  )
  await upstreamFetch(
    'https://api.x.com/2/users/me?token=secret-value',
    undefined,
    { provider: 'X' },
    vi.fn<typeof fetch>().mockResolvedValue(response)
  )
  const log = JSON.parse(logs[0]!)
  expect(log.upstream.bodyPreview).toContain('Just a moment')
  expect(log.upstream.bodyPreview.length).toBeLessThanOrEqual(4096)
  expect(log.upstream.bodyTruncated).toBe(true)
  expect(logs[0]).not.toMatch(/secret-value|user@example.com|192\.0\.2\.3/)
  expect((await response.text()).length).toBeGreaterThan(20_000)
})

test('slow diagnostic bodies cannot block indefinitely or consume the caller response', async () => {
  const logs = expectDiagnostics({
    event: 'upstream_request_failed',
    severity: 'error',
    status: 503
  })
  let controller: ReadableStreamDefaultController<Uint8Array>
  const response = new Response(
    new ReadableStream<Uint8Array>({
      start(value) {
        controller = value
      }
    }),
    { status: 503 }
  )
  const started = performance.now()
  await upstreamFetch(
    'https://api.typesafe.ai/v1/systemone',
    undefined,
    { provider: 'TypeSafe' },
    vi.fn<typeof fetch>().mockResolvedValue(response)
  )
  expect(performance.now() - started).toBeLessThan(1500)
  expect(JSON.parse(logs[0]!).upstream.bodyTruncated).toBe(true)
  controller!.enqueue(new TextEncoder().encode('later body'))
  controller!.close()
  expect(await response.text()).toBe('later body')
})

test('SDK-owned X requests are covered once and first-party traffic passes through', async () => {
  const logs = expectDiagnostics({
    event: 'upstream_request_failed',
    severity: 'error',
    status: 401,
    provider: 'X'
  })
  const fetcher = vi
    .fn<typeof fetch>()
    .mockImplementation(async () =>
      Response.json({ error: 'invalid_grant' }, { status: 401 })
    )
  vi.stubGlobal('fetch', fetcher)
  installSdkFetchLogging()
  const installed = globalThis.fetch
  installSdkFetchLogging()
  expect(globalThis.fetch).toBe(installed)
  await fetch('https://api.x.com/2/oauth2/token', {
    method: 'POST',
    body: 'code=private-code&client_secret=private-secret'
  })
  await fetch('https://doom-or-bloom.com/api/assessments')
  expect(fetcher).toHaveBeenCalledTimes(2)
  expect(logs).toHaveLength(1)
})

test('transport exceptions retain their original identity and network code', async () => {
  expectDiagnostics({
    event: 'upstream_request_failed',
    severity: 'error',
    status: null,
    error: { cause: { code: 'ECONNRESET' } }
  })
  const error = new TypeError('private URL', {
    cause: Object.assign(new Error('private host'), { code: 'ECONNRESET' })
  })
  await expect(
    upstreamFetch(
      'https://api.openai.com/v1/responses',
      undefined,
      { provider: 'OpenAI' },
      vi.fn<typeof fetch>().mockRejectedValue(error)
    )
  ).rejects.toBe(error)
})
