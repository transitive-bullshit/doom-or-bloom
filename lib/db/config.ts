import { z } from 'zod'

export function databaseUrl(value = process.env.DATABASE_URL) {
  const parsed = z.url().safeParse(value)
  if (
    !parsed.success ||
    !['postgres:', 'postgresql:'].includes(new URL(parsed.data).protocol)
  ) {
    throw new Error('DATABASE_URL must be a PostgreSQL connection URL')
  }
  return parsed.data
}
