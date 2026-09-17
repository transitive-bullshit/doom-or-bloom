import 'server-only'
import { isSameOriginRequest } from '@/lib/server/request-origin'

export function localDebugAvailable() {
  return process.env.NODE_ENV === 'development'
}
export function localFeedbackRequestAllowed(request: Request) {
  if (
    !localDebugAvailable() ||
    !request.headers.get('origin') ||
    !isSameOriginRequest(request)
  )
    return false
  try {
    const hostname = new URL(process.env.PORTLESS_URL || request.url).hostname
    return (
      hostname === 'localhost' ||
      hostname.endsWith('.localhost') ||
      hostname === '127.0.0.1' ||
      hostname === '[::1]'
    )
  } catch {
    return false
  }
}
