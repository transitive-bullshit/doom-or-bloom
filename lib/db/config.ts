import { z } from 'zod'

export function databaseUrl(value = process.env.DATABASE_URL) {
  const parsed = z.url().safeParse(value)
  if (
    !parsed.success ||
    !['postgres:', 'postgresql:'].includes(new URL(parsed.data).protocol)
  ) {
    throw new Error('DATABASE_URL must be a PostgreSQL connection URL')
  }
  const url = new URL(parsed.data)
  if (
    url.searchParams.get('uselibpqcompat') !== 'true' &&
    ['prefer', 'require', 'verify-ca'].includes(
      url.searchParams.get('sslmode') ?? ''
    )
  ) {
    // Preserve pg 8's certificate and hostname verification across driver upgrades.
    url.searchParams.set('sslmode', 'verify-full')
    return url.toString()
  }
  return parsed.data
}
