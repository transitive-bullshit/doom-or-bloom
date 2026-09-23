import 'server-only'

import { drizzle } from 'drizzle-orm/node-postgres'
import { Pool } from 'pg'

import { databaseUrl } from './config'

const globalDatabase = globalThis as typeof globalThis & {
  assessmentPool?: Pool
}

export function getPool() {
  return (globalDatabase.assessmentPool ??= new Pool({
    connectionString: databaseUrl(),
    max: 5,
    idleTimeoutMillis: 30_000,
    connectionTimeoutMillis: 10_000
  }))
}

export function getDatabase() {
  return drizzle(getPool())
}
