import { z } from 'zod'

const nonempty = z.string().trim().min(1)
const httpUrl = z.url().refine((value) => /^https?:/.test(value))
const postgresUrl = z.url().refine((value) => /^postgres(ql)?:/.test(value))

// Report variable names, never values: URLs and validation inputs can contain secrets.
export function validateServerEnv(
  env: Record<string, string | undefined> = process.env,
  { testDatabase = false } = {}
) {
  const errors: string[] = []
  function check(name: string, schema: z.ZodType) {
    if (!schema.safeParse(env[name]).success) errors.push(name)
  }
  check('DATABASE_URL', postgresUrl)
  check('BETTER_AUTH_URL', httpUrl)
  check('BETTER_AUTH_SECRET', z.string().trim().min(32))
  const provider = env.ASSESSMENT_PROVIDER || 'live'
  if (!['live', 'fixture'].includes(provider))
    errors.push('ASSESSMENT_PROVIDER')
  if (provider === 'fixture' && env.NODE_ENV === 'production')
    errors.push('ASSESSMENT_PROVIDER (fixture is not allowed in production)')
  if (provider === 'live') check('TYPESAFE_API_KEY', nonempty)
  if (env.X_CLIENT_ID?.trim() || env.X_CLIENT_SECRET?.trim()) {
    check('X_CLIENT_ID', nonempty)
    check('X_CLIENT_SECRET', nonempty)
  }
  for (const name of [
    'NEXT_PUBLIC_ASSESSMENT_DEBUG',
    'NEXT_PUBLIC_ANALYTICS_ENABLED',
    'POSTHOG_IP_DISPOSAL_CONFIRMED'
  ]) {
    if (env[name]) check(name, z.enum(['true', 'false']))
  }
  if (env.NEXT_PUBLIC_ANALYTICS_ENABLED === 'true' && provider === 'live') {
    check('NEXT_PUBLIC_POSTHOG_KEY', nonempty)
    check('NEXT_PUBLIC_POSTHOG_HOST', httpUrl)
    check('POSTHOG_IP_DISPOSAL_CONFIRMED', z.literal('true'))
  }
  if (testDatabase)
    check(
      'TEST_DATABASE_URL',
      postgresUrl.refine((value) => new URL(value).pathname.endsWith('_test'))
    )
  if (errors.length)
    throw new Error(
      `Missing or invalid environment variables: ${errors.join(', ')}. Check the active environment configuration (.env.development.local for local development).`
    )
}
