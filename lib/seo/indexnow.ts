import { siteUrl } from '@/lib/site'

/**
 * IndexNow lets Bing (and through it ChatGPT search and Copilot), Yandex and
 * other participating engines learn about changed URLs immediately. The key is
 * public by design: engines confirm ownership by fetching it from the site.
 */
export const indexNowKey = '481682275ef842516a0fa50be7d28160'
export const indexNowKeyLocation = `${siteUrl}/${indexNowKey}.txt`
const endpoint = 'https://api.indexnow.org/indexnow'
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

/** Submits URLs; 200 and 202 mean accepted. Returns each batch's status. */
export async function submitToIndexNow(urls: string[]) {
  const statuses: number[] = []
  for (const payload of indexNowPayloads(urls)) {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'content-type': 'application/json; charset=utf-8' },
      body: JSON.stringify(payload)
    })
    statuses.push(response.status)
  }
  return statuses
}
