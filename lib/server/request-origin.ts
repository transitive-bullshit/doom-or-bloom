import 'server-only'

export function isSameOriginRequest(request: Request) {
  const origin = request.headers.get('origin')
  if (!origin) return true
  // Portless injects the browser-facing URL into the child environment.
  // Forwarded request headers must not choose the allowed origin.
  const developmentUrls =
    process.env.NODE_ENV !== 'production'
      ? [
          process.env.PORTLESS_URL,
          process.env.PORTLESS_TAILSCALE_URL,
          process.env.DEV_TUNNEL_URL
        ].filter(Boolean)
      : []
  try {
    const expected = (
      developmentUrls.length ? developmentUrls : [request.url]
    ).map((value) => new URL(value!))
    return expected.some(
      (url) =>
        ['http:', 'https:'].includes(url.protocol) && origin === url.origin
    )
  } catch {
    return false
  }
}
