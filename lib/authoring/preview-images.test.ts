import { expect, test } from 'vitest'
import { previewImages } from './preview-images'

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
