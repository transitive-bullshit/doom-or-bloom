import { existsSync, readFileSync, readdirSync } from 'node:fs'
import path from 'node:path'
import matter from 'gray-matter'
import { defaultLocale, locales } from '@/i18n/config'
import {
  blogL10nDirectory,
  blogMetaPath,
  blogMetaSchema,
  dataTranslationProblems,
  postTranslationProblems,
  sourceHash,
  translatedFrontmatterSchema
} from './l10n'
import { blogDataSchema } from './schema'

// Checks committed post translations against the English (docs/BLOG.md
// #languages): every translated post is translated into every enabled locale,
// and every translated file is current, complete and keeps the English
// structure. Run by `pnpm test:content`.

const read = (file: string) => readFileSync(file, 'utf8')
const files = (directory: string, extension: string) =>
  existsSync(directory)
    ? readdirSync(directory).filter((file) => file.endsWith(extension))
    : []

export function blogTranslationProblems(root = process.cwd()) {
  const problems: string[] = []
  const english = path.join(root, 'content/blog')
  const posts = files(english, '.mdx').map((file) => file.slice(0, -4))
  const targets = locales.filter((locale) => locale !== defaultLocale)
  const present = files(path.join(root, 'content/l10n'), '').filter(
    (locale) => locale !== '.DS_Store'
  )

  for (const slug of posts) {
    const translated = targets.filter((locale) =>
      existsSync(path.join(root, blogL10nDirectory(locale), `${slug}.mdx`))
    )
    if (translated.length && translated.length !== targets.length)
      problems.push(
        `${slug}.mdx is translated into ${translated.join(', ')} but not ${targets.filter((locale) => !translated.includes(locale)).join(', ')}`
      )
  }

  for (const locale of present) {
    const directory = path.join(root, blogL10nDirectory(locale))
    if (!existsSync(directory)) continue
    const where = (file: string) => `content/l10n/${locale}/blog/${file}`
    const metaFile = path.join(root, blogMetaPath(locale))
    const meta = existsSync(metaFile)
      ? blogMetaSchema.safeParse(JSON.parse(read(metaFile)))
      : null
    if (!meta?.success || meta.data.locale !== locale) {
      problems.push(`${where('meta.json')} is missing or invalid`)
      continue
    }
    const entries = meta.data.entries
    const translatedFiles = [
      ...files(directory, '.mdx'),
      ...files(path.join(directory, 'data'), '.json').map(
        (file) => `data/${file}`
      )
    ]
    for (const key of Object.keys(entries))
      if (!translatedFiles.includes(key))
        problems.push(`${where('meta.json')}: ${key} has no translation file`)

    for (const file of translatedFiles) {
      const source = path.join(english, file)
      if (!existsSync(source)) {
        problems.push(`${where(file)} translates no English file`)
        continue
      }
      const sourceText = read(source)
      if (entries[file]?.sourceHash !== sourceHash(sourceText))
        problems.push(
          `${where(file)} is ${entries[file] ? 'stale' : 'missing from meta.json'}`
        )
      const text = read(path.join(directory, file))
      if (file.endsWith('.json')) {
        const translated = JSON.parse(text) as unknown
        const parsed = blogDataSchema.safeParse(translated)
        if (!parsed.success)
          problems.push(`${where(file)}: ${parsed.error.issues[0]?.message}`)
        for (const problem of dataTranslationProblems(
          JSON.parse(sourceText),
          translated
        ))
          problems.push(`${where(file)}: ${problem}`)
        continue
      }
      const { data, content } = matter(text)
      const frontmatter = translatedFrontmatterSchema.safeParse(data)
      if (!frontmatter.success)
        problems.push(`${where(file)}: ${frontmatter.error.issues[0]?.message}`)
      for (const problem of postTranslationProblems(
        matter(sourceText).content,
        content
      ))
        problems.push(`${where(file)}: ${problem}`)
      for (const [, imported] of content.matchAll(
        /^import\s.*from\s+'\.\/(data\/[^']+)'/gmu
      ))
        if (!translatedFiles.includes(imported!))
          problems.push(`${where(file)} imports ${imported}, not translated`)
    }
  }
  return problems
}
