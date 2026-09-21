import { readFile } from 'node:fs/promises'
import sharp from 'sharp'
import { expect, test } from 'vitest'
import previews from './resource-previews.json'

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
