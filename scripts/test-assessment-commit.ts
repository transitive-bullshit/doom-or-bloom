import assert from 'node:assert/strict'
import { randomUUID } from 'node:crypto'
import { Pool, type QueryConfig, type QueryResult } from 'pg'
type DriverQuery = (
  query: string | QueryConfig,
  values?: unknown[]
) => Promise<QueryResult>
import {
  assessmentRepository,
  type Evaluator
} from '../lib/assessments/repository'
import { databaseUrl } from '../lib/db/config'
import { versions } from '../lib/assessment/schema'

const connectionString = databaseUrl(process.env.TEST_DATABASE_URL)
assert.ok(new URL(connectionString).pathname.endsWith('_test'))
const pool = new Pool({ connectionString })
let fault: 'before' | 'after' | null = null
// Fault injection stays at the driver boundary: Postgres still executes the real
// transactions and constraints, with only the COMMIT acknowledgment disturbed.
const instrumented = new Proxy(pool, {
  get(target, property) {
    if (property === 'connect')
      return async () => {
        const client = await target.connect()
        const query = client.query.bind(client) as DriverQuery
        return new Proxy(client, {
          get(connection, member) {
            if (member === 'query')
              return async (...args: Parameters<DriverQuery>) => {
                const command =
                  typeof args[0] === 'string' ? args[0] : args[0]?.text
                const mode = command?.toLowerCase() === 'commit' ? fault : null
                if (mode) fault = null
                if (mode === 'before')
                  throw new Error('Injected COMMIT transport failure')
                const result = await query(...args)
                if (mode === 'after')
                  throw new Error('Injected lost COMMIT acknowledgment')
                return result
              }
            const value = connection[member as keyof typeof connection]
            return typeof value === 'function' ? value.bind(connection) : value
          }
        })
      }
    const value = target[property as keyof typeof target]
    return typeof value === 'function' ? value.bind(target) : value
  }
})
const repo = assessmentRepository(instrumented)
const owner = randomUUID()
const ids: string[] = []
let calls = 0
const evaluate: Evaluator = async (state, input) => {
  calls++
  return {
    assessmentId: state.id,
    requestId: input.requestKey,
    baseRevision: state.revision,
    assessment: { ...state, revision: state.revision + 1 },
    provider: 'fixture'
  }
}
try {
  await pool.query(
    'INSERT INTO "user" (id,name,email,is_anonymous) VALUES ($1,\'Commit test\',$2,true)',
    [owner, `${owner}@test.invalid`]
  )
  for (const mode of ['before', 'after'] as const) {
    const { id } = await repo.create(owner, randomUUID(), versions.model)
    assert.ok(id)
    ids.push(id)
    const input = {
      assessmentId: id,
      expectedRevision: 0,
      requestKey: randomUUID(),
      operation: { type: 'stop' as const },
      debug: false
    }
    const before = (await repo.load(owner, id)).assessment
    const result = await repo.submit(owner, input, async (...args) => {
      const result = await evaluate(...args)
      fault = mode
      return result
    })
    assert.equal(
      result.operation.status,
      mode === 'before' ? 'failed' : 'succeeded'
    )
    const replay = await repo.submit(owner, input, evaluate)
    assert.deepEqual(replay, result)
    const after = (await repo.load(owner, id)).assessment
    if (mode === 'before') assert.deepEqual(after, before)
    else assert.equal(after.revision, 1)
    const snapshots = await pool.query(
      'SELECT count(*) AS count FROM assessment_snapshots WHERE assessment_id=$1',
      [id]
    )
    assert.equal(Number(snapshots.rows[0].count), mode === 'before' ? 1 : 2)
  }
  assert.equal(calls, 2)
  const { id } = await repo.create(owner, randomUUID(), versions.model)
  assert.ok(id)
  ids.push(id)
  const input = {
    assessmentId: id,
    expectedRevision: 0,
    requestKey: randomUUID(),
    operation: {
      type: 'answer' as const,
      text: 'Keep this input despite lost acceptance acknowledgment'
    },
    debug: false
  }
  fault = 'after'
  await assert.rejects(
    repo.submit(owner, input, evaluate),
    (error: unknown) =>
      error instanceof Error &&
      error.cause instanceof Error &&
      error.cause.message.includes('lost COMMIT')
  )
  const replay = await repo.submit(owner, input, evaluate)
  assert.equal(replay.operation.status, 'running')
  assert.equal(calls, 2)
  assert.deepEqual(replay.operation.action, input.operation)
  await pool.query(
    "UPDATE assessment_operations SET deadline=now()-interval '1 second' WHERE assessment_id=$1",
    [id]
  )
  const retry = await repo.submit(
    owner,
    { ...input, requestKey: randomUUID(), retryOf: replay.operation.id },
    evaluate
  )
  assert.equal(retry.operation.status, 'succeeded')
  assert.equal(calls, 3)
  console.log(
    'PASS: failed COMMIT rollback, lost COMMIT acknowledgment, immutable snapshot counts, acceptance loss and explicit retry without duplicate evaluation'
  )
} finally {
  await pool.query('DELETE FROM assessments WHERE id=ANY($1::uuid[])', [ids])
  await pool.query('DELETE FROM "user" WHERE id=$1', [owner])
  await pool.end()
}
