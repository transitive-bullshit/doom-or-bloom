import { spawnSync } from 'node:child_process'
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { expect, test } from 'vitest'

test('production inspection imports only its dedicated DB URL and leaves normal app credentials local', () => {
  const directory = mkdtempSync(join(tmpdir(), 'doom-admin-env-'))
  try {
    writeFileSync(
      join(directory, '.env.development.local'),
      [
        'DATABASE_URL=postgresql://localhost/app_dev',
        'BETTER_AUTH_URL=http://doom-or-bloom.localhost:1355',
        `BETTER_AUTH_SECRET=${'a'.repeat(32)}`,
        'TYPESAFE_API_KEY=local-key'
      ].join('\n')
    )
    writeFileSync(
      join(directory, '.env.production.local'),
      [
        'DATABASE_URL=postgresql://production.invalid/app',
        'ADMIN_DATABASE_URL=postgresql://readonly@production.invalid/app',
        'BETTER_AUTH_URL=https://production.invalid',
        'TYPESAFE_API_KEY=production-key'
      ].join('\n')
    )
    writeFileSync(
      join(directory, 'pnpm'),
      `#!${process.execPath}\nrequire('node:fs').writeFileSync('captured.json', JSON.stringify({ args: process.argv.slice(2), database: process.env.DATABASE_URL, adminDatabase: process.env.ADMIN_DATABASE_URL, auth: process.env.BETTER_AUTH_URL, providerKey: process.env.TYPESAFE_API_KEY, enabled: process.env.ADMIN_ENABLED, analytics: process.env.NEXT_PUBLIC_ANALYTICS_ENABLED }))`,
      { mode: 0o755 }
    )
    const launcher = fileURLToPath(
      new URL('../../scripts/dev.ts', import.meta.url)
    )
    const run = (...args: string[]) =>
      spawnSync(
        process.execPath,
        ['--import', import.meta.resolve('tsx'), launcher, ...args],
        {
          cwd: directory,
          encoding: 'utf8',
          env: {
            ...process.env,
            PATH: `${directory}:${process.env.PATH}`,
            X_CLIENT_ID: '',
            X_CLIENT_SECRET: '',
            NEXT_PUBLIC_ANALYTICS_ENABLED: 'false',
            VERCEL: '',
            VERCEL_ENV: '',
            VERCEL_URL: '',
            PORTLESS_TAILSCALE_URL: '',
            DEV_TUNNEL_URL: '',
            DATABASE_URL: 'postgresql://stale.invalid/app'
          }
        }
      )
    const result = run('--admin=production')
    expect({ status: result.status, stderr: result.stderr }).toEqual({
      status: 0,
      stderr: ''
    })
    const captured = JSON.parse(
      readFileSync(join(directory, 'captured.json'), 'utf8')
    )
    expect(captured).toMatchObject({
      database: 'postgresql://localhost/app_dev',
      adminDatabase: 'postgresql://readonly@production.invalid/app',
      auth: 'http://doom-or-bloom.localhost:1355',
      providerKey: 'local-key',
      enabled: 'true',
      analytics: 'false'
    })
    expect(captured.args).not.toContain('--admin=production')
    expect(result.stdout).not.toContain('readonly@')
    expect(run('--admin=production', '--tailscale').status).not.toBe(0)
    expect(run('--admin=unknown').status).not.toBe(0)
    expect(run().status).toBe(0)
    expect(
      JSON.parse(readFileSync(join(directory, 'captured.json'), 'utf8'))
    ).toMatchObject({ enabled: 'false' })
  } finally {
    rmSync(directory, { recursive: true, force: true })
  }
})
