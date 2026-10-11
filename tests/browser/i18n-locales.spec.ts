import { readFileSync } from 'node:fs'
import { expect, test } from './fixtures'

// Every enabled language: the home page declares its language tag, the
// interview opens on the translated root question, and cards in non-Latin
// scripts reach the locale-specific image endpoints.

const locales = [
  ['es', 'es'],
  ['pt', 'pt-BR'],
  ['hi', 'hi'],
  ['zh', 'zh-Hans'],
  ['th', 'th'],
  ['ja', 'ja'],
  ['de', 'de'],
  ['fr', 'fr'],
  ['id', 'id']
] as const
const rootQuestion = (code: string) =>
  (
    JSON.parse(
      readFileSync(`content/l10n/${code}/releases/0.4.0-draft.json`, 'utf8')
    ) as { entries: Record<string, { text: string }> }
  ).entries['prompt:root:text']!.text

for (const [code, tag] of locales)
  test(`${code}: home declares ${tag} and the interview asks the translated root question`, async ({
    page
  }) => {
    const problems: string[] = []
    page.on('console', (message) => {
      if (
        /MISSING_MESSAGE|FORMATTING_ERROR|INVALID_MESSAGE/u.test(message.text())
      )
        problems.push(message.text())
    })
    page.on('pageerror', (error) => problems.push(error.message))
    await page.goto(`/${code}`)
    await expect(page.locator('html')).toHaveAttribute('lang', tag)
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
    await expect(
      page.locator(`head link[rel="alternate"][hreflang="${tag}"]`)
    ).toHaveAttribute('href', `https://www.doom-or-bloom.com/${code}`)

    await page.goto(`/${code}/assessments?start=1`)
    await expect(page).toHaveURL(
      new RegExp(`/${code}/assessments/[a-f0-9-]+$`, 'u')
    )
    await expect(page.locator('html')).toHaveAttribute('lang', tag)
    await expect(page.getByRole('heading', { level: 2 }).first()).toHaveText(
      rootQuestion(code)
    )
    expect(problems).toEqual([])
  })

test('share-card HTTP locale selection changes the rendered card and Japanese profiles export PNGs', async ({
  page,
  baseURL
}) => {
  const data = {
    horizontal: 0.6,
    vertical: 0.5,
    horizontalRange: [0.5, 0.7],
    verticalRange: [0.4, 0.6],
    pdoom: 0.12,
    pdoomToken: '≈12%',
    provisional: false,
    generatedAt: '2026-10-01T00:00:00Z',
    closestPersonaIds: []
  }
  const cards = await Promise.all(
    ['en', 'hi'].map((locale) =>
      page.request.post(`/api/share-card?locale=${locale}`, {
        headers: { origin: baseURL! },
        data
      })
    )
  )
  for (const card of cards) {
    expect(card.status()).toBe(200)
    expect(card.headers()['content-type']).toBe('image/png')
  }
  // Equivalent inputs isolate the locale query's effect through actual HTTP.
  // Decoding/dimensions belong to png-export.test.ts; this is no glyph claim.
  expect(await cards[1]!.body()).not.toEqual(await cards[0]!.body())

  const profile = await page.request.get(
    '/users/jensenhuang/opengraph-image?v=png-1&locale=ja'
  )
  expect(profile.status()).toBe(200)
  expect(profile.headers()['content-type']).toBe('image/png')
  const png = await profile.body()
  expect(png.subarray(1, 4).toString('latin1')).toBe('PNG')
  expect([png.readUInt32BE(16), png.readUInt32BE(20)]).toEqual([1200, 630])
})
