/** Recognize individual X/Twitter posts, leaving profile and other links alone. */
export function tweetIdFromUrl(value: string): string | null {
  try {
    const url = new URL(value)
    if (!['https:', 'http:'].includes(url.protocol)) return null
    if (
      ![
        'x.com',
        'www.x.com',
        'twitter.com',
        'www.twitter.com',
        'mobile.twitter.com'
      ].includes(url.hostname)
    )
      return null
    return (
      /^\/(?:[^/]+\/status|i\/web\/status)\/(\d{1,25})(?:\/|$)/.exec(
        url.pathname
      )?.[1] ?? null
    )
  } catch {
    return null
  }
}
