import { readFile } from 'node:fs/promises'
import sharp from 'sharp'
import { expect, test } from 'vitest'
import previews from './resource-previews.json'
import { personas } from '../journeys/catalog'
import { tweetIdFromUrl } from './tweet-url'

test('resource icons are valid local WebPs, including Marginal Revolution', async () => {
  for (const [, entry] of Object.entries(previews).filter(
    ([url]) => new URL(url).hostname === 'marginalrevolution.com'
  ))
    expect((entry as { icon?: string }).icon).toBeDefined()
  for (const entry of Object.values(previews)) {
    const icon = (entry as { icon?: string }).icon
    if (!icon) continue
    expect(icon).toMatch(/^\/resource-previews\/[\w-]+\.webp$/)
    const data = await readFile(`public${icon}`)
    const image = sharp(data)
    expect((await image.metadata()).format).toBe('webp')
    await image.raw().toBuffer()
  }
})

test('every authored non-tweet source has local bookmark artwork and a description', async () => {
  const catalog = previews as Record<
    string,
    { image?: string; icon?: string; description?: string | null }
  >
  for (const source of personas.flatMap((person) => person.sources)) {
    expect(new URL(source.url).hostname).not.toBe('independent.prose.md')
    if (tweetIdFromUrl(source.url)) continue
    const preview = catalog[source.url]
    expect(preview?.image).toMatch(/^\/resource-previews\/[\w-]+\.webp$/)
    expect(preview?.icon).toMatch(/^\/resource-previews\/[\w-]+\.webp$/)
    expect(source.summary || preview?.description).toBeTruthy()
    await readFile(`public${preview!.image}`)
    await readFile(`public${preview!.icon}`)
  }
})
