/** Only deployment-owned environment values may choose authentication origins. */
export function authUrls(
  env: Record<string, string | undefined> = process.env
) {
  if (env.VERCEL_ENV === 'preview') {
    const hosts = [env.VERCEL_URL, env.VERCEL_BRANCH_URL].filter(
      (host): host is string => Boolean(host)
    )
    if (
      !env.VERCEL_URL ||
      hosts.some((host) => !/^[a-z0-9-]+\.vercel\.app$/.test(host))
    ) {
      throw new Error(
        'Preview authentication requires valid Vercel deployment URLs'
      )
    }
    const allowedHosts = [...new Set(hosts)]
    const origins = allowedHosts.map((host) => `https://${host}`)
    return {
      origins,
      baseURL: {
        allowedHosts,
        protocol: 'https' as const,
        fallback: origins[0]!
      }
    }
  }
  const value = env.BETTER_AUTH_URL
  if (!value) throw new Error('BETTER_AUTH_URL is required')
  const url = new URL(value)
  if (!['http:', 'https:'].includes(url.protocol))
    throw new Error('BETTER_AUTH_URL must be an HTTP(S) URL')
  return { origins: [url.origin], baseURL: value }
}
