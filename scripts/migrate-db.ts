import { drizzle } from 'drizzle-orm/node-postgres'
import { migrate } from 'drizzle-orm/node-postgres/migrator'
import { Pool } from 'pg'
import { databaseUrl } from '../lib/db/config'

const isTest = process.argv.includes('--test')
const connectionString = databaseUrl(
  isTest
    ? process.env.TEST_DATABASE_URL
    : process.env.DATABASE_MIGRATION_URL || process.env.DATABASE_URL
)
if (isTest && !new URL(connectionString).pathname.endsWith('_test')) {
  throw new Error('Integration database name must end in _test')
}
const pool = new Pool({ connectionString })
try {
  await migrate(drizzle(pool), { migrationsFolder: './drizzle' })
  console.log(
    `Applied pending migrations to ${isTest ? 'test' : 'development/configured'} database`
  )
} finally {
  await pool.end()
}
