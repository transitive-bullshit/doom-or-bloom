// Translates the UI message catalog, the authored assessment content and
// translated blog posts into one locale with an LLM, ahead of time. The output
// is committed and reviewed like any other content; nothing is translated at
// runtime.
//
//   pnpm l10n:translate --locale=<code> [--only-stale]
//                       [--scope=all|messages|content|blog] [--post=<slug>…]
//                       (--dry-run | --allow-paid --max-cost=<usd>)
//
// Without --only-stale, every entry is translated again except current
// entries a native speaker has reviewed. With it, only missing entries and
// entries whose English changed. Blog posts are translated once they have a
// translation in any locale; --post=<slug> starts one (docs/BLOG.md#languages).
// The OpenAI key comes from the environment; run it from a login shell that
// has it. See docs/INTERNATIONALIZATION.md.
import {
  existsSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  writeFileSync
} from 'node:fs'
import { execFileSync } from 'node:child_process'
import path from 'node:path'
import { parseArgs } from 'node:util'
import pMap from 'p-map'
import {
  catalogCodes,
  defaultLocale,
  languageName,
  languageTag,
  type CatalogCode
} from '../i18n/config'
import {
  flattenMessages,
  messageProblems,
  type Catalog
} from '../i18n/message-checks'
import { supportedContentVersions, versions } from '../lib/assessment/schema'
import {
  l10nPath,
  messageMetaPath,
  messageMetaSchema,
  releaseSources,
  rubricSources,
  sourceHash,
  type L10nEntry,
  type L10nFile,
  type L10nKind,
  type L10nSource,
  type MessageMeta
} from '../lib/content/l10n'
import { readL10n, readRelease, readRubric } from '../lib/content/l10n-loader'
import { createMeter, openaiText } from '../lib/benchmark/providers'
import {
  blogL10nDirectory,
  blogMetaPath,
  blogMetaSchema,
  dataStrings,
  digitRuns,
  postTranslationProblems,
  translateData,
  type BlogMeta
} from '../lib/blog/l10n'

const { values } = parseArgs({
  options: {
    locale: { type: 'string' },
    scope: { type: 'string', default: 'all' },
    post: { type: 'string', multiple: true, default: [] },
    'only-stale': { type: 'boolean', default: false },
    'dry-run': { type: 'boolean', default: false },
    'allow-paid': { type: 'boolean', default: false },
    'max-cost': { type: 'string' },
    model: { type: 'string', default: 'gpt-5.6-sol' },
    concurrency: { type: 'string', default: '4' }
  }
})
const locale = values.locale as CatalogCode
if (!catalogCodes.includes(locale) || locale === defaultLocale)
  throw new Error(
    `--locale must be one of ${catalogCodes.filter((code) => code !== defaultLocale).join(', ')}`
  )
if (!['all', 'messages', 'content', 'blog'].includes(values.scope!))
  throw new Error('--scope must be all, messages, content or blog')
const inScope = (scope: 'messages' | 'content' | 'blog') =>
  values.scope === 'all' || values.scope === scope
if (values['dry-run'] === values['allow-paid'])
  throw new Error('Choose --dry-run or --allow-paid --max-cost=<usd>')
const maxCost = Number(values['max-cost'])
if (values['allow-paid'] && !(maxCost > 0 && maxCost <= 15))
  throw new Error('--max-cost must be greater than 0 and at most $15')
const model = values.model!
const onlyStale = values['only-stale']
const today = new Date().toISOString().slice(0, 10)
const root = process.cwd()
const readJson = (file: string): unknown =>
  JSON.parse(readFileSync(path.join(root, file), 'utf8'))
const writeJson = (file: string, value: unknown) => {
  mkdirSync(path.dirname(path.join(root, file)), { recursive: true })
  writeFileSync(path.join(root, file), `${JSON.stringify(value, null, 2)}\n`)
}

