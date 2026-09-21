import {
  mkdir,
  readFile,
  writeFile,
  unlink,
  mkdtemp,
  rm
} from 'node:fs/promises'
import { execFile } from 'node:child_process'
import { promisify } from 'node:util'
import { tmpdir } from 'node:os'
import { createHash } from 'node:crypto'
import path from 'node:path'
import pMap from 'p-map'
import sharp from 'sharp'
import { personas } from '../lib/journeys/catalog'
import { tweetIdFromUrl } from '../lib/sharing/tweet-url'
import {
  previewImages,
  previewIcon,
  previewDocument,
  previewDescription
} from '../lib/authoring/preview-images'

type Preview = {
  description?: string | null
  image?: string
  icon?: string
  fetchedAt: string
  source: string
  imageKind?: 'social' | 'article' | 'screenshot' | 'document'
  imageSource?: string
}
const argument = (name: string) =>
  process.argv
    .find((value) => value.startsWith(`--${name}=`))
    ?.slice(name.length + 3)
const captureDirectory = argument('captures')
const only = argument('url')
const refresh = process.argv.includes('--refresh')
const resources: Array<{ url: string; title?: string }> = JSON.parse(
  await readFile('content/releases/0.4.0-draft/resources.json', 'utf8')
)
const suite = JSON.parse(
  await readFile('eval/development/live-persona-journeys.json', 'utf8')
)
for (const journey of suite.journeys) {
  resources.push(
    ...journey.result.resources,
    ...(journey.personaSnapshot?.sources ?? [])
  )
}
for (const persona of personas) resources.push(...persona.sources)
const previous: Record<string, Preview> = JSON.parse(
  await readFile('lib/sharing/resource-previews.json', 'utf8').catch(() => '{}')
)
const overrides: Record<
  string,
  { image?: string; preferScreenshot?: boolean; note: string }
> = JSON.parse(
  await readFile('lib/sharing/resource-preview-overrides.json', 'utf8').catch(
    () => '{}'
  )
)
const unique = new Map(
  resources
    .filter(({ url }) => !tweetIdFromUrl(url))
    .map((resource) => [resource.url, resource])
)
const urls = only ? [only] : [...unique.keys()]
await mkdir('public/resource-previews', { recursive: true })
const request = (url: string) =>
  fetch(url, {
    signal: AbortSignal.timeout(15000)
  })
