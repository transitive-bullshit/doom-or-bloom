import { hasTrustedOrigin } from '@/lib/auth/origin'
import { getAuth } from '@/lib/auth/server'

export const dynamic = 'force-dynamic'
export async function GET(request: Request) {
  return getAuth().handler(request)
}
export async function POST(request: Request) {
  if (!hasTrustedOrigin(request)) return new Response(null, { status: 403 })
  return getAuth().handler(request)
}