// Style notes per language. The register is plain and neutral throughout.
const style: Partial<Record<CatalogCode, { notes: string; ai: string }>> = {
  es: {
    notes:
      'Neutral international Spanish, not regional. Address the reader as tú.',
    ai: 'IA'
  },
  pt: {
    notes: 'Brazilian Portuguese. Address the reader as você.',
    ai: 'IA'
  },
  hi: {
    notes:
      'Standard Hindi in Devanagari script, addressing the reader as आप. Prefer clear everyday Hindi; keep common technical loanwords only where everyday Hindi uses them. End full sentences with ।',
    ai: 'एआई'
  },
  zh: {
    notes:
      'Simplified Chinese for mainland readers, addressing the reader as 你. Use full-width Chinese punctuation in sentences.',
    ai: 'AI'
  },
  th: {
    notes:
      'Standard Thai, polite and neutral. Do not use gendered polite particles (ครับ/ค่ะ). Thai does not end sentences with a period.',
    ai: 'AI'
  },
  ja: {
    notes:
      'Natural Japanese in polite です/ます style. Use Japanese punctuation (、。) in sentences.',
    ai: 'AI'
  },
  de: {
    notes:
      'German, addressing the reader informally as du, as modern consumer websites do.',
    ai: 'KI'
  },
  fr: {
    notes: 'French, addressing the reader as vous.',
    ai: 'IA'
  },
  id: {
    notes: 'Standard Indonesian, addressing the reader as Anda.',
    ai: 'AI'
  }
}
const language = languageName(locale)
const instructions = `You translate "Doom or Bloom", a website where people answer a short adaptive interview about what AI means for our future, then see their AI worldview on a map from Doom to Bloom, an estimated P(doom), and the closest views among simulated thought leaders.

Translate from English into ${language} (${languageTag(locale)}). ${style[locale]?.notes ?? ''}

Rules:
1. Keep exactly as written, never translated: "Doom", "Bloom", "Doom or Bloom", "P(doom)", "X", URLs, numbers, and the names of people, organizations and publications.
2. Translate "AI" as "${style[locale]?.ai ?? 'AI'}" consistently.
3. "Thought leaders" are well-known public voices whose views are simulated; use the natural ${language} equivalent (in Spanish, "líderes de opinión").
4. Use a plain, neutral register. Preserve the exact meaning and degree: hedges, conditions, "if any", "rough", "most". Never add, drop, soften or intensify a premise. Interview questions measure beliefs, so a translation must not suggest an answer.
5. Endings: when the English has no final period (headlines, buttons, labels, captions, list items), the translation has none either. Where the English ends a sentence, use ${language}'s normal sentence punctuation.
6. The interview takes "about 3 minutes"; say exactly that.
7. Keep every placeholder and markup unchanged: {argument} placeholders; ICU plural, select and selectordinal syntax (translate only the text inside the branches; keep argument names, keywords and branch keys; add the plural categories ${language} needs, but always keep "other"); "#" inside plural branches; and rich-text tags such as <link>…</link>, translating the text between them.
8. Use the glossary's translations for the same English terms.
9. Reply with a JSON object with exactly the given keys, each value the translation of that key's text.`

// Blog posts are long-form prose with charts and links.
const blogRules = `Blog post rules:
a. Keep the MDX exactly: JSX tags such as <DataBars data={outlookByWave} />, Markdown link targets (the URL in parentheses; translate only the link text), citation markers such as [^bostrom-2002] (unchanged, after the same claim), and the Markdown structure: headings (#), list items (-, 1.), tables (|), bold (**), italics (*) and blank lines between paragraphs.
b. Keep every number's value. Write numbers the way ${language} normally does (decimal separator, percent sign), with the digits 0–9. Dates keep their day and year.
c. Keep people's names, "Hacker News", "X", "Jev", and the names of statistical methods (Mann–Whitney, Fisher, k-means, bootstrap, Wilson) as written.
d. Use ${language}'s typographic quotation marks.
e. Headings, list items, chart titles and labels have no final period.
f. The author writes in the first person in a plain, candid voice; keep it. Simulated thought leaders are simulations of public figures, not the people themselves.`

