import { spawn } from 'node:child_process'
import { inspectionDatabaseUrl } from './inspection-env'

const target = process.argv[2] ?? 'local'
const url = new URL(inspectionDatabaseUrl(target))
if (target === 'production') {
  // Studio is a database editor. Production inspection defaults to read-only.
  url.searchParams.set(
    'options',
    '-c default_transaction_read_only=on -c statement_timeout=15000'
  )
}
console.log(
  `Drizzle Studio: ${target} database${target === 'production' ? ' (read-only)' : ''}, listening on 127.0.0.1:4983.`
)
const child = spawn(
  process.execPath,
  [
    'node_modules/drizzle-kit/bin.cjs',
    'studio',
    '--config=drizzle.studio.config.ts',
    '--host=127.0.0.1'
  ],
  {
    stdio: 'inherit',
    env: { ...process.env, STUDIO_DATABASE_URL: url.toString() }
  }
)
child.on('error', () => {
  console.error('Could not start Drizzle Studio.')
  process.exitCode = 1
})
child.on('exit', (code) => {
  process.exitCode = code ?? 1
})
for (const signal of ['SIGINT', 'SIGTERM'] as const)
  process.on(signal, () => child.kill(signal))
