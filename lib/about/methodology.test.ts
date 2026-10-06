import { access } from 'node:fs/promises'
import { describe, expect, test } from 'vitest'
import messages from '@/messages/en.json'
import { sourceIcon } from '@/lib/sources/favicons'
import {
  methodologyChanges,
  methodologyCitations,
  methodologySources,
  methodologySourceUrls,
  repositoryUrl,
  sample
} from './methodology'

const strings = (value: unknown): string[] =>
  typeof value === 'string'
    ? [value]
    : Object.values(value as Record<string, unknown>).flatMap(strings)
const text = strings(messages.About.methodology)
const tags = new Set(
  text.flatMap((message) =>
    [...message.matchAll(/<([a-zA-Z]+)>/g)].map((match) => match[1]!)
  )
)
// Rich-text links rather than citations.
const links = new Set(['jev', 'post', 'research'])

describe('About methodology', () => {
  test('cites only known sources, and every source somewhere', () => {
    const sources = new Set(Object.keys(methodologySources))
    expect(
      [...tags].filter((tag) => !links.has(tag) && !sources.has(tag))
    ).toEqual([])
    // The chart note cites the review; changes cite in code.
    const cited = new Set([
      ...tags,
      'review',
      ...methodologyChanges.flatMap((change) =>
        'cite' in change ? [change.cite] : []
      )
    ])
    expect([...sources].filter((source) => !cited.has(source))).toEqual([])
  })

  test('numbers footnotes in source order', () => {
    const { numbers, footnotes } = methodologyCitations()
    expect(Object.values(numbers)).toEqual(footnotes.map((f) => f.number))
    expect(footnotes.map((f) => f.byline)).toEqual(
      footnotes.map((f) => [{ text: f.by }])
    )
  })

  test('links files that exist on this branch', async () => {
    const paths = Object.values(methodologySources)
      .map(({ url }) => url)
      .filter((url) => url.startsWith(repositoryUrl))
      .map((url) => url.slice(`${repositoryUrl}/blob/main/`.length))
      .map((path) => path.replace(/#.*/, ''))
    expect(paths.length).toBeGreaterThan(0)
    await Promise.all(paths.map((path) => access(path)))
  })

  test('shows a committed local favicon for every source', async () => {
    const icons = Object.values(methodologySources).map(({ url }) => ({
      url,
      icon: sourceIcon(url)
    }))
    expect(
      icons.filter(
        ({ icon }) => !/^\/resource-previews\/[\w-]+\.webp$/.test(icon ?? '')
      )
    ).toEqual([])
    await Promise.all(icons.map(({ icon }) => access(`public${icon}`)))
    expect(
      methodologySourceUrls().every((url) => !url.includes('github.com'))
    ).toBe(true)
  })

  test('lists changes newest first, each with a message', () => {
    const dates = methodologyChanges.map((change) => change.date)
    expect(dates).toEqual([...dates].sort().reverse())
    for (const change of methodologyChanges)
      expect(messages.About.methodology.changes[change.id]).toBeTruthy()
  })

  test('reads participant numbers that describe groups of 10 or more', () => {
    expect(sample.people).toBeGreaterThanOrEqual(10)
    expect(sample.feelsRight.n).toBeGreaterThanOrEqual(10)
    expect(sample.feelsRight.count).toBeGreaterThanOrEqual(10)
  })
})
