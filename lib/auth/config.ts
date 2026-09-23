import { betterAuth } from 'better-auth'
import { drizzleAdapter } from 'better-auth/adapters/drizzle'
import { anonymous } from 'better-auth/plugins'
import { drizzle } from 'drizzle-orm/node-postgres'
import { APIError } from 'better-auth/api'
import { claimAnonymousAssessments } from './claim'

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
    account: { accountLinking: { enabled: false } },
    socialProviders:
      process.env.X_CLIENT_ID && process.env.X_CLIENT_SECRET
        ? {
            twitter: {
              clientId: process.env.X_CLIENT_ID,
              clientSecret: process.env.X_CLIENT_SECRET,
              disableDefaultScope: true,
              scope: ['users.read', 'tweet.read']
            }
          }
        : {},
    session: { expiresIn: 365 * 24 * 60 * 60, updateAge: 24 * 60 * 60 },
    plugins: [
      anonymous({
        disableDeleteAnonymousUser: true,
        async onLinkAccount({ anonymousUser, newUser, ctx }) {
          if (newUser.user.isAnonymous) return
          try {
            await claimAnonymousAssessments(
              database,
              anonymousUser.user.id,
              newUser.user.id
            )
          } catch {
            // The library creates its destination session before this hook. Do not
            // replace the browser's valid anonymous cookie when the claim fails.
            const context = ctx.context as typeof ctx.context & {
              responseHeaders?: Headers
            }
            context.responseHeaders?.delete('set-cookie')
            context.responseHeaders?.set(
              'location',
              new URL('/assessments?authError=claim', baseURL).toString()
            )
            throw new APIError('FOUND', {
              message:
                'Your assessments could not be linked. Your anonymous session is unchanged; try signing in again.'
            })
          }
        }
      })
    ]
  })
}
