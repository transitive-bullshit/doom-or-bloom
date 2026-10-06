// Tells IndexNow engines (Bing, Yandex and others) about changed pages. The
// IndexNow workflow runs it after every production deploy and daily with
// --changed-since. See docs/MEASUREMENT.md#search-engines.
//
//   pnpm seo:indexnow                          every URL in the production sitemap
//   pnpm seo:indexnow --changed-since <date>   sitemap URLs whose lastmod is newer
//   pnpm seo:indexnow --url <url> ...          specific URLs
//   pnpm seo:indexnow --dry-run                print what would be sent
import { parseArgs } from 'node:util'
import {
  changedSince,
  indexNowEndpoints,
  indexNowKey,
  indexNowKeyLocation,
  indexNowPayloads,
  indexNowStatus,
  sitemapEntries,
  submitToIndexNow
} from '../lib/seo/indexnow'
import { siteUrl } from '../lib/site'

const { values } = parseArgs({
  options: {
    url: { type: 'string', multiple: true },
    'changed-since': { type: 'string' },
    'dry-run': { type: 'boolean', default: false }
  }
})

const since = values['changed-since']
const cutoff = since === undefined ? null : new Date(since)
if (cutoff && !Number.isFinite(cutoff.getTime()))
  throw new Error(`--changed-since needs an ISO date or time, not "${since}"`)
if (cutoff && values.url?.length)
  throw new Error('Use either --url or --changed-since, not both')

async function sitemap() {
  const response = await fetch(`${siteUrl}/sitemap.xml`)
  if (!response.ok) throw new Error(`sitemap.xml returned ${response.status}`)
  return sitemapEntries(await response.text())
}

const key = await fetch(indexNowKeyLocation)
if (!key.ok || (await key.text()).trim() !== indexNowKey)
  throw new Error(`${indexNowKeyLocation} does not serve the IndexNow key yet`)
const urls = values.url?.length
  ? values.url
  : cutoff
    ? changedSince(await sitemap(), cutoff).map(({ url }) => url)
    : (await sitemap()).map(({ url }) => url)
const payloads = indexNowPayloads(urls)
const count = payloads.reduce((sum, payload) => sum + payload.urlList.length, 0)
const scope = cutoff ? ` changed since ${cutoff.toISOString()}` : ''
for (const payload of payloads)
  for (const url of payload.urlList) console.log(url)
if (count === 0) {
  console.log(`No URLs${scope} to submit.`)
} else if (values['dry-run']) {
  console.log(
    `Would submit ${count} URLs${scope} to ${indexNowEndpoints.join(' and ')} in ${payloads.length} request(s) each.`
  )
} else {
  const results = await submitToIndexNow(urls)
  console.log(`Submitted ${count} URLs${scope}:`)
  for (const { endpoint, status } of results) {
    const { accepted, meaning } = indexNowStatus(status)
    console.log(`  ${endpoint}: HTTP ${status} (${meaning})`)
    if (!accepted) process.exitCode = 1
  }
}
