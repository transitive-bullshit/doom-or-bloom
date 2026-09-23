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
