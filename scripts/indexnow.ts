// Tells IndexNow engines (Bing, Yandex and others) about changed pages.
// Run it after a production deploy that adds or changes public pages, or
// after a simulated-user import. See docs/MEASUREMENT.md#search-engines.
//
//   pnpm seo:indexnow                  every URL in the production sitemap
//   pnpm seo:indexnow --url <url> ...  specific URLs
//   pnpm seo:indexnow --dry-run        print what would be sent
import { parseArgs } from 'node:util'
import {
  indexNowKey,
  indexNowKeyLocation,
  indexNowPayloads,
  submitToIndexNow
} from '../lib/seo/indexnow'
import { siteUrl } from '../lib/site'

const { values } = parseArgs({
  options: {
    url: { type: 'string', multiple: true },
    'dry-run': { type: 'boolean', default: false }
  }
})

async function sitemapUrls() {
  const response = await fetch(`${siteUrl}/sitemap.xml`)
  if (!response.ok) throw new Error(`sitemap.xml returned ${response.status}`)
  const xml = await response.text()
  return [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => match[1]!)
}

const key = await fetch(indexNowKeyLocation)
if (!key.ok || (await key.text()).trim() !== indexNowKey)
  throw new Error(`${indexNowKeyLocation} does not serve the IndexNow key yet`)
const urls = values.url?.length ? values.url : await sitemapUrls()
const payloads = indexNowPayloads(urls)
const count = payloads.reduce((sum, payload) => sum + payload.urlList.length, 0)
if (values['dry-run']) {
  console.log(`Would submit ${count} URLs in ${payloads.length} request(s).`)
} else {
  const statuses = await submitToIndexNow(urls)
  console.log(`Submitted ${count} URLs: HTTP ${statuses.join(', ')}`)
  if (statuses.some((status) => status !== 200 && status !== 202))
    process.exitCode = 1
}
