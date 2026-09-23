import { defineConfig } from 'drizzle-kit'
import { databaseUrl } from './lib/db/config'

export default defineConfig({
  schema: './lib/db/schema.ts',
  out: './drizzle',
  dialect: 'postgresql',
  dbCredentials: {
    url: databaseUrl(
      process.env.DATABASE_MIGRATION_URL || process.env.DATABASE_URL
    )
  }
})
