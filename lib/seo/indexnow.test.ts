import { readFileSync } from 'node:fs'
import { expect, test } from 'vitest'
import { siteUrl } from '@/lib/site'
import {
  changedSince,
  indexNowKey,
  indexNowKeyLocation,
  indexNowPayloads,
  indexNowStatus,
  sitemapEntries
} from './indexnow'

test('the public key file serves the IndexNow key', () => {
  expect(readFileSync(`public/${indexNowKey}.txt`, 'utf8').trim()).toBe(
    indexNowKey
  )
  expect(indexNowKeyLocation).toBe(`${siteUrl}/${indexNowKey}.txt`)
})

test('payloads keep only the site host, deduplicated', () => {
  const [payload] = indexNowPayloads([
    `${siteUrl}/p-doom`,
    `${siteUrl}/p-doom`,
    'https://example.com/elsewhere'
  ])
  expect(payload).toEqual({
    host: new URL(siteUrl).host,
    key: indexNowKey,
    keyLocation: indexNowKeyLocation,
    urlList: [`${siteUrl}/p-doom`]
  })
})

const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">
<url>
<loc>${siteUrl}/</loc>
<xhtml:link rel="alternate" hreflang="en" href="${siteUrl}/" />
</url>
<url>
<loc>${siteUrl}/blog/a-post</loc>
<xhtml:link rel="alternate" hreflang="es" href="${siteUrl}/es/blog/a-post" />
<lastmod>2026-10-04</lastmod>
</url>
<url>
<loc>${siteUrl}/users/someone</loc>
<lastmod>2026-10-06T01:42:23.746Z</lastmod>
</url>
</urlset>`

test('sitemap entries keep each URL with its lastmod, if any', () => {
  expect(sitemapEntries(sitemap)).toEqual([
    { url: `${siteUrl}/` },
    { url: `${siteUrl}/blog/a-post`, lastmod: '2026-10-04' },
    { url: `${siteUrl}/users/someone`, lastmod: '2026-10-06T01:42:23.746Z' }
  ])
})

test('changed URLs are those modified after the cutoff; a bare date counts for its whole day', () => {
  const changed = (since: string) =>
    changedSince(sitemapEntries(sitemap), new Date(since)).map(({ url }) =>
      url.replace(siteUrl, '')
    )
  expect(changed('2026-10-06T01:00:00Z')).toEqual(['/users/someone'])
  expect(changed('2026-10-06T02:00:00Z')).toEqual([])
  // A post dated the 4th may have been published late that day.
  expect(changed('2026-10-04T23:00:00Z')).toEqual([
    '/blog/a-post',
    '/users/someone'
  ])
  expect(changed('2026-10-05T00:00:00Z')).toEqual(['/users/someone'])
})

test('only 200 and 202 count as accepted', () => {
  expect(indexNowStatus(200).accepted).toBe(true)
  expect(indexNowStatus(202).accepted).toBe(true)
  for (const status of [400, 403, 422, 429, 500])
    expect(indexNowStatus(status).accepted).toBe(false)
  expect(indexNowStatus(403).meaning).toMatch(/key/)
  expect(indexNowStatus(422).meaning).toMatch(/key/)
})
