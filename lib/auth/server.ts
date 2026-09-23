import 'server-only'
import { getDatabase } from '../db'
import * as schema from '../db/auth-schema'
import { createAuth } from './config'

let instance: ReturnType<typeof createAuth> | undefined
export function getAuth() {
  return (instance ??= createAuth(getDatabase(), schema))
}

export async function requireOwner(headers: Headers) {
  const session = await getAuth().api.getSession({ headers })
  if (!session) throw new Error('Authentication required')
  return session.user.id
}
