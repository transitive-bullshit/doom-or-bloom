import { expect, test } from 'vitest'
import sharp from 'sharp'
import { bookmarkTitleCard, bookmarkSiteMark } from './bookmark-title-card'

test('local fallback cards escape source titles and render valid images', async () => {
  const svg = bookmarkTitleCard(
    'AI & safety <script> "future"',
    'https://example.com/article'
  )
  expect(svg).toContain('AI &amp; safety &lt;script&gt;')
  expect(svg).not.toContain('<script>')
  expect((await sharp(Buffer.from(svg)).metadata()).width).toBe(640)
  expect(
    (
      await sharp(
        Buffer.from(bookmarkSiteMark('https://www.example.com'))
      ).metadata()
    ).width
  ).toBe(64)
})
