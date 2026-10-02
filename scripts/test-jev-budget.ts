// Native-Postgres checks for the Jev spend budget: atomic concurrent spend,
// one signal per threshold and hold, and the participant path through the real
// evaluator, live provider and SDK against a mocked TypeSafe. No paid calls.
import assert from 'node:assert/strict'
import { randomUUID } from 'node:crypto'
import { Pool } from 'pg'
import { databaseUrl } from '../lib/db/config'

const connectionString = databaseUrl(process.env.TEST_DATABASE_URL)
assert.ok(new URL(connectionString).pathname.endsWith('_test'))
// The participant evaluator reads the app pool and live configuration.
process.env.DATABASE_URL = connectionString
process.env.ASSESSMENT_PROVIDER = 'live'
process.env.TYPESAFE_API_KEY = 'test-key-never-a-real-credential'
delete process.env.JEV_MONTHLY_BUDGET_USD
delete process.env.JEV_DAILY_BUDGET_USD

// Structured diagnostics are asserted below; anything else still prints.
const logs: Array<Record<string, unknown>> = []
for (const level of ['error', 'warn'] as const) {
  const original = console[level].bind(console)
  console[level] = (...args: unknown[]) => {
    try {
      logs.push(JSON.parse(String(args[0])))
    } catch {
      original(...args)
    }
  }
}
const events = (name: string) => logs.filter((log) => log.event === name)

const { jevBudgetStore } = await import('../lib/server/jev-budget-store')
const { budgetPeriods, jevCostNanoUsd, providerHoldMs, usdToNano } =
  await import('../lib/server/jev-budget')
const { assessmentRepository } = await import('../lib/assessments/repository')
const { evaluateAssessment } = await import('../lib/assessments/server')
const { fixtureAnswer } = await import('../lib/server/provider')
const { versions } = await import('../lib/assessment/schema')
const { getPool } = await import('../lib/db')
type Question = import('../lib/assessment/schema').Question

const pool = new Pool({ connectionString, max: 10 })
const store = jevBudgetStore(pool)
const clear = () =>
  pool.query('DELETE FROM jev_spend; DELETE FROM jev_provider_status')
const owner = randomUUID()
const realFetch = globalThis.fetch

