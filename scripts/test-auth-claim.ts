import assert from 'node:assert/strict'
import { randomUUID } from 'node:crypto'
import { drizzle } from 'drizzle-orm/node-postgres'
import { Pool } from 'pg'
import { createAuth } from '../lib/auth/config'
import * as schema from '../lib/db/auth-schema'
import { databaseUrl } from '../lib/db/config'
import { assessmentRepository } from '../lib/assessments/repository'

const connectionString = databaseUrl(process.env.TEST_DATABASE_URL)
assert.ok(new URL(connectionString).pathname.endsWith('_test'))
const pool = new Pool({ connectionString })
process.env.X_CLIENT_ID = 'fixture-client'
process.env.X_CLIENT_SECRET = 'fixture-secret'
const auth = createAuth(drizzle(pool), schema)
const repo = assessmentRepository(pool)
const origin = process.env.BETTER_AUTH_URL!
const identities = new Set<string>()
const assessmentIds: string[] = []
const faultName = `claim_fault_${randomUUID().replaceAll('-', '')}`
let faultInstalled = false
const cookies = new Map<string, string>()
function absorb(response: Response) {
  for (const cookie of response.headers.getSetCookie()) {
    const pair = cookie.split(';')[0]!
    const separator = pair.indexOf('=')
    cookies.set(pair.slice(0, separator), pair.slice(separator + 1))
  }
}
async function call(path: string, body?: unknown) {
  const response = await auth.handler(
    new Request(`${origin}/api/auth${path}`, {
      method: body === undefined ? 'GET' : 'POST',
      headers: {
        origin,
        cookie: [...cookies]
          .map(([key, value]) => `${key}=${value}`)
          .join('; '),
        'content-type': 'application/json'
      },
      body: body === undefined ? undefined : JSON.stringify(body)
    })
  )
  absorb(response)
  return response
}
const originalFetch = globalThis.fetch
const providerId = `test-x-${randomUUID()}`
globalThis.fetch = async (input) => {
  const url = String(input instanceof Request ? input.url : input)
  if (url.startsWith('https://api.x.com/2/oauth2/token'))
    return Response.json({
      access_token: 'fixture-token',
      token_type: 'bearer',
      expires_in: 7200,
      scope: 'users.read tweet.read'
    })
  if (url.startsWith('https://api.x.com/2/users/me'))
    return Response.json({
      data: { id: providerId, name: 'Claim fixture', username: 'claim_fixture' }
    })
  throw new Error('Unexpected external request in provider-mocked auth test')
}
let callbackPath = ''
async function login() {
  const started = await call('/sign-in/social', {
    provider: 'twitter',
    callbackURL: '/assessments'
  })
  assert.equal(started.status, 200)
  const authorization = new URL((await started.json()).url)
  assert.equal(authorization.searchParams.get('scope'), 'users.read tweet.read')
  assert.equal(
    authorization.searchParams.get('redirect_uri'),
    `${origin}/api/auth/callback/twitter`
  )
  callbackPath = `/callback/twitter?state=${encodeURIComponent(authorization.searchParams.get('state')!)}&code=fixture-code`
  return call(callbackPath)
}
try {
  const anonymous = await (await call('/sign-in/anonymous', {})).json()
  identities.add(anonymous.user.id)
  const assessment = await repo.create(
    anonymous.user.id,
    randomUUID(),
    'fixture'
  )
  assert.ok(assessment.id)
  assessmentIds.push(assessment.id)
  let release!: () => void
  let entered!: () => void
  const gate = new Promise<void>((resolve) => {
    release = resolve
  })
  const accepted = new Promise<void>((resolve) => {
    entered = resolve
  })
  const operation = repo.submit(
    anonymous.user.id,
    {
      assessmentId: assessment.id,
      expectedRevision: 0,
      requestKey: randomUUID(),
      operation: { type: 'stop' },
      debug: false
    },
    async (state, input) => {
      entered()
      await gate
      return {
        assessmentId: state.id,
        baseRevision: state.revision,
        requestId: input.requestKey,
        assessment: { ...state, revision: state.revision + 1 },
        provider: 'fixture'
      }
    }
  )
  await accepted
  const callback = await login()
  release()
  await operation
  assert.equal(callback.status, 302)
  const signedIn = await (await call('/get-session')).json()
  assert.ok(signedIn.user && !signedIn.user.isAnonymous)
  identities.add(signedIn.user.id)
  assert.equal((await repo.list(signedIn.user.id)).length, 1)
  assert.equal(
    (await repo.load(signedIn.user.id, assessment.id)).assessment.revision,
    1
  )
  await assert.rejects(repo.load(anonymous.user.id, assessment.id), /not found/)
  assert.equal(
    (await repo.load(signedIn.user.id, assessment.id)).assessment.id,
    assessment.id
  )
  assert.equal(
    (await pool.query('SELECT id FROM "user" WHERE id=$1', [anonymous.user.id]))
      .rowCount,
    0
  )
  const repeated = await call(callbackPath)
  assert.equal(repeated.status, 302)
  assert.match(repeated.headers.get('location') ?? '', /error=/)
  assert.equal((await repo.list(signedIn.user.id)).length, 1)
  await call('/sign-out', {})
  assert.equal(await (await call('/get-session')).json(), null)
  cookies.clear()
  await login()
  const recovered = await (await call('/get-session')).json()
  assert.equal(recovered.user.id, signedIn.user.id)
  assert.equal((await repo.list(recovered.user.id))[0]!.id, assessment.id)
  await call('/sign-out', {})
  const anotherAnonymous = await (await call('/sign-in/anonymous', {})).json()
  identities.add(anotherAnonymous.user.id)
  const anotherAssessment = await repo.create(
    anotherAnonymous.user.id,
    randomUUID(),
    'fixture'
  )
  assert.ok(anotherAssessment.id)
  assessmentIds.push(anotherAssessment.id)
  await pool.query(
    `CREATE FUNCTION ${faultName}() RETURNS trigger LANGUAGE plpgsql AS $$ BEGIN IF OLD.owner_id = '${anotherAnonymous.user.id}' THEN RAISE EXCEPTION 'Injected claim failure'; END IF; RETURN NEW; END $$`
  )
  await pool.query(
    `CREATE TRIGGER ${faultName} BEFORE UPDATE OF owner_id ON assessments FOR EACH ROW EXECUTE FUNCTION ${faultName}()`
  )
  faultInstalled = true
  const failedCallback = await login()
  assert.equal(failedCallback.status, 302)
  assert.equal(
    failedCallback.headers.get('location'),
    `${origin}/assessments?authError=claim`
  )
  assert.equal(failedCallback.headers.get('set-cookie'), null)
  const stillAnonymous = await (await call('/get-session')).json()
  assert.equal(stillAnonymous.user.id, anotherAnonymous.user.id)
  assert.equal(
    (await repo.load(anotherAnonymous.user.id, anotherAssessment.id)).assessment
      .id,
    anotherAssessment.id
  )
  await pool.query(`DROP TRIGGER ${faultName} ON assessments`)
  await pool.query(`DROP FUNCTION ${faultName}()`)
  faultInstalled = false
  await login()
  const merged = await (await call('/get-session')).json()
  assert.equal(merged.user.id, signedIn.user.id)
  assert.equal((await repo.list(merged.user.id)).length, 2)
  console.log(
    'Provider-mocked X callback, anonymous claim, sign-out and cross-browser recovery passed'
  )
} finally {
  globalThis.fetch = originalFetch
  if (faultInstalled) {
    await pool.query(`DROP TRIGGER IF EXISTS ${faultName} ON assessments`)
    await pool.query(`DROP FUNCTION IF EXISTS ${faultName}()`)
  }
  for (const id of assessmentIds)
    await pool.query('DELETE FROM assessments WHERE id=$1', [id])
  for (const id of identities)
    await pool.query('DELETE FROM "user" WHERE id=$1', [id])
  await pool.end()
}
