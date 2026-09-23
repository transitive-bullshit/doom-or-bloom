import assert from 'node:assert/strict'
import { randomUUID } from 'node:crypto'
import { readFileSync } from 'node:fs'
import { Pool } from 'pg'
import { databaseUrl } from '../../lib/db/config'
import { assessmentSchema } from '../../lib/assessment/schema'
import { fingerprint } from '../../lib/assessments/repository'
const connectionString = databaseUrl(process.env.TEST_DATABASE_URL)
assert.ok(new URL(connectionString).pathname.endsWith('_test'))
const pool = new Pool({ connectionString })
try {
  const input = JSON.parse(readFileSync(0, 'utf8'))
  const state = assessmentSchema.parse({
    ...input.assessment,
    id: randomUUID(),
    draft: ''
  })
  const snapshotId = randomUUID()
  const client = await pool.connect()
  try {
    await client.query('BEGIN')
    await client.query(
      'INSERT INTO assessments (id,owner_id,current_snapshot_id,revision,versions,create_request_key,create_fingerprint,prompt_ceiling) VALUES ($1,$2,$3,$4,$5,$6,$7,$8)',
      [
        state.id,
        input.ownerId,
        snapshotId,
        state.revision,
        JSON.stringify(state.versions),
        randomUUID(),
        fingerprint(state),
        state.promptCeiling ?? 12
      ]
    )
    await client.query(
      "INSERT INTO assessment_snapshots (id,assessment_id,revision,format,payload,digest,evidence_revision,has_result) VALUES ($1,$2,$3,'assessment_v1',$4,$5,$6,$7)",
      [
        snapshotId,
        state.id,
        state.revision,
        JSON.stringify(state),
        fingerprint(state),
        state.evidenceRevision,
        Boolean(state.result)
      ]
    )
    await client.query('COMMIT')
  } catch (err) {
    await client.query('ROLLBACK')
    throw err
  } finally {
    client.release()
  }
  process.stdout.write(JSON.stringify({ id: state.id }))
} finally {
  await pool.end()
}