try {
  // 1. Concurrent increments from many connections are all retained, and each
  // threshold is reported by exactly one of them.
  await clear()
  const at = new Date('2031-05-31T23:30:00Z')
  const call = { input_tokens: 1_000, output_tokens: 5, requests: 1 }
  const limits = {
    month: jevCostNanoUsd(call) * 100,
    day: usdToNano(1_000)
  }
  await Promise.all(
    Array.from({ length: 200 }, () => store.record(call, at, limits))
  )
  const { rows: spend } = await pool.query(
    `SELECT period, period_start::text, input_tokens::int, output_tokens::int,
       cost_nano_usd::bigint::text AS cost, requests
     FROM jev_spend ORDER BY period`
  )
  assert.deepEqual(spend, [
    {
      period: 'day',
      period_start: '2031-05-31',
      input_tokens: 200_000,
      output_tokens: 1_000,
      cost: String(200 * 42_000),
      requests: 200
    },
    {
      period: 'month',
      period_start: '2031-05-01',
      input_tokens: 200_000,
      output_tokens: 1_000,
      cost: String(200 * 42_000),
      requests: 200
    }
  ])
  const crossings = events('jev_budget_threshold_crossed')
  assert.deepEqual(
    crossings
      .map((log) => [log.period, log.threshold, log.severity])
      .sort((a, b) => Number(a[1]) - Number(b[1])),
    [
      ['month', 0.8, 'warn'],
      ['month', 1, 'error']
    ]
  )
  for (const log of crossings)
    assert.deepEqual(
      Object.keys(log).filter((key) =>
        /answer|text|owner|assessment|user/i.test(key)
      ),
      [],
      'budget signals carry no participant data'
    )
  assert.equal((await store.state(at, limits)).blocked, 'budget_exhausted')
  // A new UTC month starts from zero.
  assert.equal(
    (await store.state(new Date('2031-06-01T00:00:01Z'), limits)).blocked,
    null
  )

  // 2. Concurrent 402s start one provider hold and one signal; it expires.
  await clear()
  const t0 = new Date('2031-05-31T12:00:00Z')
  const marks = await Promise.all(
    Array.from({ length: 12 }, () => store.markProviderOutOfCredits(t0))
  )
  assert.equal(marks.filter(Boolean).length, 1)
  assert.equal(
    (await store.state(new Date(t0.getTime() + 60_000))).blocked,
    'provider_out_of_credits'
  )
  const expired = new Date(t0.getTime() + providerHoldMs)
  assert.equal((await store.state(expired)).blocked, null)
  assert.equal(await store.markProviderOutOfCredits(expired), true)
  assert.equal(events('jev_provider_out_of_credits').length, 2)

  // 3. A participant answer survives TypeSafe running out of credits and our
  // own budget, and retries once spend is available again.
  await clear()
  await pool.query(
    'INSERT INTO "user" (id,name,email,is_anonymous) VALUES ($1,\'Budget test\',$2,true)',
    [owner, `${owner}@test.invalid`]
  )
  const repo = assessmentRepository(pool)
  const { id } = await repo.create(owner, randomUUID(), versions.model)
  assert.ok(id)
  let typesafe: 'out_of_credits' | 'ok' = 'out_of_credits'
  let jevCalls = 0
  globalThis.fetch = async (input, init) => {
    if (
      !String(input instanceof Request ? input.url : input).includes('typesafe')
    )
      return realFetch(input, init)
    jevCalls++
    if (typesafe === 'out_of_credits')
      return Response.json(
        {
          detail: {
            error_type: 'billing_error',
            message: 'Your organization has no available TypeSafe API credits.'
          }
        },
        { status: 402 }
      )
    if (typeof init?.body !== 'string') throw new Error('Expected JSON')
    const body = JSON.parse(init.body) as {
      model: string
      questions: Record<string, Question>
    }
    return Response.json({
      model: body.model,
      answers: Object.fromEntries(
        Object.entries(body.questions).map(([key, q]) => [
          key,
          fixtureAnswer(q)
        ])
      ),
      usage: { input_tokens: 1_000, output_tokens: 10 }
    })
  }
  const text = 'Keep this answer when Jev is out of budget.'
  const submission = (retryOf?: string, debug = false) => ({
    assessmentId: id,
    expectedRevision: 0,
    requestKey: randomUUID(),
    operation: { type: 'answer' as const, text },
    retryOf,
    debug
  })
  const savedOperation = async (operationId: string) =>
    (
      await pool.query(
        `SELECT status, action, failure_category, diagnostics
         FROM assessment_operations WHERE id = $1`,
        [operationId]
      )
    ).rows[0]

  const credits = await repo.submit(owner, submission(), evaluateAssessment)
  assert.equal(credits.operation.status, 'failed')
  assert.equal(credits.operation.failureCategory, 'provider_out_of_credits')
  assert.equal(jevCalls, 1, 'a 402 is not retried')
  const stored = await savedOperation(credits.operation.id)
  assert.equal(stored.action.text, text, 'the submitted answer is saved')
  assert.equal(stored.failure_category, 'provider_out_of_credits')
  assert.ok(
    stored.diagnostics.some(
      (entry: { status?: number }) => entry.status === 402
    )
  )
  assert.equal((await repo.load(owner, id)).assessment.revision, 0)
  assert.equal(events('jev_provider_out_of_credits').length, 3)

  // During the hold, a retry makes no Jev call. Debug capture wraps the error.
  const held = await repo.submit(
    owner,
    submission(credits.operation.id, true),
    evaluateAssessment
  )
  assert.equal(held.operation.failureCategory, 'provider_out_of_credits')
  assert.equal(jevCalls, 1)

  // Our own monthly budget blocks the same way, before any Jev call.
  await clear()
  const periods = budgetPeriods(new Date())
  await pool.query(
    `INSERT INTO jev_spend (period, period_start, cost_nano_usd) VALUES ('month', $1, $2)`,
    [periods.month, usdToNano(150)]
  )
  const budget = await repo.submit(
    owner,
    submission(held.operation.id),
    evaluateAssessment
  )
  assert.equal(budget.operation.status, 'failed')
  assert.equal(budget.operation.failureCategory, 'budget_exhausted')
  assert.equal(jevCalls, 1)
  assert.equal((await savedOperation(budget.operation.id)).action.text, text)
  assert.equal((await repo.load(owner, id)).assessment.revision, 0)

  // With budget and credits available, the saved answer retries and its spend
  // is recorded from the usage TypeSafe reported.
  await clear()
  typesafe = 'ok'
  const retried = await repo.submit(
    owner,
    submission(budget.operation.id),
    evaluateAssessment
  )
  assert.equal(retried.operation.status, 'succeeded')
  const committed = (await repo.load(owner, id)).assessment
  assert.equal(committed.revision, 1)
  assert.equal(committed.answers[0]?.text, text)
  const successful = jevCalls - 1
  assert.ok(successful > 0)
  const { rows: recorded } = await pool.query(
    `SELECT period, period_start::text, input_tokens::int, cost_nano_usd::int AS cost, requests
     FROM jev_spend ORDER BY period`
  )
  assert.deepEqual(recorded, [
    {
      period: 'day',
      period_start: periods.day,
      input_tokens: 1_000 * successful,
      cost: 42_000 * successful,
      requests: successful
    },
    {
      period: 'month',
      period_start: periods.month,
      input_tokens: 1_000 * successful,
      cost: 42_000 * successful,
      requests: successful
    }
  ])
  console.log(
    `Jev budget checks passed: 200 concurrent increments, ${successful} recorded Jev requests, answer retained through 3 blocked attempts`
  )
} finally {
  globalThis.fetch = realFetch
  await pool.query('DELETE FROM assessments WHERE owner_id = $1', [owner])
  await pool.query('DELETE FROM "user" WHERE id = $1', [owner])
  await clear()
  await pool.end()
  await getPool().end()
}
