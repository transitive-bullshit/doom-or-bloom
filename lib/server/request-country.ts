import 'server-only'

/**
 * The country Vercel's edge geolocates the request to, as an ISO 3166-1
 * alpha-2 code, or null when the header is absent (local development) or
 * malformed. Only the country is kept; the IP address is never read or stored.
 */
export function requestCountry(request: Request) {
  const value = request.headers.get('x-vercel-ip-country')?.trim().toUpperCase()
  return value && /^[A-Z]{2}$/.test(value) ? value : null
}
