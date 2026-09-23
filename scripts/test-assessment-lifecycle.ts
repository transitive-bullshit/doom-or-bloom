import assert from 'node:assert/strict'
import { randomUUID } from 'node:crypto'
import { Pool } from 'pg'
import {
  assessmentRepository,
  type Evaluator
} from '../lib/assessments/repository'
import { publicAssessment } from '../lib/assessments/public'
import { baseResult } from '../lib/assessment/projections'
import { loadBundle } from '../lib/content/loader'
import { versions, type Assessment } from '../lib/assessment/schema'
import { atCap, promptLimit } from '../lib/assessment/state'
import { databaseUrl } from '../lib/db/config'
const connectionString = databaseUrl(process.env.TEST_DATABASE_URL)
assert.ok(new URL(connectionString).pathname.endsWith('_test'))
const pool = new Pool({ connectionString })
const repo = assessmentRepository(pool)
const owner = randomUUID(),
  stranger = randomUUID()
const ids: string[] = []
const projectTo =
  (count: number): Evaluator =>
  async (state, input) => {
    const next: Assessment = {
      ...state,
      revision: state.revision + 1,
      status: 'results',
      prompts: Array.from(
        { length: count },
        (_, i) =>
          state.prompts[i] ?? {
            ...state.prompts[0]!,
            id: `${state.id}:p${i + 1}`,
            ordinal: i + 1
          }
      )
    }
    next.result = baseResult(next, [], loadBundle().rubric, atCap(next))
    return {
      assessment: next,
      assessmentId: next.id,
      requestId: input.requestKey,
      baseRevision: state.revision,
      provider: 'fixture'
    }
  }
async function project(id: string, count: number) {
  return repo.submit(
    owner,
    {
      assessmentId: id,
      expectedRevision: 0,
      requestKey: randomUUID(),
      operation: { type: 'project' },
      debug: false
    },
    projectTo(count)
  )
}
try {
  for (const id of [owner, stranger])
    await pool.query(
      'INSERT INTO "user" (id,name,email) VALUES ($1,\'Lifecycle test\',$2)',
      [id, `${id}@test.invalid`]
    )
  const created = await repo.create(owner, randomUUID(), versions.model)
  const id = created.id!
  ids.push(id)
  await assert.rejects(repo.fork(owner, id, randomUUID()), /completed/)
  await assert.rejects(repo.publicLoad(id), /not found/)
  await project(id, 12)
  await repo.setVisibility(owner, id, 1, 'public')
  const published = await repo.publicLoad(id)
  assert.equal(published.kind, 'participant')
  if (published.kind !== 'participant') throw new Error('Expected participant')
  assert.equal(published.assessment.prompts.length, 12)
  assert.equal('ownerId' in published, false)
  assert.equal('draft' in published.assessment, false)
  const key = randomUUID()
  await assert.rejects(repo.fork(stranger, id, key), /not found/)
  const fork = await repo.fork(owner, id, key)
  ids.push(fork.id)
  assert.deepEqual(await repo.fork(owner, id, key), fork)
  const first = await repo.load(owner, fork.id)
  assert.equal(promptLimit(first.assessment), 24)
  assert.equal(first.lifecycle, 'open')
  assert.equal(first.visibility, 'private')
  assert.equal(first.inheritedPromptCount, 12)
  assert.deepEqual(first.assessment.prompts, published.assessment.prompts)
  assert.deepEqual(first.assessment.result, published.assessment.result)
  await repo.setVisibility(owner, id, 1, 'private')
  await assert.rejects(repo.publicLoad(id), /not found/)
  assert.equal((await repo.load(owner, fork.id)).assessment.prompts.length, 12)
  await repo.remove(owner, id)
  const lineage = (
    await pool.query(
      'SELECT is_fork, source_assessment_id, source_snapshot_id FROM assessments WHERE id=$1',
      [fork.id]
    )
  ).rows[0]
  assert.deepEqual(lineage, {
    is_fork: true,
    source_assessment_id: null,
    source_snapshot_id: null
  })
  await project(fork.id, 24)
  await repo.setVisibility(owner, fork.id, 1, 'public')
  const second = await repo.fork(owner, fork.id, randomUUID())
  ids.push(second.id)
  assert.equal(promptLimit((await repo.load(owner, second.id)).assessment), 30)
  await project(second.id, 30)
  await repo.setVisibility(owner, second.id, 1, 'public')
  await assert.rejects(
    repo.fork(owner, second.id, randomUUID()),
    /30 questions/
  )
  const leaked = publicAssessment({
    ...(await repo.load(owner, second.id)).assessment,
    draft: 'PRIVATE_DRAFT',
    eventMarkers: ['PRIVATE_EVENT']
  })
  assert.ok(!JSON.stringify(leaked).includes('PRIVATE_'))
  console.log(
    'PASS: 12 → 24 → 30 budgets, owner-only completed forks, idempotent creation, independent history/lineage after deletion, publication/revocation and public field allowlist'
  )
} finally {
  await pool.query('DELETE FROM assessments WHERE id=ANY($1::uuid[])', [ids])
  await pool.query('DELETE FROM "user" WHERE id=ANY($1::text[])', [
    [owner, stranger]
  ])
  await pool.end()
}
