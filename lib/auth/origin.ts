/** All browser mutations, including first anonymous sign-in, require our exact origin. */
export function hasTrustedOrigin(request: Request) {
  const origin = request.headers.get('origin')
  return origin !== null && authUrls().origins.includes(origin)
}
import { authUrls } from './urls'
