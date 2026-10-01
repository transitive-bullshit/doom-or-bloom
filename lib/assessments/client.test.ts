import { afterEach, expect, test, vi } from 'vitest'
import { englishTranslator } from '@/i18n/translators'
import { testTranslator } from '@/i18n/test-translator'
import { api, ApiError, userErrorMessage } from './client'

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
  const error = await api<never>('/api/assessments/example').catch(
    (err: unknown) => err as ApiError
  )
  expect(error).toMatchObject({ status: 0, code: 'connect' })
  expect(error.message).not.toContain('internal-api-host')
  // A network failure is not a rejected request: the caller's copy applies.
  expect(userErrorMessage(englishTranslator(), error, 'Fallback')).toBe(
    'Fallback'
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
  const error = await api<never>('/api/assessments/example').catch(
    (err: unknown) => err as ApiError
  )
  expect(error).toMatchObject({ status: 409, code: 'results_required' })
  expect(userErrorMessage(englishTranslator(), error, 'Fallback')).toBe(
    'View your results before publishing.'
  )
  expect(userErrorMessage(testTranslator('es'), error, 'Fallback')).toBe(
    'Consulta tus resultados antes de publicar.'
  )
})
