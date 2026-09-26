import { expectDiagnostics } from '@/tests/helpers/diagnostics'
import { beforeEach, afterEach, expect, test, vi } from 'vitest'
import { z } from 'zod'
import { POST as assess } from '@/app/api/assessment/route'
import { GET as tweet } from '@/app/api/tweet/route'
import { GET as savedJourney } from '@/app/api/user-journeys/route'
import { projectJourneyStore } from '@/lib/journeys/store'
import { personas } from '@/lib/journeys/catalog'
import { POST as card } from '@/app/api/share-card/route'
import { runAssessment } from './engine'
import { getTweet } from 'react-tweet/api'
import { render } from 'takumi-js'

vi.mock('@/lib/debug/local-access', () => ({
  localDebugAvailable: () => true,
  localWriteRequestAllowed: () => true
}))
vi.mock('@/lib/journeys/store', () => ({
  projectJourneyStore: vi.fn<typeof projectJourneyStore>()
}))
vi.mock('./engine', () => ({ runAssessment: vi.fn<typeof runAssessment>() }))
vi.mock('react-tweet/api', () => ({ getTweet: vi.fn<typeof getTweet>() }))
vi.mock('takumi-js', () => ({ render: vi.fn<typeof render>() }))

beforeEach(() => {
  vi.mocked(runAssessment).mockReset()
  vi.stubEnv('ASSESSMENT_PROVIDER', 'fixture')
  vi.stubEnv('NEXT_PUBLIC_ASSESSMENT_DEBUG', 'false')
})
afterEach(() => {
  vi.unstubAllEnvs()
})

function request(path: string, body: unknown) {
  return new Request(`http://localhost/api/${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  })
}
function failure(response: Response, phase: string, logs: string[]) {
  const raw = logs[0]!
  expect(raw).not.toContain('PRIVATE_')
  expect(JSON.parse(raw)).toMatchObject({
    event: 'api_request_failed',
    phase,
    status: response.status,
    requestId: response.headers.get('X-Request-ID'),
    severity: 'error'
  })
  expect(response.headers.get('X-Request-ID')).toBeTruthy()
  return JSON.parse(raw)
}

test('retired client-authoritative assessment API cannot run inference', async () => {
  const response = await assess()
  expect(response.status).toBe(410)
  expect(runAssessment).not.toHaveBeenCalled()
})

test('tweet network failures log the underlying system code', async () => {
  const logs = expectDiagnostics({
    event: 'api_request_failed',
    severity: 'error',
    phase: 'fetch_tweet',
    route: '/api/tweet',
    status: 502,
    error: { type: 'Error', cause: { code: 'ECONNRESET' } }
  })
  vi.mocked(getTweet).mockRejectedValueOnce(
    new Error('PRIVATE_URL', {
      cause: Object.assign(new Error('PRIVATE_HOST'), { code: 'ECONNRESET' })
    })
  )
  const response = await tweet(new Request('http://localhost/api/tweet?id=123'))
  expect(response.status).toBe(502)
  expect(failure(response, 'fetch_tweet', logs).error.cause.code).toBe(
    'ECONNRESET'
  )
})

test('card renderer validation errors are logged as server failures', async () => {
  const logs = expectDiagnostics({
    event: 'api_request_failed',
    severity: 'error',
    phase: 'render_card',
    route: '/api/share-card',
    status: 500,
    error: { type: 'ZodError', code: 'validation_failed' }
  })
  const err = z.string().safeParse(123).error!
  vi.mocked(render).mockRejectedValueOnce(err)
  const response = await card(
    request('share-card', {
      horizontal: 0.5,
      vertical: 0.5,
      horizontalRange: [0, 1],
      verticalRange: [0, 1],
      provisional: true
    })
  )
  expect(response.status).toBe(500)
  failure(response, 'render_card', logs)
})

test('saved persona read failures identify the storage phase', async () => {
  const logs = expectDiagnostics({
    event: 'api_request_failed',
    severity: 'error',
    phase: 'read_saved_run',
    route: '/api/user-journeys',
    status: 500,
    error: { type: 'Error', code: 'ENOENT' }
  })
  vi.mocked(projectJourneyStore).mockReturnValueOnce({
    read: async () => {
      throw Object.assign(new Error('PRIVATE_PATH'), { code: 'ENOENT' })
    }
  } as never)
  const response = await savedJourney(
    new Request(`http://localhost/api/user-journeys?persona=${personas[0]!.id}`)
  )
  expect(response.status).toBe(500)
  expect(failure(response, 'read_saved_run', logs).error.code).toBe('ENOENT')
})
