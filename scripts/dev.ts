import { spawn } from 'node:child_process'
import { readFileSync } from 'node:fs'
import { parseEnv } from 'node:util'
import { adminEnvironmentAllowed } from '../lib/admin/access'
import { inspectionDatabaseUrl } from './inspection-env'
import { validateServerEnv } from '../lib/server/validate-env'

// Saved development settings take precedence over credentials inherited from
// the shell or editor. Validate exactly the environment passed to Portless.
const env: NodeJS.ProcessEnv = {
  ...process.env,
  ...parseEnv(readFileSync('.env.development.local', 'utf8')),
  NODE_ENV: 'development',
  ASSESSMENT_PROVIDER: 'live'
}
const args = process.argv.slice(2)
const adminArg = args.find((arg) => arg.startsWith('--admin='))
if (adminArg) {
  if (
    args.some((arg) => arg !== adminArg) ||
    !adminEnvironmentAllowed({ ...env, ADMIN_ENABLED: 'true' })
  )
    throw new Error(
      'Admin inspection requires a local server without extra Portless flags, tunnels, or hosted environments.'
    )
  const target = adminArg.slice('--admin='.length)
  env.ADMIN_DATABASE_URL = inspectionDatabaseUrl(target)
  env.ADMIN_DATABASE_TARGET = target
  env.ADMIN_ENABLED = 'true'
  env.NEXT_TEST_DIST_DIR = '.next-admin'
  env.NEXT_PUBLIC_ANALYTICS_ENABLED = 'false'
  console.log(
    `Local read-only admin: ${target} database. Open /admin at the Portless URL below.`
  )
} else {
  // Enabling admin is deliberate on every launch, never inherited from a shell.
  env.ADMIN_ENABLED = 'false'
  delete env.ADMIN_DATABASE_URL
}
validateServerEnv(env)
console.log('Development environment configuration is valid.')

const child = spawn(
  'pnpm',
  [
    'exec',
    'portless',
    adminArg ? 'admin.doom-or-bloom' : 'doom-or-bloom',
    ...args.filter((arg) => arg !== adminArg),
    'next',
    'dev',
    '--hostname',
    '127.0.0.1'
  ],
  { stdio: 'inherit', env }
)
child.on('error', () => {
  console.error('Could not start the development server.')
  process.exitCode = 1
})
child.on('exit', (code) => {
  process.exitCode = code ?? 1
})
for (const signal of ['SIGINT', 'SIGTERM'] as const) {
  process.on(signal, () => child.kill(signal))
}