const bytes = async (url: string) => {
  const response = await request(url)
  if (!response.ok) throw new Error(`HTTP ${response.status}`)
  if (Number(response.headers.get('content-length')) > 16_000_000)
    throw new Error('Image too large')
  const data = Buffer.from(await response.arrayBuffer())
  if (data.length > 16_000_000) throw new Error('Image too large')
  return { data, type: response.headers.get('content-type') ?? '' }
}
const saveImage = async (data: Buffer, key: string, document = false) => {
  const image = sharp(data, { limitInputPixels: 40_000_000, animated: false })
  const metadata = await image.metadata()
  if (
    !metadata.width ||
    !metadata.height ||
    metadata.width < 240 ||
    metadata.height < 120 ||
    metadata.width / metadata.height > 4
  )
    throw new Error('Image is too small or banner-shaped for a preview')
  const file = `/resource-previews/${key}-image.webp`
  await image
    .rotate()
    .resize(640, 400, {
      fit: 'cover',
      position: document ? 'north' : sharp.strategy.attention,
      withoutEnlargement: true
    })
    .webp({ quality: 78 })
    .toFile(`public${file}`)
  return file
}
// Poppler is optional; unavailable installations retain the ordinary bookmark.
const documentPreview = async (data: Buffer, key: string) => {
  const directory = await mkdtemp(path.join(tmpdir(), 'doom-preview-'))
  try {
    const pdf = path.join(directory, 'source.pdf')
    const prefix = path.join(directory, 'page')
    await writeFile(pdf, data)
    await promisify(execFile)(
      'pdftoppm',
      ['-f', '1', '-singlefile', '-scale-to', '1200', '-png', pdf, prefix],
      { timeout: 15000 }
    )
    return await saveImage(await readFile(`${prefix}.png`), key, true)
  } finally {
    await rm(directory, { recursive: true, force: true })
  }
}
const saveIcon = async (url: string, key: string) => {
  const { data, type } = await bytes(url)
  const extension = type.includes('svg')
    ? 'svg'
    : type.includes('icon')
      ? 'ico'
      : undefined
  const file = `/resource-previews/${key}-icon.${extension ?? 'webp'}`
  if (extension) await writeFile(`public${file}`, data)
  else
    await sharp(data, { limitInputPixels: 40_000_000 })
      .resize(64, 64, { fit: 'inside' })
      .webp({ quality: 80 })
      .toFile(`public${file}`)
  return file
}
const failures: Record<string, string> = {}
const obsolete = new Set<string>()
const entries = await pMap(
  urls,
  async (url) => {
    const key = createHash('sha256').update(url).digest('hex').slice(0, 12)
    const entry: Preview = {
      ...previous[url],
      source: url,
      fetchedAt: previous[url]?.fetchedAt ?? new Date().toISOString()
    }
    if (entry.image && !entry.image.endsWith('.webp')) {
      try {
        const old = entry.image
        entry.image = await saveImage(await readFile(`public${old}`), key)
        obsolete.add(old)
      } catch {
        /* Keep a usable cached image if conversion is not possible. */
      }
    }
    if (
      entry.image &&
      entry.icon &&
      entry.description !== undefined &&
      !refresh
    )
      return [url, entry] as const
    entry.fetchedAt = new Date().toISOString()
    let html = ''
    let baseUrl = url
    try {
      const response = await request(url)
      if (!response.ok) throw new Error(`HTTP ${response.status}`)
      baseUrl = response.url
      if (response.headers.get('content-type')?.includes('text/html'))
        html = await response.text()
      else if (
        response.headers.get('content-type')?.includes('application/pdf') &&
        (!entry.image || refresh)
      ) {
        const data = Buffer.from(await response.arrayBuffer())
        if (data.length < 16_000_000) {
          entry.image = await documentPreview(data, key)
          entry.imageKind = 'document'
          entry.imageSource = url
        }
      }
    } catch (err) {
      failures[url] = err instanceof Error ? err.message : 'Fetch failed'
    }
    // Browser-rendered DOM can be imported for JS-only article pages.
    if (captureDirectory)
      html = await readFile(
        path.join(captureDirectory, `${key}.html`),
        'utf8'
      ).catch(() => html)
    if (html) entry.description = previewDescription(html)
    if (!entry.image || refresh) {
      const candidates = overrides[url]?.preferScreenshot
        ? []
        : previewImages(html, baseUrl)
      if (overrides[url]?.image)
        candidates.unshift({ url: overrides[url].image!, kind: 'article' })
      for (const candidate of candidates.slice(0, 10)) {
        try {
          entry.image = await saveImage((await bytes(candidate.url)).data, key)
          entry.imageKind = candidate.kind
          entry.imageSource = candidate.url
          break
        } catch {
          /* Try the next publisher-provided candidate. */
        }
      }
      const paper = previewDocument(html, baseUrl)
      if (!entry.image && paper) {
        try {
          entry.image = await documentPreview((await bytes(paper)).data, key)
          entry.imageKind = 'document'
          entry.imageSource = paper
        } catch {
          /* Keep screenshot and bookmark fallbacks available. */
        }
      }
      // A reviewed browser screenshot is preferable to an invented illustration.
      if (!entry.image && captureDirectory) {
        try {
          entry.image = await saveImage(
            await readFile(path.join(captureDirectory, `${key}.png`)),
            key,
            true
          )
          entry.imageKind = 'screenshot'
          entry.imageSource = url
        } catch {
          /* Uncaptured or blocked pages keep the normal bookmark fallback. */
        }
      }
    }
    if (!entry.icon) {
      for (const iconUrl of [
        previewIcon(html, baseUrl),
        `https://www.google.com/s2/favicons?domain=${new URL(url).hostname}&sz=128`
      ]) {
        try {
          entry.icon = await saveIcon(iconUrl, key)
          break
        } catch {
          /* Try publisher-icon fallback. */
        }
      }
    }
    console.log(`${entry.image ? 'preview' : 'missing'} ${url}`)
    return [url, entry] as const
  },
  { concurrency: 4 }
)
const combined = { ...previous, ...Object.fromEntries(entries) }
await writeFile(
  'lib/sharing/resource-previews.json',
  JSON.stringify(combined, null, 2) + '\n'
)
const retained = new Set(
  Object.values(combined).flatMap((entry) => [entry.image, entry.icon])
)
for (const file of obsolete)
  if (!retained.has(file)) await unlink(`public${file}`).catch(() => {})
const missing = [...unique.values()]
  .filter(({ url }) => !combined[url]?.image)
  .map(({ url, title }) => {
    const gap: {
      url: string
      title?: string
      captureKey: string
      error?: string
    } = {
      url,
      title,
      captureKey: createHash('sha256').update(url).digest('hex').slice(0, 12)
    }
    if (failures[url]) gap.error = failures[url]
    return gap
  })
await writeFile(
  'docs/research/resource-preview-gaps.json',
  JSON.stringify(missing, null, 2) + '\n'
)
console.log(
  JSON.stringify({
    total: unique.size,
    withImages: unique.size - missing.length,
    missing: missing.length
  })
)
