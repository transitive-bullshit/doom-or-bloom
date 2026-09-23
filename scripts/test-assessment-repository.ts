import assert from 'node:assert/strict'
import { randomUUID } from 'node:crypto'
import { Pool } from 'pg'
import {
  assessmentRepository,
  type Evaluator
} from '../lib/assessments/repository'
import type { Submission } from '../lib/assessments/contracts'
import { versions } from '../lib/assessment/schema'
import { databaseUrl } from '../lib/db/config'

const connectionString = databaseUrl(process.env.TEST_DATABASE_URL)
assert.ok(new URL(connectionString).pathname.endsWith('_test'))
const pool = new Pool({ connectionString })
const repo = assessmentRepository(pool)
const owner = randomUUID(),
  stranger = randomUUID()
const ids: string[] = []
let calls = 0
const evaluate: Evaluator = async (state, input) => {
  calls++
  return {
    assessmentId: state.id,
    baseRevision: state.revision,
    requestId: input.requestKey,
    assessment: { ...state, revision: state.revision + 1 },
    provider: 'fixture'
  }
}
const submission = (
  id: string,
  revision: number,
  extra: Partial<Submission> = {}
): Submission => ({
  assessmentId: id,
  expectedRevision: revision,
  requestKey: randomUUID(),
  operation: { type: 'stop' },
  debug: false,
  ...extra
})
function gate() {
  let release!: () => void
  let entered!: () => void
  const started = new Promise<void>((resolve) => {
    entered = resolve
  })
  const wait = new Promise<void>((resolve) => {
    release = resolve
  })
  const evaluator: Evaluator = async (...args) => {
    entered()
    await wait
    return evaluate(...args)
  }
  return { release, started, evaluator }
}
async function create() {
  const { id } = await repo.create(owner, randomUUID(), versions.model)
  assert.ok(id)
  ids.push(id)
  return id
}
try {
  for (const id of [owner, stranger])
    await pool.query(
      'INSERT INTO "user" (id,name,email) VALUES ($1,\'Repository test\',$2)',
      [id, `${id}@test.invalid`]
    )
  const key = randomUUID()
  const firstRun = await Promise.all([
    repo.create(owner, key, versions.model, true),
    repo.create(owner, randomUUID(), versions.model, true)
  ])
  const id = firstRun.find((r) => r.id !== null)!.id!
  ids.push(id)
  assert.equal(firstRun.filter((r) => r.id).length, 1)
  assert.equal((await repo.list(owner)).length, 1)
  assert.equal((await repo.list(stranger)).length, 0)
  await assert.rejects(repo.load(stranger, id), /not found/)
  await assert.rejects(repo.remove(stranger, id), /not found/)
  await assert.rejects(
    repo.setVisibility(stranger, id, 0, 'public'),
    /not found/
  )
  await assert.rejects(
    repo.submit(stranger, submission(id, 0), evaluate),
    /not found/
  )

  const request = submission(id, 0)
  const success = await repo.submit(owner, request, evaluate)
  assert.equal(success.operation.status, 'succeeded')
  assert.equal(success.assessment?.revision, 1)
  assert.deepEqual(await repo.submit(owner, request, evaluate), success)
  assert.equal(calls, 1)
  await assert.rejects(
    repo.submit(owner, { ...request, operation: { type: 'skip' } }, evaluate),
    /different input/
  )
  await assert.rejects(
    repo.submit(owner, submission(id, 0), evaluate),
    /changed/
  )
  assert.deepEqual(
    await repo.getOperation(owner, id, request.requestKey),
    success
  )

  const blocked = gate()
  const runningRequest = submission(id, 1)
  const pending = repo.submit(owner, runningRequest, blocked.evaluator)
  await blocked.started
  assert.equal((await repo.load(owner, id)).operation?.status, 'running')
  assert.equal(
    (await repo.submit(owner, runningRequest, evaluate)).operation.status,
    'running'
  )
  await assert.rejects(
    repo.submit(owner, submission(id, 1), evaluate),
    /still processing/
  )
  await assert.rejects(
    repo.setVisibility(owner, id, 1, 'public'),
    /still processing/
  )
  blocked.release()
  await pending
  assert.equal((await repo.load(owner, id)).assessment.revision, 2)

  const before = await repo.load(owner, id)
  const failedInput = submission(id, 2, {
    operation: { type: 'answer', text: 'Retain this failed submission' }
  })
  const failed = await repo.submit(owner, failedInput, async (state) => {
    state.draft = 'must not leak partial work'
    throw new Error('provider secret must not be recorded')
  })
  assert.equal(failed.operation.status, 'failed')
  assert.equal((await repo.load(owner, id)).operation?.action.type, 'answer')
  assert.deepEqual((await repo.load(owner, id)).assessment, before.assessment)
  assert.deepEqual(await repo.submit(owner, failedInput, evaluate), failed)
  const retry = await repo.submit(
    owner,
    { ...failedInput, requestKey: randomUUID(), retryOf: failed.operation.id },
    evaluate
  )
  assert.equal(retry.operation.status, 'succeeded')

  const expiredGate = gate()
  const interruptedInput = submission(id, 3)
  const late = repo.submit(owner, interruptedInput, expiredGate.evaluator)
  await expiredGate.started
  await pool.query(
    "UPDATE assessment_operations SET deadline=now()-interval '1 second' WHERE assessment_id=$1 AND status='running'",
    [id]
  )
  const interrupted = (await repo.load(owner, id)).operation!
  assert.equal(interrupted.status, 'interrupted')
  const replacement = await repo.submit(
    owner,
    { ...interruptedInput, requestKey: randomUUID(), retryOf: interrupted.id },
    evaluate
  )
  assert.equal(replacement.operation.status, 'succeeded')
  expiredGate.release()
  assert.equal((await late).operation.status, 'interrupted')
  assert.equal((await repo.load(owner, id)).assessment.revision, 4)

  const doomedId = await create()
  const doomedGate = gate()
  const doomed = repo.submit(
    owner,
    submission(doomedId, 0),
    doomedGate.evaluator
  )
  await doomedGate.started
  await repo.remove(owner, doomedId)
  doomedGate.release()
  await assert.rejects(doomed, /not found/)
  assert.equal(
    (await pool.query('SELECT id FROM assessments WHERE id=$1', [doomedId]))
      .rowCount,
    0
  )
  assert.equal(
    (
      await pool.query(
        'SELECT id FROM assessment_operations WHERE assessment_id=$1',
        [doomedId]
      )
    ).rowCount,
    0
  )
  const privateRecords = await pool.query(
    'SELECT diagnostics FROM assessment_operations WHERE assessment_id=$1',
    [id]
  )
  assert.ok(!JSON.stringify(privateRecords.rows).includes('provider secret'))
  console.log(
    'PASS: owner isolation, first-run race, durable idempotency, competing requests, atomic failure, explicit retry, expired/late writes, deletion during inference'
  )
} finally {
  await pool.query('DELETE FROM assessments WHERE id=ANY($1::uuid[])', [ids])
  await pool.query('DELETE FROM "user" WHERE id=ANY($1::text[])', [
    [owner, stranger]
  ])
  await pool.end()
}
