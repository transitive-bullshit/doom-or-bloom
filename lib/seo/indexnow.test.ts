import { readFileSync } from 'node:fs'
import { expect, test } from 'vitest'
import { siteUrl } from '@/lib/site'
import { indexNowKey, indexNowKeyLocation, indexNowPayloads } from './indexnow'

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
