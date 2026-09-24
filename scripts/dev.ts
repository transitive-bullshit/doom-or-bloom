import { spawn } from 'node:child_process'
import { readFileSync } from 'node:fs'
import { parseEnv } from 'node:util'
import { validateServerEnv } from '../lib/server/validate-env'

// Saved development settings take precedence over credentials inherited from
// the shell or editor. Validate exactly the environment passed to Portless.
const env: NodeJS.ProcessEnv = {
  ...process.env,
  ...parseEnv(readFileSync('.env.development.local', 'utf8')),
  NODE_ENV: 'development',
  ASSESSMENT_PROVIDER: 'live'
}
validateServerEnv(env)
console.log('Development environment configuration is valid.')

const child = spawn(
  'pnpm',
  [
    'exec',
    'portless',
    'doom-or-bloom',
    ...process.argv.slice(2),
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
