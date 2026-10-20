import { afterEach, expect, test, vi } from 'vitest'
import { runWorkersAiWithRetry, WorkersAiError } from './workers-ai'

afterEach(() => vi.unstubAllEnvs())

test('the REST transport unwraps the result and retries a transient failure once', async () => {
  vi.stubEnv('CLOUDFLARE_API_TOKEN', 'test-token')
  vi.stubEnv('CLOUDFLARE_ACCOUNT_ID', 'acct')
  const calls: Array<{ url: string; init: RequestInit }> = []
  const responses = [
    Response.json(
      {
        success: false,
        errors: [{ code: 3040, message: 'Capacity temporarily exceeded' }]
      },
      { status: 429 }
    ),
    Response.json({ success: true, result: { model: 'clef', answers: {} } })
  ]
  const fetcher = (async (url: string, init: RequestInit) => {
    calls.push({ url, init })
    return responses.shift()!
  }) as unknown as typeof fetch
  const result = await runWorkersAiWithRetry(
    '@cf/cloudflare/clef',
    { model: 'clef' },
    { fetch: fetcher, retryDelayMs: 0 }
  )
  expect(result.output).toEqual({ model: 'clef', answers: {} })
  expect(result.attempts).toBe(2)
  expect(calls[0]!.url).toBe(
    'https://api.cloudflare.com/client/v4/accounts/acct/ai/run/@cf/cloudflare/clef'
  )
  expect(new Headers(calls[0]!.init.headers).get('authorization')).toBe(
    'Bearer test-token'
  )
})

test('permanent REST errors are not retried and keep the token out of the message', async () => {
  vi.stubEnv('CLOUDFLARE_API_TOKEN', 'secret-token')
  vi.stubEnv('CLOUDFLARE_ACCOUNT_ID', 'acct')
  let calls = 0
  const fetcher = (async () => {
    calls++
    return Response.json(
      {
        success: false,
        errors: [{ code: 3030, message: 'Request body failed validation' }]
      },
      { status: 400 }
    )
  }) as unknown as typeof fetch
  const failure = await runWorkersAiWithRetry(
    '@cf/cloudflare/clef',
    {},
    { fetch: fetcher, retryDelayMs: 0 }
  ).catch((err: unknown) => err)
  expect(failure).toBeInstanceOf(WorkersAiError)
  expect(failure).toMatchObject({ status: 400, transient: false })
  expect(String((failure as Error).message)).toContain('3030')
  expect(String((failure as Error).message)).not.toContain('secret-token')
  expect(calls).toBe(1)
})
