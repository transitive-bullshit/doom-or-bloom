import 'server-only'

export function isSameOriginRequest(request: Request) {
  const origin = request.headers.get('origin')
  if (!origin) return true
  // Portless injects the browser-facing URL into the child environment.
  // Forwarded request headers must not choose the allowed origin.
  const developmentUrl =
    process.env.NODE_ENV !== 'production' ? process.env.PORTLESS_URL : undefined
  try {
    const expected = new URL(developmentUrl || request.url)
    return (
      ['http:', 'https:'].includes(expected.protocol) &&
      origin === expected.origin
    )
  } catch {
    return false
  }
}
