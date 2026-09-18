import { afterEach, expect, test, vi } from 'vitest'
import { createLiveProvider, validateEvaluation } from './live-provider'
import { fixtureAnswer } from './provider'
import { limits } from '@/lib/assessment/schema'
import { providerFailure } from '@/lib/journeys/failure'
import type { Question } from '@/lib/assessment/schema'
const question: Question = {
  type: 'choice',
  instructions: 'Classify',
  criteria: { a: null, none: null }
}
const raw = {
  model: 'jev-1.13.0',
  answers: { q: fixtureAnswer(question, 'a') },
  usage: { input_tokens: 1, output_tokens: 1 }
}
test('provider boundary validates options, primitives, distributions and missing answers', () => {
  expect(validateEvaluation(raw, { q: question }).model).toBe('jev-1.13.0')
  expect(() =>
    validateEvaluation({ ...raw, answers: {} }, { q: question })
  ).toThrow()
  expect(() =>
    validateEvaluation(
      { ...raw, answers: { q: { type: 'noul', noul: 0.5 } } },
      { q: question }
    )
  ).toThrow()
  expect(() =>
    validateEvaluation(
      {
        ...raw,
        answers: {
          q: {
            type: 'choice',
            choice: 'made-up',
            confidence: 1,
            probabilities: { a: 0, none: 1 }
          }
        }
      },
      { q: question }
    )
  ).toThrow()
  expect(() =>
    validateEvaluation(
      {
        ...raw,
        answers: {
          q: {
            type: 'choice',
            choice: 'a',
            confidence: 1,
            probabilities: { a: 0.8, none: 0.8 }
          }
        }
      },
      { q: question }
    )
  ).toThrow()
})
test('noul has no confidence field; ordered score must agree with distribution', () => {
  expect(
    validateEvaluation(
      { ...raw, answers: { q: { type: 'noul', noul: 0.4 } } },
      { q: { type: 'noul', instructions: 'Present?' } }
    ).answers.q
  ).toEqual({ type: 'noul', noul: 0.4 })
  const score: Question = {
    type: 'score',
    instructions: 'Rate',
    criteria: ['Low', 'High']
  }
  expect(() =>
    validateEvaluation(
      {
        ...raw,
        answers: { q: { ...fixtureAnswer(score, undefined, 1), score: 0 } }
      },
      { q: score }
    )
  ).toThrow()
})

