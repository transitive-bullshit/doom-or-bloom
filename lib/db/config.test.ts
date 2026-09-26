import { Client } from 'pg'
import { describe, expect, it } from 'vitest'

import { databaseUrl } from './config'

describe('databaseUrl', () => {
  it.each(['prefer', 'require', 'verify-ca'])(
    'preserves full TLS verification for the legacy %s alias',
    (mode) => {
      const value = `postgresql://user:p%40ss@db.example.com/app?sslmode=${mode}&channel_binding=require`
      const result = databaseUrl(value)
      const url = new URL(result)
      expect(url.searchParams.get('sslmode')).toBe('verify-full')
      expect(url.searchParams.get('channel_binding')).toBe('require')
      expect(url.password).toBe('p%40ss')
      // Parse through the installed driver without opening a connection.
      expect(new Client({ connectionString: result }).ssl).toEqual({})
    }
  )

  it.each([
    'postgresql://localhost/app',
    'postgresql://localhost/app?sslmode=disable',
    'postgresql://db.example.com/app?sslmode=verify-full',
    'postgresql://db.example.com/app?uselibpqcompat=true&sslmode=require'
  ])('preserves explicit settings and local connections: %s', (value) => {
    expect(databaseUrl(value)).toBe(value)
  })

  it.each(['', 'invalid', 'https://example.com/app'])(
    'rejects invalid database URLs: %s',
    (value) => {
      expect(() => databaseUrl(value)).toThrow(
        'DATABASE_URL must be a PostgreSQL connection URL'
      )
    }
  )
})
