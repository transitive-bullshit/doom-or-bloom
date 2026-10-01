import { readFileSync } from 'node:fs'
import { createTranslator } from 'next-intl'
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

/**
 * The ICU arguments (with their select/plural type) and rich-text tags a
 * message uses, including those nested in select and plural branches. Branch
 * keys may differ between languages, but every select or plural needs `other`.
 */
function shape(message: string) {
  const args = new Set<string>()
  const tags = new Set<string>()
  const missingOther: string[] = []
  let i = 0
  const rest = () => message.slice(i)
  const skipSpace = () => {
    while (/\s/u.test(message[i] ?? '')) i++
  }
  function parseMessage() {
    while (i < message.length && message[i] !== '}') {
      if (message[i] === '{') parseArgument()
      else if (message[i] === '<') {
        const tag = /^<\/?([a-z][\w-]*)\s*\/?>/iu.exec(rest())
        if (tag) {
          tags.add(tag[1]!)
          i += tag[0].length
        } else i++
      } else i++
    }
  }
  function parseArgument() {
    i++
    const header = /^\s*(\w+)\s*(?:,\s*(\w+)\s*)?/u.exec(rest())
    if (!header) throw new Error(`Malformed argument in “${message}”`)
    const [matched, name, type] = header
    i += matched.length
    args.add(type ? `${name}:${type}` : name!)
    if (type === 'select' || type === 'plural' || type === 'selectordinal') {
      i++ // the comma before the branches
      const keys: string[] = []
      for (;;) {
        const branch = /^\s*(?:offset:\d+\s*)?(=?[\w-]+)\s*\{/u.exec(rest())
        if (!branch) break
        keys.push(branch[1]!)
        i += branch[0].length
        parseMessage()
        i++
      }
      if (!keys.includes('other')) missingOther.push(name!)
    } else while (i < message.length && message[i] !== '}') i++
    skipSpace()
    if (message[i] !== '}') throw new Error(`Unclosed argument in “${message}”`)
    i++
  }
  parseMessage()
  if (i < message.length) throw new Error(`Unbalanced braces in “${message}”`)
  return {
    empty: !message.trim(),
    arguments: [...args].toSorted(),
    tags: [...tags].toSorted(),
    missingOther
  }
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
