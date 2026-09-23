import { betterAuth } from 'better-auth'
import { drizzleAdapter } from 'better-auth/adapters/drizzle'
import { anonymous } from 'better-auth/plugins'
import { drizzle } from 'drizzle-orm/node-postgres'

// Shared by the pinned schema generator and the server-only runtime.
export function createAuth(
  database: ReturnType<typeof drizzle>,
  schema?: Record<string, unknown>
) {
  const secret = process.env.BETTER_AUTH_SECRET
  const baseURL = process.env.BETTER_AUTH_URL
  if (!secret || secret.length < 32 || !baseURL) {
    throw new Error(
      'Set BETTER_AUTH_SECRET (at least 32 characters) and BETTER_AUTH_URL'
    )
  }
  return betterAuth({
    secret,
    baseURL,
    database: drizzleAdapter(database, { provider: 'pg', schema }),
    session: { expiresIn: 365 * 24 * 60 * 60, updateAge: 24 * 60 * 60 },
    plugins: [anonymous({ disableDeleteAnonymousUser: true })]
  })
}
