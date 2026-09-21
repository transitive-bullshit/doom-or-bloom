import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { createHash } from 'node:crypto'
import pMap from 'p-map'

// Offline authoring step: readers never contact third-party image servers.
const resources: Array<{ url: string }> = JSON.parse(
  await readFile('content/releases/0.4.0-draft/resources.json', 'utf8')
)
const suite = JSON.parse(
  await readFile('eval/development/live-persona-journeys.json', 'utf8')
)
for (const journey of suite.journeys) {
  resources.push(...journey.result.resources)
  resources.push(...(journey.personaSnapshot?.sources ?? []))
}
const previous = JSON.parse(
  await readFile('lib/sharing/resource-previews.json', 'utf8').catch(() => '{}')
) as Record<
  string,
  { image?: string; icon?: string; fetchedAt: string; source: string }
>
const urls = [...new Set(resources.map((resource) => resource.url))]
await mkdir('public/resource-previews', { recursive: true })
const decode = (value: string) =>
  value
    .replaceAll('&amp;', '&')
    .replaceAll('&quot;', '"')
    .replaceAll('&#39;', "'")
const attributes = (tag: string) =>
  Object.fromEntries(
    [...tag.matchAll(/([\w:-]+)\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+))/g)].map(
      (match) => [
        match[1]!.toLowerCase(),
        decode(match[2] ?? match[3] ?? match[4] ?? '')
      ]
    )
  )
const request = (url: string) =>
  fetch(url, {
    signal: AbortSignal.timeout(20000),
    headers: {
      'User-Agent': 'Mozilla/5.0 (compatible; DoomOrBloomPreview/1.0)'
    }
  })
const asset = async (url: string, key: string) => {
  const response = await request(url)
  if (!response.ok) throw new Error(`HTTP ${response.status}`)
  const type = response.headers.get('content-type')?.split(';')[0] ?? ''
  const extension = (
    {
      'image/png': 'png',
      'image/jpeg': 'jpg',
      'image/webp': 'webp',
      'image/svg+xml': 'svg',
      'image/x-icon': 'ico',
      'image/vnd.microsoft.icon': 'ico',
      'image/avif': 'avif',
      'image/gif': 'gif'
    } as Record<string, string>
  )[type]
  if (!extension) throw new Error(`Unsupported image type ${type}`)
  const bytes = new Uint8Array(await response.arrayBuffer())
  if (bytes.length > 4_000_000) throw new Error('Preview image is too large')
  const file = `/resource-previews/${key}.${extension}`
  await writeFile(`public${file}`, bytes)
  return file
}
const entries = await pMap(
  urls,
  async (url) => {
    if (
      previous[url]?.image &&
      previous[url]?.icon &&
      !process.argv.includes('--refresh')
    )
      return [url, previous[url]!] as const
    const key = createHash('sha256').update(url).digest('hex').slice(0, 12)
    const entry: {
      image?: string
      icon?: string
      fetchedAt: string
      source: string
    } = { ...previous[url], fetchedAt: new Date().toISOString(), source: url }
    try {
      const response = await request(url)
      if (!response.ok) throw new Error(`HTTP ${response.status}`)
      const html = await response.text()
      const meta = [...html.matchAll(/<meta\b[^>]*>/gi)].map((match) =>
        attributes(match[0])
      )
      const image =
        meta.find((tag) => tag.property === 'og:image')?.content ??
        meta.find((tag) => tag.name === 'twitter:image')?.content
      const links = [...html.matchAll(/<link\b[^>]*>/gi)].map((match) =>
        attributes(match[0])
      )
      const icon =
        links.find((tag) => tag.rel === 'icon')?.href ??
        links.find((tag) => tag.rel === 'shortcut icon')?.href ??
        '/favicon.ico'
      const attempts = await Promise.allSettled([
        image
          ? asset(new URL(image, response.url).href, `${key}-image`)
          : Promise.resolve(undefined),
        asset(new URL(icon, response.url).href, `${key}-icon`)
      ])
      if (attempts[0].status === 'fulfilled' && attempts[0].value)
        entry.image = attempts[0].value
      if (attempts[1].status === 'fulfilled' && attempts[1].value)
        entry.icon = attempts[1].value
      console.log(
        new URL(url).hostname,
        entry.image ? 'image' : 'no image',
        entry.icon ? 'icon' : 'no icon'
      )
    } catch (err) {
      console.log(url, err instanceof Error ? err.message : 'Fetch failed')
    }
    if (!entry.icon) {
      try {
        entry.icon = await asset(
          `https://www.google.com/s2/favicons?domain=${new URL(url).hostname}&sz=128`,
          `${key}-icon`
        )
      } catch {
        /* Bookmark retains its local generic icon if the publisher icon is unavailable. */
      }
    }
    return [url, entry] as const
  },
  { concurrency: 4 }
)
await writeFile(
  'lib/sharing/resource-previews.json',
  JSON.stringify(Object.fromEntries(entries), null, 2) + '\n'
)
