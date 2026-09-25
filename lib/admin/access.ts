// Kept pure so the fail-closed policy can be tested without a Next server.
export function adminEnvironmentAllowed(
  env: Record<string, string | undefined>
) {
  return (
    env.NODE_ENV === 'development' &&
    env.ADMIN_ENABLED === 'true' &&
    !env.VERCEL &&
    !env.VERCEL_ENV &&
    !env.VERCEL_URL &&
    !env.PORTLESS_TAILSCALE_URL &&
    !env.DEV_TUNNEL_URL &&
    !env.PORTLESS_NGROK_URL &&
    !env.PORTLESS_NGROK &&
    !env.PORTLESS_FUNNEL &&
    !env.PORTLESS_TAILSCALE &&
    env.PORTLESS_LAN !== '1'
  )
}

export function localAdminHost(value: string | null) {
  if (!value || /[\s,/@\\?#]/.test(value)) return false
  try {
    const url = new URL(`http://${value}`)
    return (
      url.hostname === 'localhost' ||
      url.hostname.endsWith('.localhost') ||
      url.hostname === '127.0.0.1' ||
      url.hostname === '[::1]'
    )
  } catch {
    return false
  }
}
