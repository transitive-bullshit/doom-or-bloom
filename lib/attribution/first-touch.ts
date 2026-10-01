import { z } from 'zod'
import { splitLocalePath } from '../../i18n/config'

// First-party cookie recording how a browser first arrived. Written once by the
// client, read by the server when it creates an owner and by analytics events.
export const firstTouchCookie = 'dob_first_touch'
const maxAgeSeconds = 180 * 24 * 60 * 60

const slug = z.string().regex(/^[a-z0-9][a-z0-9._-]{0,63}$/)
const landings = [
  'home',
  'users',
  'user',
  'public_assessment',
  'assessment',
  'about',
  'pdoom',
  'blog',
  'other'
] as const

/** Field validators, shared with the analytics event allowlist. */
export const firstTouchFields = {
  tag: slug.optional(),
  // External referring hostname only; never a path or query.
  referrer: z
    .string()
    .regex(/^[a-z0-9.-]{1,100}$/)
    .optional(),
  landing: z.enum(landings),
  // The landing URL's locale code; absent on records made before locales.
  // A pattern, not the enabled list, so records outlive a disabled locale.
  locale: z
    .string()
    .regex(/^[a-z]{2}(?:-[A-Za-z]{2,4})?$/)
    .optional()
}

const firstTouchSchema = z.strictObject({
  v: z.literal(1),
  ref: firstTouchFields.tag,
  source: firstTouchFields.tag,
  medium: firstTouchFields.tag,
  campaign: firstTouchFields.tag,
  referrer: firstTouchFields.referrer,
  landing: firstTouchFields.landing,
  locale: firstTouchFields.locale,
  at: z.iso.datetime()
})
export type FirstTouch = z.infer<typeof firstTouchSchema>

/** Normalizes a link tag to a short lowercase slug, or drops it. */
export function cleanTag(value: string | null | undefined) {
  const tag = value
    ?.trim()
    .toLowerCase()
    .replace(/[^a-z0-9._-]+/g, '-')
    .replace(/^[^a-z0-9]+/, '')
    .slice(0, 64)
  return tag || undefined
}

function landingKind(pathname: string): FirstTouch['landing'] {
  // Locale prefixes are not page kinds; /es/users is the same landing as /users.
  pathname = splitLocalePath(pathname).path
  if (pathname === '/') return 'home'
  if (pathname === '/users') return 'users'
  if (pathname.startsWith('/users/')) return 'user'
  if (pathname.startsWith('/public/assessments/')) return 'public_assessment'
  if (pathname === '/assessment' || pathname.startsWith('/assessments'))
    return 'assessment'
  if (pathname === '/about') return 'about'
  if (pathname === '/p-doom') return 'pdoom'
  if (pathname === '/blog' || pathname.startsWith('/blog/')) return 'blog'
  return 'other'
}

function referrerHost(referrer: string, ownHost: string) {
  try {
    const host = new URL(referrer).hostname.toLowerCase().replace(/^www\./, '')
    const own = ownHost.toLowerCase().replace(/^www\./, '')
    if (!host || host === own || host.endsWith('.' + own)) return undefined
    return /^[a-z0-9.-]{1,100}$/.test(host) ? host : undefined
  } catch {
    return undefined
  }
}

export function captureFirstTouch({
  url,
  referrer,
  now
}: {
  url: URL
  referrer: string
  now: Date
}): FirstTouch {
  const params = url.searchParams
  return firstTouchSchema.parse({
    v: 1,
    ref: cleanTag(params.get('ref')),
    source: cleanTag(params.get('utm_source')),
    medium: cleanTag(params.get('utm_medium')),
    campaign: cleanTag(params.get('utm_campaign')),
    referrer: referrerHost(referrer, url.hostname),
    landing: landingKind(url.pathname),
    locale: splitLocalePath(url.pathname).locale,
    at: now.toISOString()
  })
}

export function firstTouchCookieString(touch: FirstTouch, secure: boolean) {
  const value = encodeURIComponent(JSON.stringify(touch))
  return `${firstTouchCookie}=${value}; Max-Age=${maxAgeSeconds}; Path=/; SameSite=Lax${secure ? '; Secure' : ''}`
}

/** Validates a stored value (cookie JSON or a database column). */
export function parseFirstTouch(value: unknown): FirstTouch | null {
  const result = firstTouchSchema.safeParse(value)
  return result.success ? result.data : null
}

/** Reads the first-touch record from a Cookie header or `document.cookie`. */
export function readFirstTouch(cookieHeader: string | null | undefined) {
  for (const pair of cookieHeader?.split(';') ?? []) {
    const separator = pair.indexOf('=')
    if (pair.slice(0, separator).trim() !== firstTouchCookie) continue
    try {
      return parseFirstTouch(
        JSON.parse(decodeURIComponent(pair.slice(separator + 1).trim()))
      )
    } catch {
      return null
    }
  }
  return null
}

/** Keeps the earlier of two records, so a claim never replaces an older origin. */
export function earliestFirstTouch(a: unknown, b: unknown) {
  const first = parseFirstTouch(a),
    second = parseFirstTouch(b)
  if (!first || !second) return first ?? second
  return Date.parse(second.at) < Date.parse(first.at) ? second : first
}

/** One coarse dimension for dashboards: an explicit tag, else the referrer. */
function firstTouchChannel(touch: FirstTouch) {
  return touch.ref ?? touch.source ?? touch.referrer ?? 'direct'
}

export function firstTouchProperties(touch: FirstTouch | null) {
  if (!touch) return {}
  return {
    first_touch_channel: firstTouchChannel(touch),
    first_touch_ref: touch.ref,
    first_touch_source: touch.source,
    first_touch_medium: touch.medium,
    first_touch_campaign: touch.campaign,
    first_touch_referrer: touch.referrer,
    first_touch_landing: touch.landing,
    first_touch_locale: touch.locale
  }
}

/**
 * Pageview URL for Vercel Web Analytics: path plus normalized UTM tags only.
 * A bare `?ref=` becomes `utm_source` so Vercel's source breakdown sees it.
 */
export function attributionUrl(raw: string) {
  try {
    const url = new URL(raw)
    const params = url.searchParams
    const tags = {
      utm_source: cleanTag(params.get('utm_source') ?? params.get('ref')),
      utm_medium: cleanTag(params.get('utm_medium')),
      utm_campaign: cleanTag(params.get('utm_campaign'))
    }
    url.search = ''
    url.hash = ''
    for (const [key, value] of Object.entries(tags))
      if (value) params.set(key, value)
    return url.href
  } catch {
    return ''
  }
}
