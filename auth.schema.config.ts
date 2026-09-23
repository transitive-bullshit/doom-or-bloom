import { drizzle } from 'drizzle-orm/node-postgres'
import { createAuth } from './lib/auth/config'

export const auth = createAuth(drizzle(process.env.DATABASE_URL!))