// Context for each kind of authored entry.
const contentKinds: Record<string, string> = {
  text: 'Interview question shown to the participant.',
  reask:
    'Shown below the question after an answer could not be connected to it; invites another try.',
  clarification:
    'Shown below the question when an answer was unclear; asks for a little more.',
  exhausted: 'Shown when the participant has used every try for this question.',
  finding:
    'A short observation on the results page, addressed to the participant.',
  title:
    'Title of an English-language reading the results recommend. Translate its meaning; the link opens the English original.',
  purpose: 'What reading the recommended resource helps the participant do.',
  question:
    'The question the recommended reading helps the participant explore.',
  effort: 'Short label describing the reading effort.',
  level:
    'Shown on the results page as an interpretation of the participant’s answers (their expected outcome, or the reasoning they demonstrated). Translate precisely and keep its hedges.'
}
const contentKind = (key: string) => {
  const [kind, , field] = key.split(':')
  return contentKinds[
    kind === 'prompt' || kind === 'resource' ? field! : kind!
  ]!
}

// ── Plan ────────────────────────────────────────────────────────────────
type Job = {
  key: string
  source: string
  scope: 'messages' | 'content' | 'blog'
}

const englishCatalog = readJson(`messages/${defaultLocale}.json`) as Catalog
const english = flattenMessages(englishCatalog)
const catalogFile = `messages/${locale}.json`
const translatedCatalog = existsSync(path.join(root, catalogFile))
  ? flattenMessages(readJson(catalogFile) as Catalog)
  : new Map<string, string>()
const metaFile = messageMetaPath(locale)
const meta: MessageMeta = existsSync(path.join(root, metaFile))
  ? messageMetaSchema.parse(readJson(metaFile))
  : { locale, kind: 'messages', entries: {} }

const current = (
  entry: Pick<L10nEntry, 'sourceHash' | 'reviewStatus'> | undefined,
  source: string
) => entry?.sourceHash === sourceHash(source)
const keep = (
  entry: Pick<L10nEntry, 'sourceHash' | 'reviewStatus'> | undefined,
  source: string,
  hasText: boolean
) =>
  hasText &&
  current(entry, source) &&
  (onlyStale || entry?.reviewStatus === 'reviewed')

const messageJobs: Job[] = !inScope('messages')
  ? []
  : [...english].flatMap(([key, source]) =>
      keep(meta.entries[key], source, translatedCatalog.has(key))
        ? []
        : [{ key, source, scope: 'messages' as const }]
    )

type Target = {
  kind: L10nKind
  version: string
  sources: L10nSource[]
  file: L10nFile | null
}
const targets: Target[] = !inScope('content')
  ? []
  : [
      ...supportedContentVersions.map((version) => ({
        kind: 'release' as const,
        version,
        sources: releaseSources(readRelease(version))
      })),
      {
        kind: 'rubric' as const,
        version: versions.rubric,
        sources: rubricSources(readRubric(versions.rubric))
      }
    ].map((target) => ({
      ...target,
      file: readL10n(locale, target.kind, target.version)
    }))
// One translation per distinct English string. Current entries of any file
// are reused for the same English.
const memory = new Map<string, L10nEntry>()
for (const target of targets)
  for (const { key, source } of target.sources) {
    const entry = target.file?.entries[key]
    if (entry && keep(entry, source, true)) memory.set(source, entry)
  }
const contentJobs = [
  ...new Map(
    targets
      .flatMap((target) => target.sources)
      .filter(({ source }) => !memory.has(source))
      .map(({ key, source }) => [
        source,
        { key, source, scope: 'content' as const }
      ])
  ).values()
]
// Blog posts translate whole: title, description and body sections, plus the
// text of the data files they import. A post joins once it has a translation
// in any locale, or by --post (lib/blog/l10n.ts).
const blogDirectory = 'content/blog'
const blogMetaFile = blogMetaPath(locale)
const blogMeta: BlogMeta = existsSync(path.join(root, blogMetaFile))
  ? blogMetaSchema.parse(readJson(blogMetaFile))
  : { locale, kind: 'blog', entries: {} }
const readText = (file: string) => readFileSync(path.join(root, file), 'utf8')
const translatedSomewhere = (slug: string) =>
  catalogCodes.some((code) =>
    existsSync(path.join(root, blogL10nDirectory(code), `${slug}.mdx`))
  )
