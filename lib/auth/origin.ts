/** All browser mutations, including first anonymous sign-in, require our exact origin. */
export function hasTrustedOrigin(request: Request) {
  const baseURL = process.env.BETTER_AUTH_URL
  if (!baseURL) throw new Error('BETTER_AUTH_URL is required')
  return request.headers.get('origin') === new URL(baseURL).origin
}
