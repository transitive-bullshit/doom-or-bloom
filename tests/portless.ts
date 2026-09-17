import { execFileSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'

export function portlessUrl(name: string) {
  const cli = fileURLToPath(
    new URL('./cli.js', import.meta.resolve('portless'))
  )
  return execFileSync(process.execPath, [cli, 'get', name], {
    encoding: 'utf8',
    timeout: 10_000
  }).trim()
}
