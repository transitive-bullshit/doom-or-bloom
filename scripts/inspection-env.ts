import { readFileSync } from 'node:fs'
import { parseEnv } from 'node:util'
import { databaseUrl } from '../lib/db/config'

export function inspectionDatabaseUrl(target: string) {
  if (target !== 'local' && target !== 'production')
    throw new Error('Choose local or production explicitly.')
  const filename =
    target === 'local' ? '.env.development.local' : '.env.production.local'
  const saved = parseEnv(readFileSync(filename, 'utf8'))
  // Only import the database setting. Never import production auth or app flags.
  const value =
    saved.ADMIN_DATABASE_URL ||
    saved.DATABASE_MIGRATION_URL ||
    saved.DATABASE_URL
  if (!value)
    throw new Error(
      `${filename} must contain ADMIN_DATABASE_URL, DATABASE_MIGRATION_URL, or DATABASE_URL`
    )
  const url = databaseUrl(value)
  if (
    new URL(url).hostname.endsWith('.neon.tech') &&
    new URL(url).hostname.includes('-pooler.')
  )
    throw new Error(
      'Inspection requires a direct Neon connection for read-only startup settings. Set ADMIN_DATABASE_URL or DATABASE_MIGRATION_URL to the direct URL.'
    )
  if (
    target === 'local' &&
    !['localhost', '127.0.0.1', '[::1]'].includes(new URL(url).hostname)
  )
    throw new Error(
      'The local inspection command requires a loopback database host.'
    )
  return url
}
