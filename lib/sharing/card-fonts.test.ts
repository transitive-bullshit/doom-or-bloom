import { readFileSync, readdirSync } from 'node:fs'
import { describe, expect, test } from 'vitest'
import coverage from './fonts/coverage.json'
import { cardFontFamilies, cardFonts } from './card-fonts'
import { cardRenderOptions, wrappable } from './card-renderer'

/** Every character of a locale's catalog and authored translations. */
function catalogCharacters(locale: string) {
  let text = readFileSync(`messages/${locale}.json`, 'utf8')
  for (const kind of ['releases', 'rubrics'])
    for (const file of readdirSync(`content/l10n/${locale}/${kind}`))
      text += readFileSync(`content/l10n/${locale}/${kind}/${file}`, 'utf8')
  return new Set(text)
}

describe('share card fonts', () => {
  test('cover every character their locales’ catalogs use', () => {
    for (const font of cardFonts) {
      const covered = new Set(coverage[font.family])
      const missing = font.locales
        .flatMap((locale) => [...catalogCharacters(locale)])
        .filter((char) => font.script.test(char) && !covered.has(char))
      // Rerun `pnpm fonts:subset` when a translation adds a character.
      expect({ font: font.family, missing: [...new Set(missing)] }).toEqual({
        font: font.family,
        missing: []
      })
    }
  })

  test('only non-Latin scripts change the renderer, with their own font first', async () => {
    expect(cardFontFamilies('en')).toEqual([])
    expect(cardFontFamilies('de')).toEqual([])
    expect(await cardRenderOptions('es')).toEqual({})
    // Japanese and Chinese prefer their own Han forms.
    expect(cardFontFamilies('ja')[0]).toBe('Noto Sans JP')
    expect(cardFontFamilies('ja')).toContain('Noto Sans SC')
    expect(cardFontFamilies('zh')[0]).toBe('Noto Sans SC')
    expect(cardFontFamilies('zh')).toContain('Noto Sans JP')
    expect(cardFontFamilies('hi')[0]).toBe('Noto Sans Devanagari')
    const options = await cardRenderOptions('th')
    expect(options).toMatchObject({
      lang: 'th',
      fontFamilies: expect.arrayContaining(['Noto Sans Thai'])
    })
  })

  test('mark Thai word boundaries so lines can break', () => {
    expect(wrappable('โลกทัศน์ของฉัน', 'th')).toContain('​')
    expect(wrappable('โลกทัศน์ของฉัน', 'th').replaceAll('​', '')).toBe(
      'โลกทัศน์ของฉัน'
    )
    expect(wrappable('自分のAI世界観', 'ja')).toBe('自分のAI世界観')
  })
})

test('Thai card messages wrap and keep their translator methods', async () => {
  const { testTranslator } = await import('@/i18n/test-translator')
  const { cardTranslator } = await import('./card-renderer')
  const thai = testTranslator('th')
  const t = cardTranslator(thai, 'th')
  expect(t('Cards.myWorldview')).toContain('​')
  expect(t('Cards.myWorldview').replaceAll('​', '')).toBe(
    thai('Cards.myWorldview')
  )
  expect(t.has('Cards.myWorldview')).toBe(true)
  expect(cardTranslator(thai, 'ja')).toBe(thai)
})
