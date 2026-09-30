import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { locales } from './config'

type Catalog = { [key: string]: string | Catalog }

function load(locale: string): Catalog {
  return JSON.parse(
    readFileSync(new URL(`../messages/${locale}.json`, import.meta.url), 'utf8')
  )
}

function flatten(catalog: Catalog, prefix = ''): Map<string, string> {
  const entries = new Map<string, string>()
  for (const [key, value] of Object.entries(catalog)) {
    const path = prefix ? `${prefix}.${key}` : key
    if (typeof value === 'string') entries.set(path, value)
    else for (const entry of flatten(value, path)) entries.set(...entry)
  }
  return entries
}

// Top-level ICU argument names, e.g. {name} or {count, plural, …}.
const placeholders = (message: string) =>
  [...message.matchAll(/\{(\w+)(?=[,}])/g)]
    .map((match) => match[1]!)
    .toSorted((a, b) => a.localeCompare(b))
const byKey = (entries: Map<string, string>) =>
  Object.fromEntries(
    [...entries].map(([key, message]) => [
      key,
      { empty: !message.trim(), arguments: placeholders(message) }
    ])
  )

describe('message catalogs', () => {
  const english = flatten(load('en'))

  for (const locale of locales.filter((locale) => locale !== 'en'))
    it(`${locale} has every English key with the same arguments`, () => {
      expect(byKey(flatten(load(locale)))).toEqual(byKey(english))
    })
})
