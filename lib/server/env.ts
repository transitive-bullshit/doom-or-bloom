import { z } from 'zod'

export function parseBoolean(value: string | undefined, name: string) {
  if (value === undefined || value === '' || value === 'false') return false
  if (value === 'true') return true
  throw new Error(`${name} must be true or false`)
}
export function serverEnv() {
  const provider = z
    .enum(['live', 'fixture'])
    .parse(process.env.ASSESSMENT_PROVIDER || 'live')
  if (provider === 'fixture' && process.env.NODE_ENV === 'production')
    throw new Error('Fixture mode is only available in development and tests')
  return {
    provider,
    model: process.env.TYPESAFE_MODEL || 'jev-1.13.0',
    debug: parseBoolean(
      process.env.NEXT_PUBLIC_ASSESSMENT_DEBUG,
      'NEXT_PUBLIC_ASSESSMENT_DEBUG'
    )
  }
}
