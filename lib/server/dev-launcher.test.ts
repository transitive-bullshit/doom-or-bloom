import { spawnSync } from 'node:child_process'
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { expect, test } from 'vitest'

const launcher = fileURLToPath(new URL('../../scripts/dev.ts', import.meta.url))

test('development launcher overrides inherited credentials before validation and spawning', () => {
  const directory = mkdtempSync(join(tmpdir(), 'doom-dev-env-'))
  try {
    writeFileSync(
      join(directory, '.env.development.local'),
      [
        'DATABASE_URL=postgresql://localhost/doom_bloom_dev',
        'BETTER_AUTH_URL=http://doom-or-bloom.localhost:1355',
        `BETTER_AUTH_SECRET=${'a'.repeat(32)}`,
        'TYPESAFE_API_KEY=local-test-key',
        'X_CLIENT_ID=development-client',
        'X_CLIENT_SECRET="development-secret$literal"'
      ].join('\n')
    )
    // Capture the real launcher's child environment without starting a server
    // or contacting X. All credentials in this process are synthetic.
    writeFileSync(
      join(directory, 'pnpm'),
      `#!${process.execPath}\nrequire('node:fs').writeFileSync('captured.json', JSON.stringify({ args: process.argv.slice(2), client: process.env.X_CLIENT_ID, secret: process.env.X_CLIENT_SECRET, origin: process.env.BETTER_AUTH_URL, port: process.env.PORTLESS_PORT, mode: process.env.NODE_ENV }))`,
      { mode: 0o755 }
    )
    const result = spawnSync(
      process.execPath,
      ['--import', import.meta.resolve('tsx'), launcher, '--tailscale'],
      {
        cwd: directory,
        encoding: 'utf8',
        env: {
          ...process.env,
          PATH: `${directory}:${process.env.PATH}`,
          X_CLIENT_ID: 'stale-client',
          X_CLIENT_SECRET: 'stale-secret',
          BETTER_AUTH_URL: 'invalid-inherited-origin',
          PORTLESS_PORT: '1355',
          NODE_ENV: 'production'
        }
      }
    )
    expect({ status: result.status, stderr: result.stderr }).toEqual({
      status: 0,
      stderr: ''
    })
    expect(
      JSON.parse(readFileSync(join(directory, 'captured.json'), 'utf8'))
    ).toEqual({
      args: [
        'exec',
        'portless',
        'doom-or-bloom',
        '--tailscale',
        'next',
        'dev',
        '--hostname',
        '127.0.0.1'
      ],
      client: 'development-client',
      secret: 'development-secret$literal',
      origin: 'http://doom-or-bloom.localhost:1355',
      port: '1355',
      mode: 'development'
    })
  } finally {
    rmSync(directory, { recursive: true, force: true })
  }
})
