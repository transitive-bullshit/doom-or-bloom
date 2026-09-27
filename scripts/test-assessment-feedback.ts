import assert from 'node:assert/strict'
import { randomUUID } from 'node:crypto'
import { Pool } from 'pg'
import {
  assessmentRepository,
  type Evaluator
} from '../lib/assessments/repository'
import { feedbackRepository } from '../lib/assessments/feedback-repository'
import type { FeedbackRequest } from '../lib/assessments/feedback'
import {
  versions,
  type Assessment,
  type Component,
  type Result
} from '../lib/assessment/schema'
import { databaseUrl } from '../lib/db/config'

const connectionString = databaseUrl(process.env.TEST_DATABASE_URL)
assert.ok(new URL(connectionString).pathname.endsWith('_test'))
// The route handlers below use the application pool; keep it on the test database.
process.env.DATABASE_URL = connectionString
const pool = new Pool({ connectionString })
const repo = assessmentRepository(pool)
const feedback = feedbackRepository(pool)
const owner = randomUUID(),
  stranger = randomUUID()
const users = [owner, stranger]
const ids: string[] = []

const component = (vector: string, value: number | null): Component => ({
  vector,
  label: vector,
  value,
  range: [0, 1],
  distribution: {},
  confidence: null,
  evidenceIds: [],
  claim: null
})
function result(
  state: Assessment,
  x: number | null,
  y: number | null,
  experimentRevision: number
): Result {
  return {
    evidenceRevision: state.evidenceRevision,
    versions: state.versions,
    horizontal: component('outlook', x),
    vertical: component('epistemic', null),
    experiment: {
      version: 'worldview-v8',
      model: state.versions.model,
      generatedAt: new Date().toISOString(),
      evidenceRevision: experimentRevision,
      influence: component('influence', null),
      transformation: component('transformation', y),
      axisEvidence: { influence: null, transformation: null },
      pdoom: null,
      milestones: [],
      hinges: []
    },
    components: [],
    findings: [],
    resources: [],
    fingerprint: [],
    sources: [],
    provisional: false,
    capped: false,
    insufficient: x === null || y === null,
    reason: 'Synthetic feedback test result'
  }
}
// Commits a result for the given evidence revision without inference.
async function showResult(
  ownerId: string,
  id: string,
  expectedRevision: number,
  evidenceRevision: number,
  [x, y]: [number | null, number | null],
  experimentRevision = evidenceRevision
) {
  const evaluate: Evaluator = async (state, input) => {
    const next: Assessment = {
      ...state,
      revision: state.revision + 1,
      evidenceRevision,
      status: 'results'
    }
    next.result = result(next, x, y, experimentRevision)
    return {
      assessment: next,
      assessmentId: next.id,
      requestId: input.requestKey,
      baseRevision: state.revision,
      provider: 'fixture'
    }
  }
  const outcome = await repo.submit(
    ownerId,
    {
      assessmentId: id,
      expectedRevision,
      requestKey: randomUUID(),
      operation: { type: 'project' },
      debug: false
    },
    evaluate
  )
  assert.equal(outcome.operation.status, 'succeeded')
}
async function create(ownerId: string) {
  const { id } = await repo.create(ownerId, randomUUID(), versions.model)
  assert.ok(id)
  ids.push(id)
  return id
}
const placement = (
  evidenceRevision: number,
  x: number,
  y: number
): FeedbackRequest => ({
  kind: 'self_placement',
  evidenceRevision,
  guess: { x, y }
})
const rows = async (id: string) =>
  (
    await pool.query(
      'SELECT f.kind, f.evidence_revision, f.snapshot_id, f.algorithm_version, a.current_snapshot_id FROM assessment_feedback f JOIN assessments a ON a.id = f.assessment_id WHERE f.assessment_id=$1 ORDER BY f.created_at, f.id',
      [id]
    )
  ).rows

