import { reportServerError } from '../server/error-reporting'
import 'server-only'

import { drizzle } from 'drizzle-orm/node-postgres'
import { Pool } from 'pg'

import { databaseUrl } from './config'

const globalDatabase = globalThis as typeof globalThis & {
  assessmentPool?: Pool
}

export function getPool() {
  if (!globalDatabase.assessmentPool) {
    const pool = new Pool({
      connectionString: databaseUrl(),
      max: 5,
      idleTimeoutMillis: 30_000,
      connectionTimeoutMillis: 10_000
    })
    pool.on('error', (err) => {
      reportServerError('database_pool_error', err, {
        boundary: 'database',
        // Idle-client errors are pool events, not necessarily the current request.
        requestId: undefined,
        route: undefined,
        method: undefined,
        totalConnections: pool.totalCount,
        idleConnections: pool.idleCount,
        waitingRequests: pool.waitingCount
      })
    })
    globalDatabase.assessmentPool = pool
  }
  return globalDatabase.assessmentPool
}

export function getDatabase() {
  return drizzle(getPool())
}
