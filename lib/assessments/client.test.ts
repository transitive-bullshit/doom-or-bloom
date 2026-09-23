import { afterEach, expect, test, vi } from 'vitest'
import { api, ApiError } from './client'

afterEach(() => vi.unstubAllGlobals())
test('empty error responses produce a useful API error, not a JSON parse error', async () => {
  vi.stubGlobal(
    'fetch',
    vi.fn().mockResolvedValue(new Response(null, { status: 503 }))
  )
  await expect(api('/api/auth/get-session')).rejects.toBeInstanceOf(ApiError)
})
test('empty successful session responses represent no session', async () => {
  vi.stubGlobal(
    'fetch',
    vi.fn().mockResolvedValue(new Response(null, { status: 200 }))
  )
  await expect(api('/api/auth/get-session')).resolves.toBeNull()
})

test.each([400, 409, 500, 503])(
  'server exception text is not exposed for HTTP %s',
  async (status) => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(
        Response.json(
          {
            error:
              'Retry with request key secret-internal-key; SQL constraint failed'
          },
          { status }
        )
      )
    )
    await expect(api('/api/assessments/example')).rejects.not.toThrow(
      /request key|SQL|secret-internal-key/
    )
  }
)
test('network exception text is not exposed', async () => {
  vi.stubGlobal(
    'fetch',
    vi
      .fn()
      .mockRejectedValue(new TypeError('Failed to fetch internal-api-host'))
  )
  await expect(api('/api/assessments/example')).rejects.toThrow(
    'Unable to connect. Please try again.'
  )
})

test('known errors use controlled copy rather than a server-supplied message', async () => {
  vi.stubGlobal(
    'fetch',
    vi.fn().mockResolvedValue(
      Response.json(
        {
          code: 'results_required',
          error: 'SQL internal details'
        },
        { status: 409 }
      )
    )
  )
  await expect(api('/api/assessments/example')).rejects.toThrow(
    'View your results before publishing.'
  )
})
