import { readFileSync } from 'node:fs'
import { createTranslator } from 'next-intl'
import { describe, expect, it } from 'vitest'
import { locales } from './config'
import {
  flattenMessages as flatten,
  messageSignature as shape,
  type Catalog
} from './message-checks'

function load(locale: string): Catalog {
  return JSON.parse(
    readFileSync(new URL(`../messages/${locale}.json`, import.meta.url), 'utf8')
  )
}

const byKey = (entries: Map<string, string>) =>
  Object.fromEntries(
    [...entries].map(([key, message]) => [key, shape(message)])
  )

// Sample values that exercise every argument of a message.
function sampleValues(message: string) {
  const values: Record<string, unknown> = {}
  for (const argument of shape(message).arguments) {
    const [name, type] = argument.split(':')
    values[name!] = type === 'plural' || type === 'selectordinal' ? 2 : 'x'
  }
  for (const tag of shape(message).tags)
    values[tag] = (chunks: string) => chunks
  return values
}

describe('message catalogs', () => {
  const english = flatten(load('en'))

  it('parse in English with every select and plural ending in other', () => {
    for (const [key, shapes] of Object.entries(byKey(english))) {
      expect({ key, ...shapes }).toMatchObject({
        empty: false,
        missingOther: []
      })
    }
  })

  for (const locale of locales.filter((locale) => locale !== 'en'))
    it(`${locale} has every English key with the same arguments and tags`, () => {
      const translated = byKey(flatten(load(locale)))
      expect(translated).toEqual(byKey(english))
    })

  for (const locale of locales)
    it(`${locale} messages format without errors`, () => {
      const messages = load(locale)
      const errors: string[] = []
      const t = createTranslator({
        locale,
        messages,
        onError: (error) => errors.push(error.message)
      })
      for (const [key, message] of flatten(messages)) {
        const output = t.markup(key as never, sampleValues(message) as never)
        expect({ key, output }).not.toEqual({ key, output: key })
      }
      expect(errors).toEqual([])
    })
})
