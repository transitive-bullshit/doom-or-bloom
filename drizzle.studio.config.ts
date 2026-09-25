import { defineConfig } from 'drizzle-kit'
import { databaseUrl } from './lib/db/config'

if (!process.env.STUDIO_DATABASE_URL)
  throw new Error('Use pnpm db:studio:local or pnpm db:studio:production')
export default defineConfig({
  schema: './lib/db/schema.ts',
  dialect: 'postgresql',
  dbCredentials: { url: databaseUrl(process.env.STUDIO_DATABASE_URL) }
})
