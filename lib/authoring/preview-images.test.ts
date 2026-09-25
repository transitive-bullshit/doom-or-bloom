import { expect, test } from 'vitest'
import {
  previewImages,
  previewDescription,
  embeddedYoutubeOembedUrl,
  previewIcons,
  youtubeOembedUrl
} from './preview-images'

test('social metadata wins; structured article and responsive hero images survive missing metadata', () => {
  const html = `<meta name="twitter:image" content="/social.jpg">
  <script type="application/ld+json">{"@graph":[{"@type":"NewsArticle","image":{"url":"/article.jpg"}}]}</script>
  <nav><img src="/navigation.jpg" width="800"></nav>
  <img src="/tracking.gif" width="1">
  <main><img class="hero" src="/small.jpg" srcset="/medium.jpg 640w, /large.jpg 1200w">
  <img src="/author-avatar.jpg"></main>`
  expect(previewImages(html, 'https://example.com/story')).toEqual([
    { url: 'https://example.com/social.jpg', kind: 'social' },
    { url: 'https://example.com/article.jpg', kind: 'article' },
    { url: 'https://example.com/large.jpg', kind: 'article' },
    { url: 'https://example.com/small.jpg', kind: 'article' }
  ])
})

test('bad metadata does not hide usable lazy images or video posters', () => {
  expect(
    previewImages(
      `<meta property="og:image" content="javascript:bad()"><script type="application/ld+json">broken</script><video poster="/poster.jpg"></video><article><img data-src="/photo.jpg" src="data:image/gif;base64,a"></article>`,
      'https://example.com'
    )
  ).toEqual([
    { url: 'https://example.com/poster.jpg', kind: 'article' },
    { url: 'https://example.com/photo.jpg', kind: 'article' }
  ])
})

test('descriptions prefer HTML metadata, decode entities and fall back to social metadata', () => {
  expect(
    previewDescription(
      '<meta property="og:description" content="Social"><meta name="description" content="  Science &amp;   progress  ">'
    )
  ).toBe('Science & progress')
  expect(
    previewDescription(
      '<meta name="description" content=" "><meta property="og:description" content="Social">'
    )
  ).toBe('Social')
  expect(previewDescription('<p>No metadata</p>')).toBeNull()
})

test('YouTube preview lookup accepts video URL variants but not unrelated hosts or channels', () => {
  const expected = youtubeOembedUrl(
    'https://www.youtube.com/watch?v=pYXy-A4siMw'
  )
  expect(expected).toContain('https://www.youtube.com/oembed?')
  expect(youtubeOembedUrl('https://youtu.be/pYXy-A4siMw?t=12')).toBe(expected)
  expect(youtubeOembedUrl('https://m.youtube.com/shorts/pYXy-A4siMw')).toBe(
    expected
  )
  expect(
    youtubeOembedUrl('https://youtube.com.evil.test/watch?v=pYXy-A4siMw')
  ).toBeNull()
  expect(youtubeOembedUrl('https://youtube.com/@RobertMilesAI')).toBeNull()
})

test('embedded YouTube episodes supply publisher thumbnails and touch icons precede ICO files', () => {
  expect(
    embeddedYoutubeOembedUrl(
      '<iframe src="https://www.youtube.com/embed/DyZye1GZtfk"></iframe>',
      'https://theinsideview.ai/rob'
    )
  ).toBe(youtubeOembedUrl('https://youtu.be/DyZye1GZtfk'))
  expect(
    previewIcons(
      '<link rel="icon" href="/favicon.ico"><link rel="apple-touch-icon" href="/touch.png">',
      'https://example.com/story'
    )
  ).toEqual([
    'https://example.com/touch.png',
    'https://example.com/favicon.ico',
    'https://example.com/apple-touch-icon.png'
  ])
})