try {
  for (const id of users)
    await pool.query(
      'INSERT INTO "user" (id,name,email) VALUES ($1,\'Feedback test\',$2)',
      [id, `${id}@test.invalid`]
    )
  const id = await create(owner)
  await assert.rejects(feedback.record(owner, id, placement(0, 0.1, 0.9)), {
    status: 409,
    message: /not ready/
  })
  assert.deepEqual(await feedback.list(owner, id), [])
  await showResult(owner, id, 0, 1, [0.3, 0.6])

  // Ownership follows the assessment: strangers see the same not-found error.
  await assert.rejects(feedback.list(stranger, id), {
    status: 404,
    code: 'not_found'
  })
  await assert.rejects(feedback.record(stranger, id, placement(1, 0.5, 0.5)), {
    status: 404,
    code: 'not_found'
  })
  await assert.rejects(feedback.list(owner, randomUUID()), /not found/)
  // Feedback must describe the result that is currently stored.
  for (const revision of [0, 2])
    await assert.rejects(
      feedback.record(owner, id, placement(revision, 0.5, 0.5)),
      { status: 409, message: /changed/ }
    )
  assert.equal((await rows(id)).length, 0)

  const first = await feedback.record(owner, id, placement(1, 0.2, 0.8))
  assert.deepEqual(first.payload, {
    guess: { x: 0.2, y: 0.8 },
    placed: { x: 0.3, y: 0.6 }
  })
  assert.deepEqual(
    await feedback.record(owner, id, placement(1, 0.9, 0.1)),
    first
  )
  const kept = await rows(id)
  assert.equal(kept.length, 1)
  const [stored] = kept
  assert.equal(stored.snapshot_id, stored.current_snapshot_id)
  assert.equal(stored.algorithm_version, versions.assessment)

  const disagreed = await feedback.record(owner, id, {
    kind: 'agreement',
    evidenceRevision: 1,
    rating: 'not_quite',
    aspects: ['outlook_too_doom', 'pdoom_too_high'],
    comment: 'Too gloomy about jobs'
  })
  // Agreement records what was displayed, computed on the server.
  const shown = { x: 0.3, y: 0.6, pdoom: null, pdoomLabel: null }
  assert.deepEqual(disagreed.payload, {
    rating: 'not_quite',
    aspects: ['outlook_too_doom', 'pdoom_too_high'],
    comment: 'Too gloomy about jobs',
    shown
  })
  const agreed = await feedback.record(owner, id, {
    kind: 'agreement',
    evidenceRevision: 1,
    rating: 'yes',
    aspects: []
  })
  assert.deepEqual(agreed.payload, { rating: 'yes', aspects: [], shown })
  assert.equal(agreed.createdAt, disagreed.createdAt)
  assert.ok(agreed.updatedAt >= disagreed.updatedAt)
  assert.deepEqual(await feedback.list(owner, id), [first, agreed])

  // A later result is a new revision. Its stale experiment leaves y unplaced,
  // and concurrent first guesses still keep exactly one.
  await showResult(owner, id, 1, 2, [0.4, 0.5], 1)
  await assert.rejects(
    feedback.record(owner, id, {
      kind: 'agreement',
      evidenceRevision: 1,
      rating: 'yes',
      aspects: []
    }),
    /changed/
  )
  const racing = await Promise.all([
    feedback.record(owner, id, placement(2, 0.1, 0.1)),
    feedback.record(owner, id, placement(2, 0.9, 0.9))
  ])
  assert.deepEqual(racing[0], racing[1])
  assert.equal(racing[0].kind, 'self_placement')
  assert.deepEqual(
    racing[0].kind === 'self_placement' && racing[0].payload.placed,
    { x: 0.4, y: null }
  )
  assert.deepEqual(
    (await rows(id)).map((row) => [row.kind, row.evidence_revision]),
    [
      ['self_placement', 1],
      ['agreement', 1],
      ['self_placement', 2]
    ]
  )

  // Owners keep their private feedback on a published assessment.
  await repo.setVisibility(owner, id, 2, 'public')
  await feedback.record(owner, id, {
    kind: 'agreement',
    evidenceRevision: 2,
    rating: 'not_quite',
    aspects: []
  })
  await assert.rejects(feedback.list(stranger, id), /not found/)

  const other = await create(owner)
  const otherSnapshot = (
    await pool.query(
      'SELECT current_snapshot_id FROM assessments WHERE id=$1',
      [other]
    )
  ).rows[0].current_snapshot_id
  const insert = (kind: string, revision: number, snapshot: string) =>
    pool.query(
      `INSERT INTO assessment_feedback (assessment_id,kind,evidence_revision,snapshot_id,algorithm_version,payload) VALUES ($1,$2,$3,$4,'test','{}')`,
      [id, kind, revision, snapshot]
    )
  await assert.rejects(
    insert('rating', 5, stored.current_snapshot_id),
    /feedback_kind/
  )
  await assert.rejects(
    insert('agreement', -1, stored.current_snapshot_id),
    /feedback_revision_nonnegative/
  )
  await assert.rejects(
    insert('agreement', 5, otherSnapshot),
    /feedback_snapshot/
  )
  await assert.rejects(
    insert('self_placement', 1, stored.current_snapshot_id),
    /feedback_kind_revision/
  )

  await repo.remove(owner, id)
  assert.equal(
    (
      await pool.query(
        'SELECT id FROM assessment_feedback WHERE assessment_id=$1',
        [id]
      )
    ).rowCount,
    0
  )

  // The owner-only route derives identity from the session and returns
  // controlled errors.
  const { GET, POST } =
    await import('../app/api/assessments/[id]/feedback/route')
  const { getAuth } = await import('../lib/auth/server')
  const { getPool } = await import('../lib/db')
  try {
    const origin = process.env.BETTER_AUTH_URL!
    const signIn = async () => {
      const response = await getAuth().handler(
        new Request(`${origin}/api/auth/sign-in/anonymous`, {
          method: 'POST',
          headers: { origin, 'content-type': 'application/json' },
          body: '{}'
        })
      )
      assert.equal(response.status, 200)
      const { user } = await response.json()
      users.push(user.id)
      return {
        id: user.id as string,
        cookie: response.headers
          .getSetCookie()
          .map((cookie) => cookie.split(';')[0])
          .join('; ')
      }
    }
    // A request without a body reads feedback; one with a body records it.
    const call = async (
      assessmentId: string,
      cookie: string,
      body?: unknown,
      requestOrigin = origin
    ) => {
      const url = `${origin}/api/assessments/${assessmentId}/feedback`
      const headers = {
        origin: requestOrigin,
        cookie,
        'content-type': 'application/json'
      }
      const context = { params: Promise.resolve({ id: assessmentId }) }
      const response =
        body === undefined
          ? await GET(new Request(url, { headers }), context)
          : await POST(
              new Request(url, {
                method: 'POST',
                headers,
                body: JSON.stringify(body)
              }),
              context
            )
      assert.equal(response.headers.get('cache-control'), 'private, no-store')
      return { status: response.status, body: await response.json() }
    }
    const { id: participantOwner, cookie } = await signIn()
    const participant = await create(participantOwner)
    await showResult(participantOwner, participant, 0, 0, [0.7, 0.2])
    const guess = placement(0, 0.6, 0.3)
    assert.equal((await call(participant, '')).status, 401)
    assert.deepEqual(
      (await call(participant, cookie, guess, 'https://example.com')).body.code,
      'origin'
    )
    assert.deepEqual(
      await call(participant, cookie, {
        kind: 'agreement',
        evidenceRevision: 0,
        rating: 'yes',
        aspects: ['other']
      }),
      {
        status: 400,
        body: {
          code: 'invalid_input',
          error: 'Something went wrong. Refresh the page and try again.'
        }
      }
    )
    const created = await call(participant, cookie, guess)
    assert.equal(created.status, 200)
    assert.deepEqual(created.body.feedback, {
      kind: 'self_placement',
      evidenceRevision: 0,
      payload: { guess: { x: 0.6, y: 0.3 }, placed: { x: 0.7, y: 0.2 } },
      createdAt: created.body.feedback.createdAt,
      updatedAt: created.body.feedback.createdAt
    })
    const stale = await call(participant, cookie, placement(1, 0, 0))
    assert.deepEqual([stale.status, stale.body.code], [409, 'conflict'])
    assert.deepEqual(await call(participant, cookie), {
      status: 200,
      body: { feedback: [created.body.feedback] }
    })
    const intruder = await signIn()
    for (const body of [undefined, guess])
      assert.deepEqual(
        (await call(participant, intruder.cookie, body)).body.code,
        'not_found'
      )
  } finally {
    await getPool().end()
  }
  console.log(
    'PASS: owner-only feedback reads/writes, current-revision checks, first guess wins (including concurrent guesses), agreement upsert, placed point from the stored result, snapshot/kind/revision constraints, cascade deletion, and route status/privacy contract'
  )
} finally {
  await pool.query('DELETE FROM assessments WHERE id=ANY($1::uuid[])', [ids])
  await pool.query('DELETE FROM "user" WHERE id=ANY($1::text[])', [users])
  await pool.end()
}
