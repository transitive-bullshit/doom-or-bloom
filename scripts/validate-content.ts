import {
  loadBundle,
  loadDraftReferences,
  loadReferences,
  validateBundle
} from '../lib/content/loader'
import { loadAuthoringContext } from '../lib/content/authoring-context'
import { journeyTurns } from '../lib/content/authoring-context'
import {
  findingSchema,
  promptSchema,
  resourceSchema
} from '../lib/content/schema'
import { existsSync, readFileSync, readdirSync } from 'node:fs'
import path from 'node:path'
import { z } from 'zod'
import { defaultLocale, locales } from '../i18n/config'
import { messageProblems, type Catalog } from '../i18n/message-checks'
import { supportedContentVersions, versions } from '../lib/assessment/schema'
import {
  l10nKinds,
  l10nPath,
  l10nProblems,
  releaseSources,
  rubricSources,
  type L10nKind
} from '../lib/content/l10n'
import { readL10n, readRelease, readRubric } from '../lib/content/l10n-loader'
import { blogDirectory, blogPosts, isTranslated } from '../lib/blog/posts'
import { blogTranslationProblems } from '../lib/blog/translation-check'
import { blogDataSchema, periodHeadings } from '../lib/blog/schema'
import { people } from '../components/landing/people'
import {
  oneLiners,
  verifiedOneLinerQuotes
} from '../components/landing/one-liners'
import { oneLinerProblems } from '../lib/personas/one-liner-rules'
import {
  publicStatementProblems,
  publicStatements
} from '../lib/personas/public-statements'
const bundle = loadBundle()
const drafts = loadDraftReferences()
const context = loadAuthoringContext(bundle)
for (const journey of context.development.journeys)
  for (const variant of journey.variants) journeyTurns(journey, variant.id)
// Separate background drafts retain their source release version.
for (const version of new Set(
  drafts.map((reference) => reference.content_version)
)) {
  if (!/^[a-zA-Z0-9._-]+$/.test(version))
    throw new Error('Invalid draft version')
  const directory = path.join(process.cwd(), 'content/releases', version)
  const json = (file: string): unknown =>
    JSON.parse(readFileSync(path.join(directory, file), 'utf8'))
  validateBundle({
    ...bundle,
    prompts: z.array(promptSchema).parse(json('prompts.json')),
    findings: z.array(findingSchema).parse(json('findings.json')),
    resources: z.array(resourceSchema).parse(json('resources.json')),
    references: [
      ...loadReferences(path.join(directory, 'references')),
      ...drafts.filter((reference) => reference.content_version === version)
    ],
    manifest: {
      ...bundle.manifest,
      contentVersion: version,
      status: 'draft',
      reviewer: null,
      hashes: {}
    }
  })
}
const references = [...bundle.references, ...drafts]
for (const source of context.intake.sources) {
  if (source.referenceIds.some((id) => !references.some((r) => r.id === id)))
    throw new Error(`Unknown source-intake reference: ${source.id}`)
  for (const record of source.researchRecords) {
    const research = readFileSync(path.join(process.cwd(), record.path), 'utf8')
    if (!research.split('\n').some((line) => line === `## ${record.heading}`))
      throw new Error(`Unknown research section: ${source.id}`)
  }
  if (
    source.status === 'reviewed' &&
    (!source.referenceIds.length ||
      source.referenceIds.some(
        (id) => references.find((r) => r.id === id)?.status !== 'reviewed'
      ))
  )
    throw new Error(`Incomplete source review: ${source.id}`)
}
console.log(
  `Validated ${bundle.prompts.length} prompts, ${bundle.references.length} active references, ${drafts.length} separate draft references, ${bundle.findings.length} findings, ${bundle.resources.length} resources. Status: ${bundle.manifest.status}.`
)
console.log(
  `Development examples: ${context.development.journeys.filter((journey) => journey.turns.length >= 6).length} longer paths, ${context.development.journeys.reduce((sum, journey) => sum + journey.variants.length, 0)} matched variants and ${context.development.journeys.filter((journey) => journey.correction).length} scoped corrections. Expected interpretations remain drafts.`
)
console.log(
  `Validated ${context.taxonomy.riskFamilies.length} risk families, ${context.taxonomy.safetyConcepts.length} concepts, ${context.development.journeys.length} draft development journeys and ${context.intake.sources.length} source intake records. Authoring context is outside runtime scoring.`
)

// Simulated-user one-liners describe real people: the mechanical part of
// docs/user-journeys.md#simulated-user-one-liners.
const slugs = new Set(people.map((person) => person.slug))
const oneLinerErrors = [
  ...Object.keys(oneLiners)
    .filter((slug) => !slugs.has(slug))
    .map((slug) => `${slug}: one-liner for no simulated user`),
  ...Object.keys(verifiedOneLinerQuotes)
    .filter((slug) => !slugs.has(slug))
    .map((slug) => `${slug}: verified quote for no simulated user`),
  ...people.flatMap((person) =>
    oneLinerProblems(
      person.description,
      verifiedOneLinerQuotes[person.slug]
    ).map((problem) => `${person.slug}: ${problem}`)
  )
]
if (oneLinerErrors.length)
  throw new Error(
    `Simulated-user one-liners break the rule in docs/user-journeys.md#simulated-user-one-liners:\n${oneLinerErrors.join('\n')}`
  )
console.log(`Validated ${people.length} simulated-user one-liners.`)

// What each real person has said about AI, shown on their profile:
// docs/user-journeys.md#public-statements. Every file must be registered.
const statementsDirectory = path.join(process.cwd(), 'content/profiles')
const statementFiles = existsSync(statementsDirectory)
  ? readdirSync(statementsDirectory).filter((file) => file.endsWith('.json'))
  : []
