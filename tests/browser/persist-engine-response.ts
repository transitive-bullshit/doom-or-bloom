import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { Pool } from 'pg'
import { databaseUrl } from '../../lib/db/config'
import { submitSchema } from '../../lib/assessments/contracts'
import { assessmentRepository } from '../../lib/assessments/repository'
import {
  assessmentSchema,
  type AssessmentResponse
} from '../../lib/assessment/schema'

const connectionString = databaseUrl(process.env.TEST_DATABASE_URL)
assert.ok(new URL(connectionString).pathname.endsWith('_test'))
const pool = new Pool({ connectionString })
try {
  const input = JSON.parse(readFileSync(0, 'utf8'))
  const submission = submitSchema.parse(input.submission)
  const response = input.response as AssessmentResponse
  response.assessment = assessmentSchema.parse(response.assessment)
  const outcome = await assessmentRepository(pool).submit(
    input.ownerId,
    submission,
    async () => response,
    undefined,
    input.draft ? assessmentSchema.parse(input.draft) : undefined
  )
  assert.equal(outcome.operation.status, 'succeeded')
  process.stdout.write(JSON.stringify(outcome))
} finally {
  await pool.end()
}
