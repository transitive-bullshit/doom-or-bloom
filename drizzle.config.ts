import { defineConfig } from 'drizzle-kit'
import { databaseUrl } from './lib/db/config'

const url = process.env.DATABASE_MIGRATION_URL || process.env.DATABASE_URL

export default defineConfig({
  schema: './lib/db/schema.ts',
  out: './drizzle',
  dialect: 'postgresql',
  // Offline schema analysis/generation needs no connection credentials.
  dbCredentials: url ? { url: databaseUrl(url) } : undefined
})