const statementErrors = [
  ...statementFiles
    .filter((file) => !publicStatements.has(file.slice(0, -'.json'.length)))
    .map(
      (file) => `${file}: not registered in lib/personas/public-statements.ts`
    ),
  ...[...publicStatements.values()].flatMap((file) => [
    ...(slugs.has(file.slug)
      ? []
      : [`${file.slug}: statements for no simulated user`]),
    ...(statementFiles.includes(`${file.slug}.json`)
      ? []
      : [
          `${file.slug}: registered without content/profiles/${file.slug}.json`
        ]),
    ...publicStatementProblems(file).map(
      (problem) => `${file.slug}: ${problem}`
    )
  ])
]
if (statementErrors.length)
  throw new Error(
    `Public statements break the rule in docs/user-journeys.md#public-statements:\n${statementErrors.join('\n')}`
  )
console.log(
  `Validated public statements for ${publicStatements.size} simulated users.`
)

// Committed translations. Every enabled locale needs complete, current
// translations of every supported release and the rubric; any other
// translation file that exists must be current too.
const l10nRoot = path.join(process.cwd(), 'content/l10n')
const required = locales
  .filter((locale) => locale !== defaultLocale)
  .flatMap((locale) => [
    ...supportedContentVersions.map((version) => ({
      locale,
      kind: 'release' as L10nKind,
      version
    })),
    { locale, kind: 'rubric' as L10nKind, version: versions.rubric }
  ])
const present = existsSync(l10nRoot)
  ? readdirSync(l10nRoot).flatMap((locale) =>
      l10nKinds.flatMap((kind) => {
        const directory = path.dirname(
          path.join(process.cwd(), l10nPath(locale, kind, 'x'))
        )
        return existsSync(directory)
          ? readdirSync(directory)
              .filter((file) => file.endsWith('.json'))
              .map((file) => ({
                locale,
                kind,
                version: file.slice(0, -'.json'.length)
              }))
          : []
      })
    )
  : []
const l10nFiles = new Map(
  [...required, ...present].map((file) => [
    l10nPath(file.locale, file.kind, file.version),
    file
  ])
)
const l10nErrors: string[] = []
for (const [location, { locale, kind, version }] of l10nFiles) {
  const file = readL10n(locale, kind, version)
  if (
    file &&
    (file.locale !== locale || file.kind !== kind || file.version !== version)
  )
    l10nErrors.push(
      `${location}: locale, kind or version does not match its path`
    )
  const sources =
    kind === 'release'
      ? releaseSources(readRelease(version))
      : rubricSources(readRubric(version))
  for (const problem of l10nProblems(file, sources))
    l10nErrors.push(`${location}: ${problem}`)
}
// Message catalogs: the same keys, ICU arguments and tags as English.
const catalog = (code: string) =>
  JSON.parse(
    readFileSync(path.join(process.cwd(), 'messages', `${code}.json`), 'utf8')
  ) as Catalog
const messageLocales = readdirSync(path.join(process.cwd(), 'messages'))
  .filter((file) => file.endsWith('.json'))
  .map((file) => file.slice(0, -'.json'.length))
for (const locale of locales)
  if (!messageLocales.includes(locale))
    l10nErrors.push(`messages/${locale}.json is missing`)
for (const locale of messageLocales.filter((code) => code !== defaultLocale))
  for (const problem of messageProblems(
    catalog(defaultLocale),
    catalog(locale)
  ))
    l10nErrors.push(`messages/${locale}.json: ${problem}`)
if (l10nErrors.length)
  throw new Error(
    `Translations are incomplete or stale:\n${l10nErrors.slice(0, 40).join('\n')}${l10nErrors.length > 40 ? `\n…and ${l10nErrors.length - 40} more` : ''}\nRun pnpm l10n:translate --locale=<code> --only-stale (docs/INTERNATIONALIZATION.md).`
  )
console.log(
  `Validated ${l10nFiles.size} authored-content translation files and ${messageLocales.length - 1} message catalogs against English.`
)

// Blog posts: frontmatter, headings without trailing periods, and chart data
// with an allowed provenance (docs/BLOG.md).
const posts = blogPosts()
const blogErrors = posts.flatMap((post) =>
  periodHeadings(
    readFileSync(path.join(blogDirectory, `${post.slug}.mdx`), 'utf8')
  ).map((heading) => `${post.slug}.mdx: heading ends with a period: ${heading}`)
)
const blogData = path.join(blogDirectory, 'data')
const dataFiles = existsSync(blogData)
  ? readdirSync(blogData).filter((file) => file.endsWith('.json'))
  : []
for (const file of dataFiles) {
  const parsed = blogDataSchema.safeParse(
    JSON.parse(readFileSync(path.join(blogData, file), 'utf8'))
  )
  if (!parsed.success)
    blogErrors.push(`data/${file}: ${parsed.error.issues[0]?.message}`)
}
if (blogErrors.length)
  throw new Error(`Invalid blog content:\n${blogErrors.join('\n')}`)
// Translated posts and their data files: complete, current and structurally
// the same as the English.
const blogTranslationErrors = blogTranslationProblems()
if (blogTranslationErrors.length)
  throw new Error(
    `Blog translations are incomplete or stale:\n${blogTranslationErrors.slice(0, 40).join('\n')}\nRun pnpm l10n:translate --locale=<code> --scope=blog --only-stale (docs/BLOG.md#languages).`
  )
console.log(
  `Validated the blog: ${posts.length} posts, ${posts.filter((post) => isTranslated(post.slug)).length} translated, and ${dataFiles.length} data files.`
)
