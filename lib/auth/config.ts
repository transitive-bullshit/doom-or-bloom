import { reportServerError } from '../server/error-reporting'
import { betterAuth } from 'better-auth'
import { drizzleAdapter } from 'better-auth/adapters/drizzle'
import { anonymous } from 'better-auth/plugins'
import { drizzle } from 'drizzle-orm/node-postgres'
import { APIError } from 'better-auth/api'
import { claimAnonymousAssessments } from './claim'
import { authUrls } from './urls'

function assertTrustedXUsername(
  data: Record<string, unknown>,
  verifiedXCallback: boolean
) {
  // Better Auth applies input:false to provider mappings too. Admit this field
  // only through the verified X callback, never through account-edit endpoints.
  if (data.xUsername !== undefined && !verifiedXCallback) {
    throw new APIError('BAD_REQUEST', {
      message: 'Your X handle is managed by X sign-in.'
    })
  }
}

// Shared by the pinned schema generator and the server-only runtime.
export function createAuth(
  database: ReturnType<typeof drizzle>,
  schema?: Record<string, unknown>
) {
  const secret = process.env.BETTER_AUTH_SECRET
  const { baseURL, origins } = authUrls()
  if (!secret || secret.length < 32) {
    throw new Error(
      'Set BETTER_AUTH_SECRET (at least 32 characters) and BETTER_AUTH_URL'
    )
  }
  return betterAuth({
    secret,
    baseURL,
    trustedOrigins: origins,
    database: drizzleAdapter(database, { provider: 'pg', schema }),
    account: { accountLinking: { enabled: false } },
    user: {
      additionalFields: {
        xUsername: { type: 'string', required: false }
      }
    },
    databaseHooks: {
      user: {
        create: {
          before: async (user, context) => {
            assertTrustedXUsername(
              user,
              context?.path === '/callback/:id' &&
                context.params?.id === 'twitter'
            )
            return { data: user }
          }
        },
        update: {
          before: async (user, context) => {
            assertTrustedXUsername(
              user,
              context?.path === '/callback/:id' &&
                context.params?.id === 'twitter'
            )
            return { data: user }
          }
        }
      }
    },
    socialProviders:
      process.env.X_CLIENT_ID && process.env.X_CLIENT_SECRET
        ? {
            twitter: {
              clientId: process.env.X_CLIENT_ID,
              clientSecret: process.env.X_CLIENT_SECRET,
              disableDefaultScope: true,
              overrideUserInfoOnSignIn: true,
              mapProfileToUser: (profile) => ({
                xUsername: profile.data.username
              }),
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
          } catch (err) {
            reportServerError('auth_account_claim_failed', err, {
              boundary: 'account_linking',
              application: { effect: 'anonymous_session_preserved' }
            })
            // The library creates its destination session before this hook. Do not
            // replace the browser's valid anonymous cookie when the claim fails.
            const context = ctx.context as typeof ctx.context & {
              responseHeaders?: Headers
            }
            context.responseHeaders?.delete('set-cookie')
            context.responseHeaders?.set(
              'location',
              new URL(
                '/assessments?authError=claim',
                ctx.context.baseURL
              ).toString()
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
