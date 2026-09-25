import 'server-only'
import { headers } from 'next/headers'
import { notFound } from 'next/navigation'
import { adminEnvironmentAllowed, localAdminHost } from './access'

export async function requireLocalAdmin() {
  // This literal is replaced by next.config at build time; runtime flags cannot
  // enable an admin page in a production artifact.
  if (
    process.env.LOCAL_ADMIN_BUILD !== 'true' ||
    !adminEnvironmentAllowed(process.env)
  )
    notFound()
  const request = await headers()
  if (
    !localAdminHost(request.get('host')) ||
    (request.has('x-forwarded-host') &&
      !localAdminHost(request.get('x-forwarded-host')))
  )
    notFound()
}
