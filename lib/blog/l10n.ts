import path from 'node:path'
import { z } from 'zod'
import { sourceHash } from '@/lib/content/l10n'

// Translated blog posts (docs/BLOG.md#languages). A translated post is
// content/l10n/<locale>/blog/<slug>.mdx with the same imports, components,
// links and headings as the English, importing translated copies of its data
// files from content/l10n/<locale>/blog/data/. content/l10n/<locale>/blog/
// meta.json records the hash of the English each file translates, so an
// English edit makes the translation stale and `pnpm test:content` fails.
// A post is translated into every enabled locale or none.

export const blogL10nDirectory = (locale: string) =>
  path.join('content/l10n', locale, 'blog')
export const blogMetaPath = (locale: string) =>
  path.join(blogL10nDirectory(locale), 'meta.json')

const provenanceEntry = z.strictObject({
  sourceHash: z.string().regex(/^[0-9a-f]{16}$/),
  model: z.string().min(1).max(80),
  translatedAt: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  reviewStatus: z.enum(['machine', 'reviewed']),
  reviewer: z.string().min(1).optional()
})

/** Keys are `<slug>.mdx` and `data/<file>.json`. */
export const blogMetaSchema = z.strictObject({
  locale: z.string().regex(/^[a-z]{2}$/),
  kind: z.literal('blog'),
  entries: z.record(z.string(), provenanceEntry)
})
export type BlogMeta = z.infer<typeof blogMetaSchema>

/** A translation's frontmatter: the English dates and author apply. */
export const translatedFrontmatterSchema = z.strictObject({
  title: z
    .string()
    .min(1)
    .max(150)
    .refine(
      (text) => !/[.。．।]\s*$/u.test(text),
      'Titles end without a period'
    ),
  description: z.string().min(20).max(300)
})

export { sourceHash }

/** Strings in a data file a reader sees, by key; everything else is copied. */
const translatableKeys = new Set([
  'title',
  'source',
  'label',
  'group',
  'note',
  'interval',
  'cellsLabel',
  'pointsLabel',
  // Axis ends, how-to hints, project methods and reach, criteria details,
  // estimates as written and the questions behind them.
  'start',
  'end',
  'hint',
  'method',
  'reach',
  'detail',
  'figure',
  'wording'
])

/** Every translatable string in a data file, by its JSON path. */
export function dataStrings(data: unknown, at = ''): [string, string][] {
  if (Array.isArray(data))
    return data.flatMap((item, index) => dataStrings(item, `${at}[${index}]`))
  if (data && typeof data === 'object')
    return Object.entries(data).flatMap(([key, value]) =>
      typeof value === 'string' && translatableKeys.has(key)
        ? [[`${at}.${key}`, value] as [string, string]]
        : dataStrings(value, `${at}.${key}`)
    )
  return []
}

/** A copy of a data file with its translatable strings replaced by path. */
export function translateData(
  data: unknown,
  strings: ReadonlyMap<string, string>,
  at = ''
): unknown {
  if (Array.isArray(data))
    return data.map((item, index) =>
      translateData(item, strings, `${at}[${index}]`)
    )
  if (data && typeof data === 'object')
    return Object.fromEntries(
      Object.entries(data).map(([key, value]) => [
        key,
        typeof value === 'string' && translatableKeys.has(key)
          ? (strings.get(`${at}.${key}`) ?? value)
          : translateData(value, strings, `${at}.${key}`)
      ])
    )
  return data
}

/** Differences besides translatable strings between a data file and its copy. */
export function dataTranslationProblems(english: unknown, translated: unknown) {
  const problems: string[] = []
  const walk = (a: unknown, b: unknown, at: string) => {
    if (Array.isArray(a)) {
      if (!Array.isArray(b) || a.length !== b.length)
        return problems.push(`${at || 'root'}: a different list`)
      a.forEach((item, index) => walk(item, b[index], `${at}[${index}]`))
      return
    }
    if (a && typeof a === 'object') {
      if (!b || typeof b !== 'object' || Array.isArray(b))
        return problems.push(`${at || 'root'}: a different shape`)
      const keys = Object.keys(a)
      if (keys.join() !== Object.keys(b).join())
        return problems.push(`${at || 'root'}: different keys`)
      for (const key of keys) {
        const left = (a as Record<string, unknown>)[key]
        const right = (b as Record<string, unknown>)[key]
        if (typeof left === 'string' && translatableKeys.has(key)) {
          if (typeof right !== 'string' || !right.trim())
            problems.push(`${at}.${key}: missing translation`)
        } else walk(left, right, `${at}.${key}`)
      }
      return
    }
    if (a !== b) problems.push(`${at}: ${JSON.stringify(b)} differs`)
  }
  walk(english, translated, '')
  return problems
}

// The parts of a post a translation must keep exactly.
const importLines = (body: string) =>
  body.match(/^import\s.*$/gmu)?.toSorted() ?? []
const components = (body: string) =>
  body.match(/<[A-Z][A-Za-z]*\b[^>]*\/?>/gu)?.toSorted() ?? []
const siteLinks = (body: string) =>
  [...body.matchAll(/\]\((\/[^)\s]*)\)/gu)].map((match) => match[1]!).toSorted()
const headings = (body: string) => body.match(/^#{1,6}\s.*$/gmu) ?? []
const headingLevels = (body: string) =>
  headings(body).map((line) => line.match(/^#+/u)![0].length)

/** Structural differences between an English post body and its translation. */
export function postTranslationProblems(english: string, translated: string) {
  const problems: string[] = []
  const same = (label: string, read: (body: string) => unknown[]) => {
    if (read(english).join('\n') !== read(translated).join('\n'))
      problems.push(`${label} differ from the English`)
  }
  same('import lines', importLines)
  same('components', components)
  same('site links', siteLinks)
  same('heading levels', headingLevels)
  for (const line of headings(translated))
    if (/[.。．।]\s*$/u.test(line))
      problems.push(`heading ends with a period: ${line}`)
  for (const term of ['P(doom)', 'Doom or Bloom'])
    if (english.includes(term) && !translated.includes(term))
      problems.push(`"${term}" must stay untranslated`)
  return problems
}

/** Number tokens, ignoring how a language groups digits or marks decimals. */
export const digitRuns = (text: string) =>
  [...text.replace(/(\d)[.,\s  ](?=\d)/gu, '$1').matchAll(/\d+/gu)]
    .map((match) => match[0])
    .toSorted()
