import { siteUrl } from '@/lib/site'

/**
 * IndexNow lets Bing (and through it ChatGPT search and Copilot), Yandex and
 * other participating engines learn about changed URLs immediately. The key is
 * public by design: engines confirm ownership by fetching it from the site.
 */
export const indexNowKey = '481682275ef842516a0fa50be7d28160'
export const indexNowKeyLocation = `${siteUrl}/${indexNowKey}.txt`
// Engines share submissions, but Bing's own endpoint is the one its Webmaster
// Tools reports on, so URLs go to both.
export const indexNowEndpoints = [
  'https://www.bing.com/indexnow',
  'https://api.indexnow.org/indexnow'
]
// The protocol accepts up to 10,000 URLs per request.
const batchSize = 10_000

/** The IndexNow request bodies for these URLs, all on the site's host. */
export function indexNowPayloads(urls: string[]) {
  const host = new URL(siteUrl).host
  const own = [...new Set(urls)].filter((url) => new URL(url).host === host)
  const payloads = []
  for (let start = 0; start < own.length; start += batchSize)
    payloads.push({
      host,
      key: indexNowKey,
      keyLocation: indexNowKeyLocation,
      urlList: own.slice(start, start + batchSize)
    })
  return payloads
}

/** What an IndexNow response status means, per the protocol. */
export function indexNowStatus(status: number) {
  switch (status) {
    case 200:
      return { accepted: true, meaning: 'URLs received' }
    case 202:
      return { accepted: true, meaning: 'URLs received; key check pending' }
    case 400:
      return { accepted: false, meaning: 'bad request' }
    case 403:
      return { accepted: false, meaning: 'key not valid or key file missing' }
    case 422:
      return {
        accepted: false,
        meaning: 'URLs not on the host, or the key does not match'
      }
    case 429:
      return { accepted: false, meaning: 'too many requests' }
    default:
      return { accepted: false, meaning: `unexpected status ${status}` }
  }
}

/** Submits URLs to every endpoint. Returns each request's status. */
export async function submitToIndexNow(urls: string[]) {
  const results: { endpoint: string; status: number }[] = []
  for (const payload of indexNowPayloads(urls))
    for (const endpoint of indexNowEndpoints) {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'content-type': 'application/json; charset=utf-8' },
        body: JSON.stringify(payload)
      })
      results.push({ endpoint, status: response.status })
    }
  return results
}

export type SitemapEntry = { url: string; lastmod?: string }

/** The `<loc>` and optional `<lastmod>` of each `<url>` in a sitemap. */
export function sitemapEntries(xml: string): SitemapEntry[] {
  return [...xml.matchAll(/<url>([\s\S]*?)<\/url>/g)].flatMap(([, body]) => {
    const url = /<loc>([^<]+)<\/loc>/.exec(body!)?.[1]?.trim()
    const lastmod = /<lastmod>([^<]+)<\/lastmod>/.exec(body!)?.[1]?.trim()
    return url ? [{ url, ...(lastmod && { lastmod }) }] : []
  })
}

const dateOnly = /^\d{4}-\d{2}-\d{2}$/

/**
 * Entries whose lastmod is after `since`. A date without a time could be any
 * time that day, so it counts when it falls on or after the cutoff's UTC
 * date. Entries without a lastmod are never included.
 */
export function changedSince(entries: SitemapEntry[], since: Date) {
  const day = since.toISOString().slice(0, 10)
  return entries.filter(({ lastmod }) => {
    if (!lastmod) return false
    if (dateOnly.test(lastmod)) return lastmod >= day
    const time = Date.parse(lastmod)
    return Number.isFinite(time) && time > since.getTime()
  })
}
