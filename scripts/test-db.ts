import assert from 'node:assert/strict'
import { randomUUID } from 'node:crypto'
import { drizzle } from 'drizzle-orm/node-postgres'
import { Pool } from 'pg'
import { hasTrustedOrigin } from '../lib/auth/origin'
import { createAuth } from '../lib/auth/config'
import * as schema from '../lib/db/auth-schema'
import { databaseUrl } from '../lib/db/config'

const connectionString = databaseUrl(process.env.TEST_DATABASE_URL)
assert.ok(new URL(connectionString).pathname.endsWith('_test'))
const pool = new Pool({ connectionString })
const auth = createAuth(drizzle(pool), schema)
const origin = process.env.BETTER_AUTH_URL!
const owners: string[] = []
async function signIn() {
  const response = await auth.handler(
    new Request(`${origin}/api/auth/sign-in/anonymous`, {
      method: 'POST',
      headers: { origin, 'content-type': 'application/json' },
      body: '{}'
    })
  )
  assert.equal(response.status, 200)
  const data = await response.json()
  owners.push(data.user.id)
  const cookieHeader = response.headers.get('set-cookie')!
  assert.match(cookieHeader, /HttpOnly/i)
  assert.match(cookieHeader, /SameSite=Lax/i)
  const cookie = cookieHeader.split(';')[0]!
  return { id: data.user.id as string, cookie }
}
try {
  const first = await signIn()
  const second = await signIn()
  assert.notEqual(first.id, second.id)
  assert.equal(await auth.api.getSession({ headers: new Headers() }), null)
  assert.equal(
    await auth.api.getSession({
      headers: new Headers({ cookie: 'better-auth.session_token=forged' })
    }),
    null
  )
  assert.equal(
    (
      await auth.api.getSession({
        headers: new Headers({ cookie: first.cookie })
      })
    )?.user.id,
    first.id
  )
  const rejected = await auth.handler(
    new Request(`${origin}/api/auth/sign-in/anonymous`, {
      method: 'POST',
      headers: {
        origin: 'https://untrusted.example',
        cookie: first.cookie,
        'content-type': 'application/json'
      },
      body: '{}'
    })
  )
  assert.equal(rejected.status, 403)
  assert.equal(
    hasTrustedOrigin(
      new Request(origin, { headers: { origin: 'https://untrusted.example' } })
    ),
    false
  )
  assert.equal(hasTrustedOrigin(new Request(origin)), false)
  assert.equal(
    hasTrustedOrigin(new Request(origin, { headers: { origin } })),
    true
  )
  const lifetime = await pool.query(
    'SELECT extract(epoch from (expires_at - created_at)) AS seconds FROM session WHERE user_id=$1',
    [first.id]
  )
  assert.ok(Number(lifetime.rows[0].seconds) >= 364 * 86400)
  await pool.query(
    "UPDATE session SET expires_at = now() - interval '1 second' WHERE user_id=$1",
    [second.id]
  )
  assert.equal(
    await auth.api.getSession({
      headers: new Headers({ cookie: second.cookie })
    }),
    null
  )

  const client = await pool.connect()
  try {
    await client.query('BEGIN')
    const id = randomUUID(),
      snapshot = randomUUID()
    await client.query(
      `INSERT INTO assessments (id,owner_id,current_snapshot_id,versions,create_request_key,create_fingerprint) VALUES ($1,$2,$3,'{}',$4,'digest')`,
      [id, first.id, snapshot, randomUUID()]
    )
    await client.query(
      `INSERT INTO assessment_snapshots (id,assessment_id,revision,format,payload,digest,has_result) VALUES ($1,$2,0,'assessment_v1','{}','digest',false)`,
      [snapshot, id]
    )
    await client.query('SET CONSTRAINTS ALL IMMEDIATE')
    async function rejects(sql: string, values: unknown[] = []) {
      await client.query('SAVEPOINT invalid_write')
      await assert.rejects(client.query(sql, values))
      await client.query('ROLLBACK TO SAVEPOINT invalid_write')
    }
    await rejects(
      'UPDATE assessment_snapshots SET payload=\'{"changed":true}\' WHERE id=$1',
      [snapshot]
    )
    await rejects('DELETE FROM "user" WHERE id=$1', [first.id])
    await rejects("UPDATE assessments SET visibility='public' WHERE id=$1", [
      id
    ])
    await rejects('UPDATE assessments SET current_snapshot_id=$1 WHERE id=$2', [
      randomUUID(),
      id
    ])
    const operation = randomUUID()
    await client.query(
      `INSERT INTO assessment_operations (id,assessment_id,request_key,fingerprint,action,base_snapshot_id,base_revision,versions,status,deadline) VALUES ($1,$2,'request','digest','{}',$3,0,'{}','running',now()+interval '120 seconds')`,
      [operation, id, snapshot]
    )
    await rejects(
      `INSERT INTO assessment_operations (assessment_id,request_key,fingerprint,action,base_snapshot_id,base_revision,versions,status,deadline) VALUES ($1,'competing','digest','{}',$2,0,'{}','running',now())`,
      [id, snapshot]
    )
    await client.query('DELETE FROM assessments WHERE id=$1', [id])
    assert.equal(
      (
        await client.query('SELECT id FROM assessment_snapshots WHERE id=$1', [
          snapshot
        ])
      ).rowCount,
      0
    )
    assert.equal(
      (
        await client.query('SELECT id FROM assessment_operations WHERE id=$1', [
          operation
        ])
      ).rowCount,
      0
    )
    await client.query('ROLLBACK')
  } finally {
    client.release()
  }
  console.log(
    'PASS: real PostgreSQL migrations, immutable snapshots, retained owners, active-operation exclusion, anonymous session isolation/expiry and origin protection'
  )
} finally {
  await pool.query('DELETE FROM "user" WHERE id = ANY($1::text[])', [owners])
  await pool.end()
}
