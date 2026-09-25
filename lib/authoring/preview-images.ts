import { load } from 'cheerio'

export type PreviewCandidate = {
  url: string
  kind: 'social' | 'article'
}

/** Rank publisher-provided images, avoiding navigation icons and tracking pixels. */
export function previewImages(html: string, baseUrl: string) {
  const $ = load(html)
  const candidates: Array<PreviewCandidate & { score: number }> = []
  const add = (
    value: unknown,
    kind: PreviewCandidate['kind'],
    score: number
  ) => {
    if (typeof value !== 'string' || !value.trim()) return
    try {
      const url = new URL(value, baseUrl)
      if (!['https:', 'http:'].includes(url.protocol)) return
      if (/logo|favicon|ojs_brand|tracking|pixel\.gif/i.test(url.pathname))
        return
      candidates.push({ url: url.href, kind, score })
    } catch {
      /* Malformed publisher metadata is not a usable image. */
    }
  }
  $('meta').each((_, element) => {
    const key = (
      $(element).attr('property') ??
      $(element).attr('name') ??
      ''
    ).toLowerCase()
    if (
      [
        'og:image',
        'og:image:url',
        'og:image:secure_url',
        'twitter:image',
        'twitter:image:src'
      ].includes(key)
    )
      add($(element).attr('content'), 'social', 1000)
  })
  const structuredImage = (value: unknown) => {
    if (typeof value === 'string') add(value, 'article', 850)
    else if (Array.isArray(value)) value.forEach(structuredImage)
    else if (value && typeof value === 'object') {
      const image = value as Record<string, unknown>
      add(image.contentUrl ?? image.url, 'article', 850)
    }
  }
  const structuredArticle = (value: unknown) => {
    if (Array.isArray(value)) return value.forEach(structuredArticle)
    if (!value || typeof value !== 'object') return
    const entry = value as Record<string, unknown>
    if (
      /Article|BlogPosting|NewsArticle|VideoObject|WebPage/.test(
        String(entry['@type'])
      )
    )
      structuredImage(entry.image ?? entry.thumbnailUrl)
    if (entry['@graph']) structuredArticle(entry['@graph'])
  }
  $('script[type="application/ld+json"]').each((_, element) => {
    try {
      structuredArticle(JSON.parse($(element).text()))
    } catch {
      /* Ignore malformed JSON-LD. */
    }
  })
  $('video[poster]').each((_, element) =>
    add($(element).attr('poster'), 'article', 750)
  )
  $('img').each((index, element) => {
    const image = $(element)
    if (image.closest('nav, footer, aside, [role=navigation]').length) return
    const label = [
      image.attr('alt'),
      image.attr('class'),
      image.attr('id'),
      image.attr('src')
    ].join(' ')
    if (
      /logo|favicon|icon|avatar|tracking|pixel|badge|emoji|gravatar/i.test(
        label
      )
    )
      return
    const width = Number(image.attr('width'))
    const height = Number(image.attr('height'))
    if ((width > 0 && width < 240) || (height > 0 && height < 120)) return
    const content = image.closest('article, main, [role=main]').length > 0
    const hero = /hero|cover|featured|banner|masthead/i.test(label)
    const score =
      300 + (content ? 200 : 0) + (hero ? 150 : 0) - Math.min(index, 100)
    // Prefer the largest srcset candidate, then lazy-loaded and ordinary src.
    const srcset =
      image.attr('srcset') ??
      image.attr('data-srcset') ??
      image.closest('picture').find('source').first().attr('srcset')
    if (srcset) {
      const largest = srcset
        .split(',')
        .map((part) => {
          const [url, size] = part.trim().split(/\s+/)
          return { url, size: Number.parseFloat(size ?? '0') }
        })
        .sort((a, b) => b.size - a.size)[0]
      add(largest?.url, 'article', score + 1)
    }
    add(
      image.attr('data-src') ??
        image.attr('data-lazy-src') ??
        image.attr('src'),
      'article',
      score
    )
  })
  const seen = new Set<string>()
  return candidates
    .sort((a, b) => b.score - a.score)
    .filter(({ url }) => {
      if (seen.has(url)) return false
      seen.add(url)
      return true
    })
    .map(({ url, kind }) => ({ url, kind }))
}

export function previewIcons(html: string, baseUrl: string) {
  const $ = load(html)
  const values = $(
    'link[rel="apple-touch-icon"], link[rel="icon"], link[rel="shortcut icon"]'
  )
    .toArray()
    .map((node) => $(node).attr('href'))
    .filter((value): value is string => Boolean(value))
  // PNG/SVG touch icons decode reliably; ICO is not supported by every image runtime.
  values.sort(
    (a, b) =>
      Number(/\.ico(?:[?#]|$)/i.test(a)) - Number(/\.ico(?:[?#]|$)/i.test(b))
  )
  return [
    ...new Set(
      [...values, '/apple-touch-icon.png', '/favicon.ico'].flatMap((value) => {
        try {
          const url = new URL(value, baseUrl)
          return ['https:', 'http:'].includes(url.protocol) ? [url.href] : []
        } catch {
          return []
        }
      })
    )
  ]
}

export function previewDocument(html: string, baseUrl: string) {
  const $ = load(html)
  const value =
    $('meta[name="citation_pdf_url"]').attr('content') ??
    $('a[type="application/pdf"]').first().attr('href')
  if (!value) return undefined
  try {
    const url = new URL(value, baseUrl)
    return ['https:', 'http:'].includes(url.protocol) ? url.href : undefined
  } catch {
    return undefined
  }
}

/** Prefer the article's HTML description, then social metadata. */
export function previewDescription(html: string): string | null {
  const $ = load(html)
  for (const selector of [
    'meta[name="description" i]',
    'meta[property="og:description" i]',
    'meta[name="twitter:description" i]'
  ]) {
    const description = $(selector)
      .first()
      .attr('content')
      ?.replace(/\s+/g, ' ')
      .trim()
    if (description) return description
  }
  return null
}

/** YouTube's publisher oEmbed endpoint supplies a thumbnail without watch-page JS. */
export function youtubeOembedUrl(source: string) {
  const url = new URL(source)
  const host = url.hostname.replace(/^www\./, '').replace(/^m\./, '')
  const id =
    host === 'youtu.be'
      ? url.pathname.slice(1)
      : host === 'youtube.com'
        ? (url.searchParams.get('v') ??
          url.pathname.match(/^\/(?:shorts|embed|live)\/([\w-]+)/)?.[1])
        : null
  if (!id || !/^[\w-]{11}$/.test(id)) return null
  return `https://www.youtube.com/oembed?${new URLSearchParams({ url: `https://www.youtube.com/watch?v=${id}`, format: 'json' })}`
}

/** Embedded episode videos often carry the only article-specific preview. */
export function embeddedYoutubeOembedUrl(html: string, baseUrl: string) {
  const $ = load(html)
  for (const element of $('iframe[src]').toArray()) {
    try {
      const endpoint = youtubeOembedUrl(
        new URL($(element).attr('src')!, baseUrl).href
      )
      if (endpoint) return endpoint
    } catch {
      /* Ignore malformed embeds. */
    }
  }
  return null
}
