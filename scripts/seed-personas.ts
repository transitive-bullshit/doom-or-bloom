import { Pool } from 'pg'
import { seedPersonas } from '../lib/personas/seed'
import { databaseUrl } from '../lib/db/config'
const test = process.argv.includes('--test')
const connectionString = databaseUrl(
  test ? process.env.TEST_DATABASE_URL : process.env.DATABASE_URL
)
if (test && !new URL(connectionString).pathname.endsWith('_test'))
  throw new Error('Test database name must end in _test')
const pool = new Pool({ connectionString })
try {
  console.log(
    `Seeded ${(await seedPersonas(pool)).length} curated persona assessments without inference`
  )
} finally {
  await pool.end()
}