afterEach(() => {
  vi.unstubAllGlobals()
  vi.unstubAllEnvs()
  vi.useRealTimers()
})
function requestBody(init: RequestInit) {
  if (typeof init.body !== 'string') throw new Error('Expected a JSON request')
  return JSON.parse(init.body) as {
    model: string
    questions: Record<string, Question>
    state: unknown
  }
}
function successfulResponse(init: RequestInit) {
  const body = requestBody(init)
  return Response.json({
    model: body.model,
    answers: Object.fromEntries(
      Object.entries(body.questions).map(([id, q]) => [id, fixtureAnswer(q)])
    ),
    usage: { input_tokens: 10, output_tokens: 2 }
  })
}
function mockedProvider(
  handler: (_url: unknown, init: RequestInit) => Promise<Response>
) {
  vi.stubEnv('TYPESAFE_API_KEY', 'test-key-never-a-real-credential')
  const fetch = vi.fn<typeof handler>(handler)
  vi.stubGlobal('fetch', fetch)
  return { provider: createLiveProvider('jev-1.13.0'), fetch }
}
test('large batches retain the exact complete state and aggregate physical usage', async () => {
  const { provider, fetch } = mockedProvider(async (_url, init) =>
    successfulResponse(init)
  )
  const state = {
    exactAnswer: '漢'.repeat(40_000),
    source: 'exact canonical source facts'
  }
  const questions = Object.fromEntries(
    Array.from({ length: 9 }, (_, i) => [`q${i}`, question])
  )
  const result = await provider.evaluate(state, questions)
  expect(fetch).toHaveBeenCalledTimes(2)
  expect(result.attempts).toBe(2)
  expect(result.usage).toEqual({ input_tokens: 20, output_tokens: 4 })
  expect(Object.keys(result.answers)).toEqual(Object.keys(questions))
  for (const [, init] of fetch.mock.calls)
    expect(requestBody(init).state).toEqual(state)
})
test('only an oversized multi-question request splits; one-question overflow terminates', async () => {
  const { provider, fetch } = mockedProvider(async (_url, init) => {
    const body = requestBody(init)
    return Object.keys(body.questions).length > 1
      ? Response.json({ message: 'Exceeded token limit' }, { status: 400 })
      : successfulResponse(init)
  })
  const result = await provider.evaluate(
    { original: 'unchanged' },
    { a: question, b: question }
  )
  expect(fetch).toHaveBeenCalledTimes(3)
  expect(result.attempts).toBe(3)
  expect(result.usage.input_tokens).toBe(20)
  fetch.mockImplementation(async () =>
    Response.json({ message: 'Exceeded token limit' }, { status: 400 })
  )
  await expect(provider.evaluate({}, { a: question })).rejects.toMatchObject({
    status: 400
  })
  expect(fetch).toHaveBeenCalledTimes(4)
})
test('transient batch retries respect the physical ceiling and remaining operation budget', async () => {
  let calls = 0
  const { provider, fetch } = mockedProvider(async (_url, init) =>
    ++calls % 3 !== 0
      ? Response.json(
          { message: 'Busy' },
          { status: 429, headers: { 'retry-after-ms': '0' } }
        )
      : successfulResponse(init)
  )
  const questions = Object.fromEntries(
    Array.from({ length: limits.questions }, (_, i) => [`q${i}`, question])
  )
  const state = { text: 'x'.repeat(100_001) }
  await expect(provider.evaluate(state, questions)).rejects.toThrow()
  expect(fetch).toHaveBeenCalledTimes(limits.providerAttempts)
  fetch.mockClear()
  await expect(
    provider.evaluate(state, questions, undefined, 2)
  ).rejects.toThrow()
  expect(fetch).toHaveBeenCalledTimes(2)
})
test('an oversized fallback stops without searching for the provider limit', async () => {
  const { provider, fetch } = mockedProvider(async () =>
    Response.json({ message: 'Exceeded token limit' }, { status: 400 })
  )
  await expect(
    provider.evaluate(
      {},
      { a: question, b: question, c: question, d: question }
    )
  ).rejects.toMatchObject({ status: 400 })
  expect(fetch).toHaveBeenCalledTimes(2)
})
test('authentication failures are not retried, while transient retries have a physical ceiling', async () => {
  const { provider, fetch } = mockedProvider(async () =>
    Response.json({ message: 'Unauthorized' }, { status: 401 })
  )
  await expect(
    provider.evaluate({}, { a: question, b: question })
  ).rejects.toMatchObject({ status: 401 })
  expect(fetch).toHaveBeenCalledTimes(1)
  fetch.mockImplementation(async () =>
    Response.json(
      { message: 'Busy' },
      { status: 429, headers: { 'retry-after-ms': '0' } }
    )
  )
  await expect(provider.evaluate({}, { a: question })).rejects.toMatchObject({
    status: 429
  })
  expect(fetch).toHaveBeenCalledTimes(4)
})
test('caller cancellation stops retry backoff without another physical request', async () => {
  const controller = new AbortController()
  const { provider, fetch } = mockedProvider(async () => {
    controller.abort()
    return Response.json({ message: 'Busy' }, { status: 429 })
  })
  await expect(
    provider.evaluate({}, { a: question }, controller.signal)
  ).rejects.toThrow()
  expect(fetch).toHaveBeenCalledTimes(1)
})
test('the shared provider deadline terminates a hanging request and its retries', async () => {
  vi.useFakeTimers()
  vi.spyOn(AbortSignal, 'timeout').mockImplementation((ms) => {
    const controller = new AbortController()
    setTimeout(() => controller.abort(), ms)
    return controller.signal
  })
  const { provider, fetch } = mockedProvider(
    async (_url, init) =>
      new Promise((_resolve, reject) => {
        init.signal!.addEventListener(
          'abort',
          () => reject(new Error('Aborted')),
          { once: true }
        )
      })
  )
  const outcome = provider
    .evaluate({}, { a: question })
    .catch((err: unknown) => err)
  await vi.advanceTimersByTimeAsync(45_001)
  expect(await outcome).toBeInstanceOf(Error)
  expect(fetch.mock.calls.length).toBeLessThanOrEqual(3)
})

