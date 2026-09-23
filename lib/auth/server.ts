import 'server-only'
import { getDatabase } from '../db'
import * as schema from '../db/auth-schema'
import { createAuth } from './config'

let instance: ReturnType<typeof createAuth> | undefined
export function getAuth() {
  return (instance ??= createAuth(getDatabase(), schema))
}
