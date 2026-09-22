import { beforeEach, afterEach, expect, test, vi } from 'vitest'
import { APIError } from '@typesafe-ai/sdk'
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
import { createAssessment } from '@/lib/assessment/state'

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
  vi.spyOn(console, 'error').mockImplementation(() => {})
  vi.spyOn(console, 'warn').mockImplementation(() => {})
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
function assessmentRequest() {
  const id = crypto.randomUUID()
  const { interactionHistory: _history, ...assessment } = createAssessment(id)
  return request('assessment', {
    assessment,
    requestId: id,
    debug: false,
    operation: { type: 'answer', text: 'PRIVATE_ANSWER' }
  })
}
function failure(response: Response, phase: string) {
  const raw = vi.mocked(console.error).mock.calls.at(-1)![0] as string
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

test('assessment provider failure logs correlation and payload metadata even with debug disabled', async () => {
  vi.mocked(runAssessment).mockRejectedValueOnce(
    new APIError(
      400,
      {
        detail: { error_type: 'max_tokens_exceeded' },
        input: 'PRIVATE_ANSWER'
      },
      new Headers({ 'x-typesafe-request-id': 'provider-123' })
    )
  )
  const response = await assess(assessmentRequest())
  expect(response.status).toBe(503)
  const record = failure(response, 'evaluate')
  expect(record).toMatchObject({
    operation: 'answer',
    answerCount: 0,
    error: {
      code: 'max_tokens_exceeded',
      providerRequestId: 'provider-123',
      status: 400
    }
  })
  expect(vi.mocked(runAssessment).mock.calls.at(-1)![5]).toBe(record.requestId)
  expect(await response.text()).not.toContain('PRIVATE_')
})

test('invalid evaluator output is a logged server error, not an invalid-input response', async () => {
  vi.mocked(runAssessment).mockResolvedValueOnce({ assessment: {} } as never)
  const response = await assess(assessmentRequest())
  expect(response.status).toBe(500)
  expect(failure(response, 'validate_output').error.code).toBe(
    'validation_failed'
  )
})

test('invalid user input is a warning and never reaches the evaluator', async () => {
  const response = await assess(
    request('assessment', { secret: 'PRIVATE_ANSWER' })
  )
  expect(response.status).toBe(400)
  expect(console.error).not.toHaveBeenCalled()
  const raw = vi.mocked(console.warn).mock.calls[0]![0] as string
  expect(raw).not.toContain('PRIVATE_')
  expect(JSON.parse(raw)).toMatchObject({ phase: 'parse_input', status: 400 })
})

test('tweet network failures log the underlying system code', async () => {
  vi.mocked(getTweet).mockRejectedValueOnce(
    new Error('PRIVATE_URL', {
      cause: Object.assign(new Error('PRIVATE_HOST'), { code: 'ECONNRESET' })
    })
  )
  const response = await tweet(new Request('http://localhost/api/tweet?id=123'))
  expect(response.status).toBe(502)
  expect(failure(response, 'fetch_tweet').error.cause.code).toBe('ECONNRESET')
})

test('card renderer validation errors are logged as server failures', async () => {
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
  failure(response, 'render_card')
})

test('saved persona read failures identify the storage phase', async () => {
  vi.mocked(projectJourneyStore).mockReturnValueOnce({
    read: async () => {
      throw Object.assign(new Error('PRIVATE_PATH'), { code: 'ENOENT' })
    }
  } as never)
  const response = await savedJourney(
    new Request(`http://localhost/api/user-journeys?persona=${personas[0]!.id}`)
  )
  expect(response.status).toBe(500)
  expect(failure(response, 'read_saved_run').error.code).toBe('ENOENT')
})