test('debug records each physical batch and validated response without adding calls or leaking headers', async () => {
  const { provider, fetch } = mockedProvider(async (_url, init) =>
    successfulResponse(init)
  )
  const state = { exactAnswer: '漢'.repeat(40_000) }
  const questions = Object.fromEntries(
    Array.from({ length: 9 }, (_, i) => [`q${i}`, question])
  )
  const plain = await provider.evaluate(state, questions)
  const debug = await provider.evaluate(
    state,
    questions,
    undefined,
    limits.providerAttempts,
    true
  )
  expect(fetch).toHaveBeenCalledTimes(4)
  expect(plain.requests).toBeUndefined()
  const { requests, ...evaluation } = debug
  expect(evaluation).toEqual(plain)
  expect(requests).toHaveLength(2)
  for (const [index, record] of requests!.entries()) {
    const actual = requestBody(fetch.mock.calls[index + 2]![1])
    const body = {
      state,
      model: record.model,
      questions: Object.fromEntries(
        record.questionIds.map((id) => [id, questions[id]])
      )
    }
    expect(body).toEqual(actual)
    expect(record.attempt).toBe(index + 1)
    expect(record.status).toBe(200)
    expect(record.response?.answers).toEqual(
      Object.fromEntries(
        Object.entries(actual.questions).map(([id, q]) => [
          id,
          fixtureAnswer(q)
        ])
      )
    )
  }
  expect(JSON.stringify(requests)).not.toMatch(
    /test-key|authorization|headers|exactAnswer/
  )
})

test('debug identifies an oversized parent and successful child requests without retaining raw errors', async () => {
  const { provider, fetch } = mockedProvider(async (_url, init) =>
    Object.keys(requestBody(init).questions).length > 1
      ? Response.json(
          { message: 'Exceeded token limit PRIVATE_ERROR_CANARY' },
          { status: 400 }
        )
      : successfulResponse(init)
  )
  const result = await provider.evaluate(
    { current: 'unchanged' },
    { a: question, b: question },
    undefined,
    limits.providerAttempts,
    true
  )
  expect(fetch).toHaveBeenCalledTimes(3)
  expect(
    result.requests?.map((record) => [record.questionIds, record.status])
  ).toEqual([
    [['a', 'b'], 400],
    [['a'], 200],
    [['b'], 200]
  ])
  expect(result.requests![0]!.response).toBeUndefined()
  expect(result.requests![1]!.response).toBeDefined()
  expect(JSON.stringify(result.requests)).not.toContain('PRIVATE_ERROR_CANARY')
})

test('rounded live score at the tolerance boundary is not rejected by floating point error', async () => {
  const scoreQuestion: Question = {
    type: 'score',
    instructions: 'Rate gain',
    criteria: ['None', 'Small', 'Useful', 'High']
  }
  const { provider } = mockedProvider(async () =>
    Response.json({
      model: 'jev-1.13.0',
      answers: {
        q: {
          type: 'score',
          score: 0.49,
          confidence: 0.53,
          probabilities: { 0: 0.59, 1: 0.36, 2: 0.05, 3: 0 },
          legend: { 0: 'None', 1: 'Small', 2: 'Useful', 3: 'High' }
        }
      },
      usage: { input_tokens: 10, output_tokens: 2 }
    })
  )
  await expect(
    provider.evaluate({}, { q: scoreQuestion })
  ).resolves.toMatchObject({ answers: { q: { score: 0.49 } } })
})

test('failed later batch retains validated responses and physical diagnostics without transport secrets', async () => {
  let calls = 0
  const { provider } = mockedProvider(async (_url, init) =>
    ++calls === 1
      ? successfulResponse(init)
      : Response.json(
          { message: 'private response body' },
          {
            status: 401,
            headers: { 'x-private': 'private header' }
          }
        )
  )
  const questions = Object.fromEntries(
    Array.from({ length: 9 }, (_, i) => [`q${i}`, question])
  )
  const failure = await provider
    .evaluate({ text: '漢'.repeat(40_000) }, questions, undefined, 24, true)
    .then(
      () => {
        throw new Error('Expected failure')
      },
      (err: unknown) => providerFailure('Jev', err)
    )
  expect(failure.message).toContain('HTTP 401')
  expect(failure.evaluation?.attempts).toBe(2)
  expect(failure.evaluation?.requests?.map((r) => r.status)).toEqual([200, 401])
  expect(
    Object.keys(failure.evaluation!.requests![0]!.response!.answers)
  ).toHaveLength(8)
  expect(failure.evaluation!.requests![1]!.response).toBeUndefined()
  for (const secret of [
    'private response body',
    'private header',
    'test-key-never-a-real-credential'
  ])
    expect(JSON.stringify(failure)).not.toContain(secret)
})
