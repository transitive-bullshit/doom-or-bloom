import { expect, test, vi } from 'vitest'
import { expectDiagnostics } from '@/tests/helpers/diagnostics'
import { GET, POST } from '@/app/api/auth/[...all]/route'
import { diagnosticContext } from '../server/diagnostic-context'

const { handler } = vi.hoisted(() => ({
  handler: vi.fn<(request: Request) => Promise<Response>>()
}))
vi.mock('./server', () => ({ getAuth: () => ({ handler }) }))
vi.mock('./origin', () => ({ hasTrustedOrigin: () => false }))

test('auth logging returns the exact redirect and cookies and keeps the origin guard', async () => {
  const response = new Response(null, {
    status: 302,
    headers: { location: '/assessments', 'set-cookie': 'session=private' }
  })
  handler.mockImplementationOnce(async () => {
    expect(diagnosticContext()?.route).toBe('/api/auth/[...all]')
    return response
  })
  expect(
    await GET(
      new Request('https://example.com/api/auth/callback/twitter?code=secret')
    )
  ).toBe(response)
  expect(
    (
      await POST(
        new Request('https://example.com/api/auth/sign-in', { method: 'POST' })
      )
    ).status
  ).toBe(403)
  expect(handler).toHaveBeenCalledTimes(1)
  expect(diagnosticContext()).toBeUndefined()
})

test('auth errors retain response and exception identity without logging OAuth values', async () => {
  const logs = expectDiagnostics(
    { event: 'auth_request_failed', severity: 'warn' },
    { event: 'auth_request_failed', severity: 'error' }
  )
  const response = new Response('private-body', { status: 401 })
  handler.mockResolvedValueOnce(response)
  const request = new Request(
    'https://example.com/api/auth/callback/twitter?code=private-code'
  )
  expect(await GET(request)).toBe(response)
  const error = new Error('private-secret')
  handler.mockRejectedValueOnce(error)
  await expect(GET(request)).rejects.toBe(error)
  expect(logs.join('')).not.toContain('private-')
  expect(JSON.parse(logs[0]!).requestId).toBeTruthy()
})