const blogPosts = !inScope('blog')
  ? []
  : readdirSync(path.join(root, blogDirectory))
      .filter((file) => file.endsWith('.mdx'))
      .map((file) => file.slice(0, -'.mdx'.length))
      .filter(
        (slug) => values.post!.includes(slug) || translatedSomewhere(slug)
      )
for (const slug of values.post!)
  if (!blogPosts.includes(slug))
    throw new Error(`--post=${slug}: no content/blog/${slug}.mdx`)
const blogCurrent = (file: string) =>
  existsSync(path.join(root, blogL10nDirectory(locale), file)) &&
  keep(blogMeta.entries[file], readText(path.join(blogDirectory, file)), true)

/** A post's frontmatter, import lines and body sections, split at `## `. */
function postParts(slug: string) {
  const source = readText(path.join(blogDirectory, `${slug}.mdx`))
  const [, frontmatter = '', body = ''] =
    source.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/u) ?? []
  const field = (name: string) => {
    const value = frontmatter.match(new RegExp(`^${name}:\\s*(.*)$`, 'mu'))?.[1]
    if (!value) throw new Error(`${slug}.mdx has no ${name}`)
    return value.replace(/^(['"])(.*)\1$/u, '$2')
  }
  const imports = body.match(/^import\s.*$/gmu) ?? []
  const prose = body.replace(/^import\s.*$\n?/gmu, '').trim()
  const sections = prose.split(/\n(?=## )/u).map((section) => section.trim())
  const data = imports.flatMap(
    (line) => line.match(/from\s+'\.\/(data\/[^']+)'/u)?.[1] ?? []
  )
  return {
    title: field('title'),
    description: field('description'),
    imports,
    sections,
    data
  }
}
const blogPlans = blogPosts.map((slug) => ({
  slug,
  parts: postParts(slug),
  translate: !blogCurrent(`${slug}.mdx`)
}))
const blogData = [...new Set(blogPlans.flatMap((plan) => plan.parts.data))].map(
  (file) => {
    const data = readJson(path.join(blogDirectory, file))
    return { file, data, translate: !blogCurrent(file) }
  }
)
const blogKinds: Record<string, string> = {
  title: 'Title of the blog post (a headline: no final period).',
  description:
    'Summary of the post for search results, social cards and the blog index.',
  section:
    'A section of the post body, in MDX (Markdown with JSX components). Keep every import line, JSX tag such as <DataBars data={…} />, link target, [^key] citation marker and Markdown structure exactly; translate only the prose, link text and table text.',
  data: 'Text of a chart in the post: a chart title, a source note under it (full sentences that keep their final punctuation), a legend or axis label, a row label, a group heading or a test note. Titles and labels have no final period.'
}
const blogJobs: Job[] = [
  ...blogPlans
    .filter((plan) => plan.translate)
    .flatMap(({ slug, parts }) => [
      {
        key: `blog:${slug}:title`,
        source: parts.title,
        scope: 'blog' as const
      },
      {
        key: `blog:${slug}:description`,
        source: parts.description,
        scope: 'blog' as const
      },
      ...parts.sections.map((source, index) => ({
        key: `blog:${slug}:section:${index}`,
        source,
        scope: 'blog' as const
      }))
    ]),
  // One translation per distinct chart string.
  ...new Map(
    blogData
      .filter(({ translate }) => translate)
      .flatMap(({ file, data }) =>
        dataStrings(data).map(([at, source]) => [
          source,
          {
            key: `blog:data:${file.slice('data/'.length, -'.json'.length)}${at}`,
            source,
            scope: 'blog' as const
          }
        ])
      )
  ).values()
]
const blogKind = (key: string) =>
  blogKinds[key.startsWith('blog:data:') ? 'data' : key.split(':')[2]!]!

const sourceChars = [...messageJobs, ...contentJobs, ...blogJobs].reduce(
  (sum, job) => sum + job.source.length,
  0
)
console.log(
  `${language}: ${messageJobs.length} of ${english.size} messages, ${contentJobs.length} distinct authored strings and ${blogJobs.length} blog parts to translate (${sourceChars} English characters).`
)
if (
  values['dry-run'] ||
  (!messageJobs.length && !contentJobs.length && !blogJobs.length)
)
  process.exit(0)

// ── Translate ───────────────────────────────────────────────────────────
mkdirSync(path.join(root, 'eval/runs'), { recursive: true })
const ledger = `eval/runs/l10n-${locale}-${Date.now()}.jsonl`
const meter = createMeter(path.join(root, ledger), maxCost)

// Short labels established first, then given to every other batch so the
// same terms read the same everywhere.
const glossaryKeys = /^(Claims\.labels|Claims\.topics|Map|Cta|Header)\./u
const glossary = new Map<string, string>()
for (const [key, source] of english)
  if (
    glossaryKeys.test(key) &&
    translatedCatalog.has(key) &&
    !messageJobs.some((job) => job.key === key)
  )
    glossary.set(source, translatedCatalog.get(key)!)

const results = new Map<string, string>()
const failures = new Map<string, string>()

function checkTranslation(job: Job, text: string): string | null {
  if (!text.trim()) return 'empty'
  if (job.scope === 'messages') {
    const problems = messageProblems({ message: job.source }, { message: text })
    if (problems.length) return problems.join('; ')
  } else {
    const braces = (value: string) =>
      [...value.matchAll(/\{[^{}]*\}/gu)]
        .map((m) => m[0])
        .toSorted()
        .join()
    if (braces(text) !== braces(job.source)) return 'placeholders differ'
  }
  for (const term of ['P(doom)', 'Doom or Bloom'])
    if (job.source.includes(term) && !text.includes(term))
      return `"${term}" must stay untranslated`
  if (locale === 'zh' && /[\p{Script=Hiragana}\p{Script=Katakana}]/u.test(text))
    return 'Japanese kana in Simplified Chinese'
  if (job.scope === 'blog') {
    const problems = postTranslationProblems(job.source, text)
    if (problems.length) return problems.join('; ')
    // Every number survives (dates may gain a month number). A single digit
    // may be written as a word ("4 to 1").
    const numbers = digitRuns(text)
    const missing = digitRuns(job.source).filter((run) => {
      if (run.length === 1) return false
      const index = numbers.indexOf(run)
      if (index < 0) return true
      numbers.splice(index, 1)
      return false
    })
    if (missing.length)
      return `numbers changed or dropped: ${missing.join(', ')}`
    if (job.key.endsWith(':title') && /[.。．।]\s*$/u.test(text))
      return 'a title ends without a period'
  }
  return null
}

// A chart's source note is prose followed by its date, so it keeps the
// English final period in the language's own form.
function keepSentenceEnd(job: Job, text: string) {
  if (!job.key.endsWith('.source') || !job.source.trimEnd().endsWith('.'))
    return text
  const end = { zh: '。', ja: '。', hi: '।', th: '' }[locale as string] ?? '.'
  return /[.。．।!?！？]$/u.test(text.trimEnd())
    ? text
    : `${text.trimEnd()}${end}`
}

// When the English has no final period, neither does the translation.
function matchEnding(source: string, text: string) {
  const trimmed = text.trimEnd()
  return /[.。．।!?！？…:：]$/u.test(source.trimEnd()) ||
    !/[.。．।]$/u.test(trimmed) ||
    trimmed.endsWith('...')
    ? text
    : trimmed.slice(0, -1)
}

async function translateBatch(batch: Job[], attempt: number) {
  const keys = batch.map((job) => job.key)
  const scope = batch[0]!.scope
  const input =
    scope === 'messages'
      ? {
          about:
            'UI messages of the website. Keys show where each message appears (namespace.key).',
          glossary: Object.fromEntries(glossary),
          messages: Object.fromEntries(
            batch.map((job) => [job.key, job.source])
          )
        }
      : scope === 'blog'
        ? {
            about:
              'Parts of a blog post on the Doom or Bloom website, by its creator, about aggregate results of its interview. Each item gives what it is and its English text.',
            glossary: Object.fromEntries(glossary),
            items: Object.fromEntries(
              batch.map((job) => [
                job.key,
                { appears: blogKind(job.key), text: job.source }
              ])
            )
          }
        : {
            about:
              'Authored assessment content. Each item gives where it appears and its English text.',
            glossary: Object.fromEntries(glossary),
            items: Object.fromEntries(
              batch.map((job) => [
                job.key,
                { appears: contentKind(job.key), text: job.source }
              ])
            )
          }
  const retryNote = batch
    .filter((job) => failures.has(job.key))
    .map((job) => `${job.key}: ${failures.get(job.key)}`)
  const rules =
    scope === 'blog' ? `${instructions}\n\n${blogRules}` : instructions
  const text = await openaiText(
    {
      model,
      store: false,
      reasoning: { effort: 'low' },
      max_output_tokens: 10_000,
      instructions: retryNote.length
        ? `${rules}\n\nAn earlier attempt was rejected; fix these problems:\n${retryNote.join('\n')}`
        : rules,
      input: JSON.stringify(input),
      text: {
        format: {
          type: 'json_schema',
          name: 'translations',
          strict: true,
          schema: {
            type: 'object',
            properties: Object.fromEntries(
              keys.map((key) => [key, { type: 'string' }])
            ),
            required: keys,
            additionalProperties: false
          }
        }
      }
    },
    meter,
    `l10n:${locale}:${scope}:${attempt}`
  )
  const output = JSON.parse(text) as Record<string, string>
  for (const job of batch) {
    const translation = keepSentenceEnd(
      job,
      matchEnding(job.source, output[job.key] ?? '')
    )
    const problem = checkTranslation(job, translation)
    if (problem) failures.set(job.key, problem)
    else {
      failures.delete(job.key)
      results.set(job.key, translation)
    }
  }
}

// Batches stay under an item count and an English length, so long
// paragraphs (About, Privacy) never crowd a reply's output limit.
function batches(jobs: Job[], size: number) {
  const all: Job[][] = []
  for (const scope of ['messages', 'content', 'blog'] as const) {
    let batch: Job[] = []
    let chars = 0
    for (const job of jobs.filter((item) => item.scope === scope)) {
      if (
        batch.length &&
        (batch.length >= size || chars + job.source.length > 3000)
      ) {
        all.push(batch)
        batch = []
        chars = 0
      }
      batch.push(job)
      chars += job.source.length
    }
    if (batch.length) all.push(batch)
  }
  return all
}
const concurrency = Number(values.concurrency)
// Glossary terms first, so later batches can use them.
const first = messageJobs.filter((job) => glossaryKeys.test(job.key))
const rest = [
  ...messageJobs.filter((job) => !glossaryKeys.test(job.key)),
  ...contentJobs,
  ...blogJobs
]
const run = async (jobs: Job[], attempt: number, size: number) =>
  pMap(batches(jobs, size), (batch) => translateBatch(batch, attempt), {
    concurrency
  })
await run(first, 1, 60)
for (const job of first)
  if (results.has(job.key) && job.source.length <= 40)
    glossary.set(job.source, results.get(job.key)!)
await run(rest, 1, 40)
for (let attempt = 2; attempt <= 3 && failures.size; attempt++)
  await run(
    [...first, ...rest].filter((job) => failures.has(job.key)),
    attempt,
    10
  )
if (failures.size) {
  console.error(
    `${failures.size} translations still fail validation:\n${[...failures]
      .map(([key, problem]) => `${key}: ${problem}`)
      .join('\n')}`
  )
}
writeOutputs(results)
console.log(
  `Spent about $${meter.spent().toFixed(3)} (ledger ${ledger}). Review the files, then run pnpm test:content.`
)
if (failures.size) process.exitCode = 1

// ── Write ───────────────────────────────────────────────────────────────
function writeOutputs(results: Map<string, string>) {
  const written: string[] = []
  const entry = (text: string, source: string): L10nEntry => ({
    text,
    sourceHash: sourceHash(source),
    model,
    translatedAt: today,
    reviewStatus: 'machine'
  })
  if (inScope('messages') && (messageJobs.length || existsSync(catalogFile))) {
    const build = (node: Catalog, prefix = ''): Catalog =>
      Object.fromEntries(
        Object.entries(node).flatMap(
          ([key, value]): [string, string | Catalog][] => {
            const full = prefix ? `${prefix}.${key}` : key
            if (typeof value !== 'string') return [[key, build(value, full)]]
            const text = results.get(full) ?? translatedCatalog.get(full)
            return text === undefined ? [] : [[key, text]]
          }
        )
      )
    writeJson(catalogFile, build(englishCatalog))
    const entries: MessageMeta['entries'] = {}
    for (const [key, source] of english) {
      const translation = results.get(key)
      if (translation !== undefined) {
        const { text: _text, ...rest } = entry(translation, source)
        entries[key] = rest
      } else if (meta.entries[key] && translatedCatalog.has(key))
        entries[key] = meta.entries[key]!
    }
    writeJson(metaFile, { locale, kind: 'messages', entries })
    written.push(catalogFile, metaFile)
  }
  // Every content file is complete: a translation for each distinct English.
  const bySource = new Map<string, L10nEntry>(memory)
  for (const job of contentJobs) {
    const text = results.get(job.key)
    if (text !== undefined) bySource.set(job.source, entry(text, job.source))
  }
  for (const target of targets) {
    const file: L10nFile = {
      locale,
      kind: target.kind,
      version: target.version,
      entries: Object.fromEntries(
        target.sources.flatMap(({ key, source }) => {
          const value = bySource.get(source)
          return value ? [[key, value]] : []
        })
      )
    }
    const location = l10nPath(locale, target.kind, target.version)
    writeJson(location, file)
    written.push(location)
  }
  written.push(...writeBlog(results))
  if (written.length)
    execFileSync('pnpm', ['exec', 'oxfmt', ...written], { stdio: 'ignore' })
}

// A post or data file is written only when every part of it translated.
function writeBlog(results: Map<string, string>) {
  if (!blogJobs.length) return []
  const written: string[] = []
  const directory = blogL10nDirectory(locale)
  const provenance = (file: string) => ({
    sourceHash: sourceHash(readText(path.join(blogDirectory, file))),
    model,
    translatedAt: today,
    reviewStatus: 'machine' as const
  })
  const entries = { ...blogMeta.entries }
  for (const { slug, parts, translate } of blogPlans) {
    if (!translate) continue
    const part = (name: string) => results.get(`blog:${slug}:${name}`)
    const sections = parts.sections.map((_, index) => part(`section:${index}`))
    const title = part('title')
    const description = part('description')
    if (!title || !description || sections.some((text) => !text)) continue
    const file = path.join(directory, `${slug}.mdx`)
    mkdirSync(path.dirname(path.join(root, file)), { recursive: true })
    writeFileSync(
      path.join(root, file),
      [
        `---\ntitle: ${JSON.stringify(title)}\ndescription: ${JSON.stringify(description)}\n---`,
        parts.imports.join('\n'),
        ...sections
      ].join('\n\n') + '\n'
    )
    entries[`${slug}.mdx`] = provenance(`${slug}.mdx`)
    written.push(file)
  }
  const bySource = new Map(
    blogJobs
      .filter((job) => job.key.startsWith('blog:data:'))
      .flatMap((job) =>
        results.has(job.key) ? [[job.source, results.get(job.key)!]] : []
      )
  )
  for (const { file, data, translate } of blogData) {
    if (!translate) continue
    const strings = dataStrings(data)
    if (strings.some(([, source]) => !bySource.has(source))) continue
    const location = path.join(directory, file)
    writeJson(
      location,
      translateData(
        data,
        new Map(strings.map(([at, source]) => [at, bySource.get(source)!]))
      )
    )
    entries[file] = provenance(file)
    written.push(location)
  }
  writeJson(blogMetaFile, {
    locale,
    kind: 'blog',
    entries: Object.fromEntries(
      Object.entries(entries).toSorted(([a], [b]) => a.localeCompare(b))
    )
  })
  return [...written, blogMetaFile]
}
