import 'server-only'
import { getDatabase } from '../db'
import * as schema from '../db/auth-schema'
import { createAuth } from './config'

let instance: ReturnType<typeof createAuth> | undefined
export function getAuth() {
  return (instance ??= createAuth(getDatabase(), schema))
}

/**
 * The session that authorizes owner pages and APIs. It skips the cookie
 * cache, so sign-out, expiry and revocation take effect immediately; only the
 * header's signed-in display may trail them.
 */
export function authorizedSession(headers: Headers) {
  return getAuth().api.getSession({
    headers,
    query: { disableCookieCache: true }
  })
}
