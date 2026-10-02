import { readFileSync } from 'node:fs'
import { parseEnv } from 'node:util'
import { Pool } from 'pg'
import { databaseUrl } from '../lib/db/config'

/** The loopback development database, opened read-only. */
export function localSourcePool() {
  const saved = parseEnv(readFileSync('.env.development.local', 'utf8'))
  const url = new URL(databaseUrl(saved.DATABASE_URL))
  if (!['localhost', '127.0.0.1', '[::1]'].includes(url.hostname))
    throw new Error('The import source must be the local development database.')
  url.searchParams.set('options', '-c default_transaction_read_only=on')
  return new Pool({ connectionString: url.toString(), max: 2 })
}

/** The database an env file names; read-only unless `write`. */
export function targetPool(envFile: string, write: boolean) {
  // Only database settings are read, never auth or app flags.
  const saved = parseEnv(readFileSync(envFile, 'utf8'))
  const value = write
    ? saved.DATABASE_URL
    : saved.ADMIN_DATABASE_URL ||
      saved.DATABASE_MIGRATION_URL ||
      saved.DATABASE_URL
  if (!value) throw new Error(`${envFile} has no database URL.`)
  const url = new URL(databaseUrl(value))
  if (!write && !url.hostname.includes('-pooler.'))
    url.searchParams.set(
      'options',
      '-c default_transaction_read_only=on -c statement_timeout=60000'
    )
  return new Pool({ connectionString: url.toString(), max: 2 })
}
