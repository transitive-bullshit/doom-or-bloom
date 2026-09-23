import assert from 'node:assert/strict'
import { randomUUID } from 'node:crypto'
import { spawn, execFileSync, type ChildProcess } from 'node:child_process'
import { once } from 'node:events'
import { setTimeout as delay } from 'node:timers/promises'
import { chromium, expect } from '@playwright/test'
import { Pool } from 'pg'
import { drizzle } from 'drizzle-orm/node-postgres'
import { migrate } from 'drizzle-orm/node-postgres/migrator'
import { seedPersonas } from '../lib/personas/seed'
import { portlessUrl } from '../tests/portless'

// Native, disposable database only. Never resets the configured app/test DB.
const adminUrl = new URL(
  process.env.POSTGRES_TEST_ADMIN_URL || 'postgresql://localhost:5432/postgres'
)
assert.ok(['localhost', '127.0.0.1'].includes(adminUrl.hostname))
const name = `doom_bloom_recovery_${randomUUID().replaceAll('-', '')}_test`
const admin = new Pool({ connectionString: adminUrl.toString() })
const databaseUrl = new URL(adminUrl)
databaseUrl.pathname = `/${name}`
let pool: Pool | undefined
let server: ChildProcess | undefined
let log = ''
const origin = portlessUrl('recovery-tests.doom-or-bloom')
async function stop() {
  if (!server || server.exitCode !== null || server.signalCode !== null) return
  const exited = once(server, 'exit')
  // Portless/Next may establish child process groups. Kill the observed
  // descendant tree explicitly so no request handler survives the parent.
  const processes = execFileSync('ps', ['-axo', 'pid=,ppid='], {
    encoding: 'utf8'
  })
    .trim()
    .split('\n')
    .map((line) => line.trim().split(/\s+/).map(Number))
  const descendants = [server.pid!]
  for (const ancestor of descendants)
    for (const [pid, parent] of processes)
      if (parent === ancestor && !descendants.includes(pid!))
        descendants.push(pid!)
  for (const pid of descendants.reverse()) {
    try {
      process.kill(pid, 'SIGKILL')
    } catch (err) {
      if ((err as NodeJS.ErrnoException).code !== 'ESRCH') throw err
    }
  }
  await exited
}
async function start() {
  log = ''
  server = spawn(
    'pnpm',
    [
      'exec',
      'portless',
      'run',
      '--name',
      'recovery-tests.doom-or-bloom',
      'next',
      'dev',
      '--hostname',
      '127.0.0.1'
    ],
    {
      detached: true,
      stdio: ['ignore', 'pipe', 'pipe'],
      env: {
        ...process.env,
        DATABASE_URL: databaseUrl.toString(),
        NEXT_TEST_DIST_DIR: '.next-recovery',
        BETTER_AUTH_URL: origin,
        BETTER_AUTH_SECRET: 'local-recovery-test-secret-at-least-32-characters',
        ASSESSMENT_PROVIDER: 'fixture',
        NEXT_PUBLIC_ANALYTICS_ENABLED: 'false',
        X_CLIENT_ID: '',
        X_CLIENT_SECRET: ''
      }
    }
  )
  server.stdout?.on('data', (data) => {
    log = (log + String(data)).slice(-8000)
  })
  server.stderr?.on('data', (data) => {
    log = (log + String(data)).slice(-8000)
  })
  for (let i = 0; i < 120; i++) {
    if (server.exitCode !== null || server.signalCode !== null)
      throw new Error(`Test server exited: ${log}`)
    try {
      if (
        (
          await fetch(`${origin}/assessment`, {
            signal: AbortSignal.timeout(1000)
          })
        ).ok
      )
        return
    } catch {
      /* Wait for this exact child to become ready. */
    }
    await delay(250)
  }
  throw new Error(`Test server readiness timed out: ${log}`)
}
const browser = await chromium.launch()
let created = false
try {
  await admin.query(`CREATE DATABASE ${name}`)
  created = true
  pool = new Pool({ connectionString: databaseUrl.toString() })
  await migrate(drizzle(pool), { migrationsFolder: './drizzle' })
  const firstMigrations = await pool.query(
    'SELECT * FROM drizzle.__drizzle_migrations ORDER BY id'
  )
  await migrate(drizzle(pool), { migrationsFolder: './drizzle' })
  assert.deepEqual(
    (await pool.query('SELECT * FROM drizzle.__drizzle_migrations ORDER BY id'))
      .rows,
    firstMigrations.rows
  )
  assert.deepEqual(await seedPersonas(pool), await seedPersonas(pool))
  await start()
  const context = await browser.newContext()
  let page = await context.newPage()
  await page.goto(`${origin}/assessment`)
  await page.getByRole('button', { name: 'Map your own worldview' }).click()
  await expect(page).toHaveURL(/\/assessment\/[a-f0-9-]+$/)
  const id = page.url().split('/').at(-1)!
  assert.match(id, /^[a-f0-9-]{36}$/)
  const locker = await pool.connect()
  const advisoryKey = 839254
  try {
    await locker.query('SELECT pg_advisory_lock($1)', [advisoryKey])
    await pool.query(
      `CREATE FUNCTION hold_recovery_commit() RETURNS trigger LANGUAGE plpgsql AS $$ BEGIN IF NEW.assessment_id = '${id}' AND NEW.revision > 0 THEN PERFORM pg_advisory_xact_lock(${advisoryKey}); END IF; RETURN NEW; END $$`
    )
    await pool.query(
      'CREATE TRIGGER hold_recovery_commit BEFORE INSERT ON assessment_snapshots FOR EACH ROW EXECUTE FUNCTION hold_recovery_commit()'
    )
    const answer =
      'AI could improve medicine but powerful systems require meaningful human oversight.'
    await page.getByRole('textbox', { name: 'Your answer' }).fill(answer)
    await page.getByRole('button', { name: 'Continue', exact: true }).click()
    await expect
      .poll(
        async () =>
          Number(
            (
              await pool!.query(
                "SELECT count(*) FROM pg_stat_activity WHERE datname=$1 AND wait_event='advisory'",
                [name]
              )
            ).rows[0].count
          ),
        { timeout: 20_000 }
      )
      .toBe(1)
    const accepted = (
      await pool.query(
        'SELECT id, action, status FROM assessment_operations WHERE assessment_id=$1',
        [id]
      )
    ).rows[0]
    assert.equal(accepted.action.text, answer)
    assert.equal(accepted.status, 'running')
    await stop()
    await page.close()
    await locker.query('SELECT pg_advisory_unlock($1)', [advisoryKey])
    await pool.query(
      'DROP TRIGGER hold_recovery_commit ON assessment_snapshots'
    )
    await pool.query('DROP FUNCTION hold_recovery_commit()')
    assert.equal(
      (await pool.query('SELECT revision FROM assessments WHERE id=$1', [id]))
        .rows[0].revision,
      0
    )
    // Advance only this stopped request's deadline instead of sleeping 120 seconds.
    await pool.query(
      "UPDATE assessment_operations SET deadline=now()-interval '1 second' WHERE id=$1",
      [accepted.id]
    )
    await start()
    page = await context.newPage()
    await page.goto(`${origin}/assessment/${id}`)
    await expect(
      page.getByRole('button', { name: 'Retry saved submission' })
    ).toBeVisible()
    await expect(
      page.getByRole('textbox', { name: 'Your answer' })
    ).toHaveValue(answer)
    await page.getByRole('button', { name: 'Retry saved submission' }).click()
    await expect
      .poll(
        async () =>
          (
            await pool!.query('SELECT revision FROM assessments WHERE id=$1', [
              id
            ])
          ).rows[0].revision
      )
      .toBe(1)
    const operations = (
      await pool.query(
        'SELECT id,status,retry_of FROM assessment_operations WHERE assessment_id=$1 ORDER BY created_at',
        [id]
      )
    ).rows
    assert.equal(operations.length, 2)
    assert.equal(operations[0].status, 'interrupted')
    assert.equal(operations[1].status, 'succeeded')
    assert.equal(operations[1].retry_of, accepted.id)
    const data = await (
      await page.request.get(`${origin}/api/assessments/${id}`)
    ).json()
    assert.equal(data.assessment.answers.length, 1)
    console.log(
      'PASS: fresh native database, repeat migrations/seed, killed real POST, restarted server, restored input and one explicit browser retry'
    )
  } finally {
    await locker.query('SELECT pg_advisory_unlock_all()')
    locker.release()
  }
} finally {
  await stop()
  await browser.close()
  await pool?.end()
  if (created) await admin.query(`DROP DATABASE ${name} WITH (FORCE)`)
  await admin.end()
}
