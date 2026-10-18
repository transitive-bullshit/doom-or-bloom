import { loadEnvFile } from 'node:process'
import { spawn, spawnSync } from 'node:child_process'
import { createRequire } from 'node:module'

const command = process.argv[2]
if (!['build', 'start'].includes(command))
  throw new Error('Expected build or start')
loadEnvFile('.env.development.local')
process.env.ASSESSMENT_PROVIDER = 'live'
const require = createRequire(import.meta.url)
// Production builds render the catalog from a snapshot of the local database.
if (command === 'build') {
  const snapshot = spawnSync(
    process.execPath,
    [
      '--conditions=react-server',
      '--import',
      'tsx',
      'scripts/catalog-snapshot.ts'
    ],
    { stdio: 'inherit', env: process.env }
  )
  if (snapshot.status !== 0) process.exit(snapshot.status ?? 1)
}
// Start a fresh process without --env-file in execArgv: Next forwards those
// arguments to worker NODE_OPTIONS, where Node does not permit --env-file.
const child = spawn(
  process.execPath,
  [require.resolve('next/dist/bin/next'), command, ...process.argv.slice(3)],
  { stdio: 'inherit', env: process.env }
)
child.on('error', () => {
  process.exitCode = 1
})
child.on('exit', (code) => {
  process.exitCode = code ?? 1
})
