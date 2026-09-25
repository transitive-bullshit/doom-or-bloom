import { createLocalJourneyStore } from '../lib/journeys/local-store'
import assert from 'node:assert/strict'
import { randomUUID } from 'node:crypto'
import { Pool } from 'pg'
import { people } from '../components/landing/people'
import { databaseUrl } from '../lib/db/config'
import { personaGeneration } from '../lib/personas/generation'
import { createAssessment } from '../lib/assessment/state'
import { seedPersonas } from '../lib/personas/seed'
import { personaRepository } from '../lib/personas/repository'
import { historicalPayload } from '../lib/personas/payload'
import { suiteSchema } from '../lib/journeys/schema'
import { assessmentRepository } from '../lib/assessments/repository'

const connectionString = databaseUrl(process.env.TEST_DATABASE_URL)
assert.ok(new URL(connectionString).pathname.endsWith('_test'))
const pool = new Pool({ connectionString })
const repo = personaRepository(pool)
let testPersona: string | undefined
try {
  const first = await seedPersonas(pool)
  assert.equal(first.length, people.length)
  assert.deepEqual(await seedPersonas(pool), first)
  const suite = suiteSchema.parse(
    await createLocalJourneyStore(process.cwd()).latest()
  )
  const selected = await repo.selected()
  assert.deepEqual(
    new Set(selected.map((row) => row.metadata.id)),
    new Set(people.map((person) => person.id))
  )
  assert.equal(
    selected.filter((row) => row.persona.featured).length,
    people.filter((person) => person.featured).length
  )
  assert.equal(
    selected.filter((row) => !row.persona.featured).length,
    people.filter((person) => !person.featured).length
  )
  assert.deepEqual(
    await repo.selectedSlugs(),
    selected
      .map((row) => ({ username: row.persona.slug }))
      .sort((a, b) => a.username.localeCompare(b.username))
  )
  for (const row of [
    selected[0]!,
    selected.find((row) => !row.persona.featured)!
  ]) {
    assert.deepEqual(await repo.selectedBySlug(row.persona.slug), row)
  }
  assert.equal(await repo.selectedBySlug('no-such-simulated-user'), null)
  for (const row of selected) {
    assert.equal(
      row.persona.featured,
      people.find((person) => person.id === row.metadata.id)!.featured
    )
    const original = suite.journeys.find(
      (journey) => journey.personaId === row.metadata.id
    )!
    assert.deepEqual(row.payload, historicalPayload(suite, original))
    assert.deepEqual(row.payload.journey.result, original.result)
    assert.deepEqual(
      row.payload.journey.personaSnapshot,
      original.personaSnapshot
    )
    assert.ok(!('participantExchanges' in row.payload.journey))
    assert.ok(row.payload.journey.steps.every((step) => !('trace' in step)))
    assert.deepEqual(
      row.payload.journey.steps,
      original.steps.map(({ trace: _trace, ...step }) => step)
    )
  }
  const source = selected[0]!
  const testId = `persona-test-${randomUUID()}`
  testPersona = await repo.upsertProfile(
    { ...source.metadata, id: testId, slug: testId },
    source.persona.sourceBrief
  )
  const old = structuredClone(source.payload)
  old.journey.personaId = testId
  old.provenance.createdAt = '2026-01-01T00:00:00.000Z'
  old.provenance.runId = `${testId}-old`
  const oldId = await repo.publish(testPersona, old.provenance.runId, old)
  assert.equal(
    await repo.publish(testPersona, old.provenance.runId, old),
    oldId
  )
  const next = structuredClone(old)
  next.provenance.createdAt = '2026-02-01T00:00:00.000Z'
  next.provenance.runId = `${testId}-new`
  const newId = await repo.publish(testPersona, next.provenance.runId, next)
  const late = structuredClone(old)
  late.provenance.createdAt = '2026-01-15T00:00:00.000Z'
  late.provenance.runId = `${testId}-late`
  await repo.publish(testPersona, late.provenance.runId, late)
  await repo.publish(testPersona, old.provenance.runId, old)
  assert.equal(
    (await repo.selected()).find((row) => row.persona.id === testPersona)!
      .assessmentId,
    newId
  )
  await assert.rejects(
    repo.publish(testPersona, old.provenance.runId, next),
    /Immutable simulation provenance/
  )
  const failed = structuredClone(next)
  failed.journey.error = 'Simulated generation failure'
  await assert.rejects(
    repo.publish(testPersona, `${testId}-failed`, failed),
    /Only successful simulations/
  )
  assert.equal(
    (await repo.selected()).find((row) => row.persona.id === testPersona)!
      .assessmentId,
    newId
  )
  const oldPublic = await assessmentRepository(pool).publicLoad(oldId)
  assert.equal(oldPublic?.kind, 'simulation')
  if (oldPublic?.kind === 'simulation')
    assert.deepEqual(oldPublic.simulation, old)
  const changed = structuredClone(old)
  changed.journey.personaId = 'unrelated-persona'
  await assert.rejects(
    repo.publish(testPersona, `${testId}-wrong-owner`, changed),
    /another persona/
  )
  const generations = personaGeneration(pool)
  const provenance = {
    ...next.provenance,
    runId: `${testId}-live`,
    createdAt: '2026-03-01T00:00:00.000Z'
  }
  const run = await generations.begin(testPersona, provenance, {
    fixture: true
  })
  assert.equal(run.execute, true)
  assert.deepEqual(
    await generations.begin(testPersona, provenance, { fixture: true }),
    { id: run.id, execute: false }
  )
  await assert.rejects(
    generations.begin(testPersona, provenance, { fixture: false }),
    /different input/
  )
  await assert.rejects(
    assessmentRepository(pool).publicLoad(run.id),
    /Assessment not found/
  )
  const generated = structuredClone(next.journey)
  generated.finalAssessment = {
    ...createAssessment(randomUUID()),
    result: generated.result,
    evidenceRevision: generated.result!.evidenceRevision,
    versions: generated.result!.versions
  }
  await assert.rejects(
    generations.finish(run.id, { ...provenance, runId: 'wrong' }, generated),
    /provenance/
  )
  await generations.finish(run.id, provenance, generated)
  await generations.finish(run.id, provenance, generated)
  const fullPublic = await assessmentRepository(pool).publicLoad(run.id)
  assert.equal(fullPublic?.kind, 'simulation')
  if (fullPublic?.kind === 'simulation') {
    assert.equal(fullPublic.simulation.kind, 'simulation_v1')
    if (fullPublic.simulation.kind === 'simulation_v1')
      assert.deepEqual(
        fullPublic.simulation.assessment,
        generated.finalAssessment
      )
  }
  const olderProvenance = {
    ...provenance,
    runId: `${testId}-older-live`,
    createdAt: '2026-02-15T00:00:00.000Z'
  }
  const olderRun = await generations.begin(testPersona, olderProvenance, {})
  await generations.finish(olderRun.id, olderProvenance, generated)
  assert.equal(
    (await repo.selected()).find((row) => row.persona.id === testPersona)!
      .assessmentId,
    run.id
  )
  const failureProvenance = {
    ...provenance,
    runId: `${testId}-failure-live`,
    createdAt: '2026-04-01T00:00:00.000Z'
  }
  const failureRun = await generations.begin(testPersona, failureProvenance, {})
  await generations.finish(failureRun.id, failureProvenance, {
    ...generated,
    error: 'Fixture error',
    pendingAnswer: 'Retained submitted text'
  })
  const failureOperation = (
    await pool.query(
      'SELECT status, diagnostics FROM assessment_operations WHERE assessment_id = $1',
      [failureRun.id]
    )
  ).rows[0]
  assert.equal(failureOperation.status, 'failed')
  assert.equal(
    failureOperation.diagnostics.pendingAnswer,
    'Retained submitted text'
  )
  await assert.rejects(
    assessmentRepository(pool).publicLoad(failureRun.id),
    /Assessment not found/
  )
  assert.equal(
    (await repo.selected()).find((row) => row.persona.id === testPersona)!
      .assessmentId,
    run.id
  )
  const expiredProvenance = { ...provenance, runId: `${testId}-expired-live` }
  const expiredRun = await generations.begin(testPersona, expiredProvenance, {})
  await pool.query(
    "UPDATE assessment_operations SET deadline = now() - interval '1 second' WHERE assessment_id = $1",
    [expiredRun.id]
  )
  await generations.finish(expiredRun.id, expiredProvenance, generated)
  await assert.rejects(
    assessmentRepository(pool).publicLoad(expiredRun.id),
    /Assessment not found/
  )
  assert.equal(
    (
      await pool.query(
        'SELECT status FROM assessment_operations WHERE assessment_id = $1',
        [expiredRun.id]
      )
    ).rows[0].status,
    'interrupted'
  )
  console.log(
    'Persona persistence passed: exact curated import, idempotency, provenance conflicts, publication validation, ordering fence, stable old URLs'
  )
} finally {
  if (testPersona) {
    await pool.query(
      'UPDATE personas SET selected_assessment_id = NULL WHERE id = $1',
      [testPersona]
    )
    await pool.query('DELETE FROM assessments WHERE persona_id = $1', [
      testPersona
    ])
    await pool.query('DELETE FROM personas WHERE id = $1', [testPersona])
  }
  await pool.end()
}
