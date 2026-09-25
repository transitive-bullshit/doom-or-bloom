import 'server-only'
import { Pool } from 'pg'
import { drizzle } from 'drizzle-orm/node-postgres'
import { databaseUrl } from '../db/config'
import { requireLocalAdmin } from './guard'

const globalAdmin = globalThis as typeof globalThis & { adminReadPool?: Pool }

export async function adminDatabase() {
  await requireLocalAdmin()
  // Never fall back to the application pool, even for local inspection.
  if (!process.env.ADMIN_DATABASE_URL)
    throw new Error(
      'Admin database is not configured. Restart with pnpm admin:local or pnpm admin:production.'
    )
  const url = new URL(databaseUrl(process.env.ADMIN_DATABASE_URL))
  // URL options override pg's separate Pool options, so pin them in the URL.
  url.searchParams.set(
    'options',
    '-c default_transaction_read_only=on -c statement_timeout=15000'
  )
  const pool = (globalAdmin.adminReadPool ??= new Pool({
    connectionString: url.toString(),
    max: 3,
    connectionTimeoutMillis: 10_000,
    idleTimeoutMillis: 30_000,
    application_name: 'doom-or-bloom-local-admin'
  }))
  return drizzle(pool)
}
