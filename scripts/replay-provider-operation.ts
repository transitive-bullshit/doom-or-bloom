// Read-only reconstruction; --send permits exactly one physical Jev request.
// Artifacts contain private participant text and must stay outside version control.
import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { parseArgs, parseEnv } from 'node:util'
import { resolve } from 'node:path'
import { Pool } from 'pg'
import { inspectionDatabaseUrl } from './inspection-env'
import {
  assessmentSchema,
  operationSchema,
  type Question
} from '../lib/assessment/schema'
import { loadBundle } from '../lib/content/loader'
import { runAssessment } from '../lib/server/engine'
import { createLiveProvider } from '../lib/server/live-provider'

const { values } = parseArgs({
  options: {
    target: { type: 'string' },
    operation: { type: 'string' },
    send: { type: 'boolean', default: false }
  }
})
assert.ok(
  values.target === 'local' || values.target === 'production',
  'Choose --target local|production'
)
assert.match(
  values.operation ?? '',
  /^[a-f0-9-]{36}$/,
  'Supply --operation UUID'
)
const directory = resolve(
  'work/diagnostics',
  values.operation!,
  new Date().toISOString().replaceAll(':', '-')
)
await mkdir(directory, { recursive: true, mode: 0o700 })
const save = (name: string, value: unknown) =>
  writeFile(resolve(directory, name), JSON.stringify(value, null, 2), {
    mode: 0o600
  })
const url = new URL(inspectionDatabaseUrl(values.target))
url.searchParams.set(
  'options',
  '-c default_transaction_read_only=on -c statement_timeout=15000'
)
const pool = new Pool({
  connectionString: url.toString(),
  max: 1,
  connectionTimeoutMillis: 10_000
})
const row = await pool
  .query(
    `select o.id, o.assessment_id, o.action, o.request_key, o.diagnostics,
     o.created_at, s.payload from assessment_operations o
   join assessment_snapshots s on s.id = o.base_snapshot_id
   where o.id = $1`,
    [values.operation]
  )
  .then((result) => result.rows[0])
  .finally(() => pool.end())
assert.ok(row, 'Operation not found')
const assessment = assessmentSchema.parse(row.payload)
const operation = operationSchema.parse(row.action)
let stage:
  | { state: unknown; questions: Record<string, Question>; name?: string }
  | undefined
const stop = new Error('Stop after reconstructing the first provider stage')
try {
  await runAssessment(
    { assessment, operation, requestId: row.request_key, debug: false },
    {
      kind: 'live',
      evaluate: async (state, questions, _signal, _budget, _debug, context) => {
        stage = { state, questions, name: context?.stage }
        throw stop
      }
    },
    loadBundle(assessment.versions.content)
  )
} catch (err) {
  if (err !== stop) throw err
}
assert.ok(stage, 'Operation has no provider stage')
const request = {
  state: stage.state,
  model: assessment.versions.model,
  questions: stage.questions
}
await save('request.json', request)
await save('source.json', {
  operationId: row.id,
  assessmentId: row.assessment_id,
  createdAt: row.created_at,
  diagnostics: row.diagnostics,
  stage: stage.name
})
console.log(
  JSON.stringify({
    directory,
    stage: stage.name,
    stateBytes: Buffer.byteLength(JSON.stringify(stage.state)),
    questionBytes: Buffer.byteLength(JSON.stringify(stage.questions)),
    questionCount: Object.keys(stage.questions).length,
    send: values.send
  })
)
if (values.send) {
  const env = parseEnv(
    await readFile(
      values.target === 'production'
        ? '.env.production.local'
        : '.env.development.local',
      'utf8'
    )
  )
  assert.ok(
    env.TYPESAFE_API_KEY?.trim(),
    'Selected environment has no TYPESAFE_API_KEY'
  )
  process.env.TYPESAFE_API_KEY = env.TYPESAFE_API_KEY
  const fetcher = globalThis.fetch
  let calls = 0
  globalThis.fetch = async (input, init) => {
    assert.equal(++calls, 1, 'Replay allows only one physical request')
    assert.equal(
      input instanceof Request ? input.url : input.toString(),
      'https://api.typesafe.ai/v1/systemone'
    )
    assert.equal(typeof init?.body, 'string', 'Expected serialized SDK JSON')
    const body = init!.body as string
    await writeFile(resolve(directory, 'wire-request.json'), body, {
      mode: 0o600
    })
    const started = performance.now()
    const response = await fetcher(input, init)
    const text = await response.clone().text()
    const headers = Object.fromEntries(
      [...response.headers].filter(([key]) =>
        /^(content-type|content-length|server|date|via|retry-after|x-typesafe-request-id|x-request-id|x-amzn-requestid|x-amz-cf-id|x-amz-cf-pop|x-cache|cf-ray|cf-mitigated|x-vercel-id)$/.test(
          key
        )
      )
    )
    await save('response.json', {
      status: response.status,
      statusText: response.statusText,
      headers,
      body: text,
      elapsedMs: Math.round(performance.now() - started)
    })
    console.log(
      JSON.stringify({
        status: response.status,
        headers,
        responseBytes: Buffer.byteLength(text),
        requestSha256: createHash('sha256').update(body).digest('hex')
      })
    )
    return response
  }
  try {
    await createLiveProvider(assessment.versions.model).evaluate(
      stage.state,
      stage.questions,
      AbortSignal.timeout(30_000),
      1,
      true,
      { stage: stage.name, requestId: row.request_key }
    )
  } catch (err) {
    const cause = err instanceof Error ? err.cause : undefined
    // Exact SDK error is restricted to the private local artifact, never console.
    const details: Record<string, unknown> = { type: 'transport_or_validation' }
    if (cause instanceof Error) {
      details.name = cause.constructor.name
      details.message = cause.message
      if ('body' in cause) details.body = cause.body
      if ('requestId' in cause) details.requestId = cause.requestId
    }
    await save('sdk-error.json', details)
  } finally {
    globalThis.fetch = fetcher
  }
}
