// Translates the UI message catalog and the authored assessment content into
// one locale with an LLM, ahead of time. The output is committed and reviewed
// like any other content; nothing is translated at runtime.
//
//   pnpm l10n:translate --locale=<code> [--only-stale] [--scope=all|messages|content]
//                       (--dry-run | --allow-paid --max-cost=<usd>)
//
// Without --only-stale, every entry is translated again except current
// entries a native speaker has reviewed. With it, only missing entries and
// entries whose English changed. The OpenAI key comes from the environment;
// run it from a login shell that has it. See docs/INTERNATIONALIZATION.md.
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
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

const { values } = parseArgs({
  options: {
    locale: { type: 'string' },
    scope: { type: 'string', default: 'all' },
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
if (!['all', 'messages', 'content'].includes(values.scope!))
  throw new Error('--scope must be all, messages or content')
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
type Job = { key: string; source: string; scope: 'messages' | 'content' }

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

const messageJobs: Job[] =
  values.scope === 'content'
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
const targets: Target[] =
  values.scope === 'messages'
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
const sourceChars = [...messageJobs, ...contentJobs].reduce(
  (sum, job) => sum + job.source.length,
  0
)
console.log(
  `${language}: ${messageJobs.length} of ${english.size} messages and ${contentJobs.length} distinct authored strings to translate (${sourceChars} English characters).`
)
if (values['dry-run'] || (!messageJobs.length && !contentJobs.length))
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
  return null
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
  const text = await openaiText(
    {
      model,
      store: false,
      reasoning: { effort: 'low' },
      max_output_tokens: 10_000,
      instructions: retryNote.length
        ? `${instructions}\n\nAn earlier attempt was rejected; fix these problems:\n${retryNote.join('\n')}`
        : instructions,
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
    const translation = matchEnding(job.source, output[job.key] ?? '')
    const problem = checkTranslation(job, translation)
    if (problem) failures.set(job.key, problem)
    else {
      failures.delete(job.key)
      results.set(job.key, translation)
    }
  }
}

const chunk = <T>(items: T[], size: number) =>
  Array.from({ length: Math.ceil(items.length / size) }, (_, i) =>
    items.slice(i * size, (i + 1) * size)
  )
const concurrency = Number(values.concurrency)
// Glossary terms first, so later batches can use them.
const first = messageJobs.filter((job) => glossaryKeys.test(job.key))
const rest = [
  ...messageJobs.filter((job) => !glossaryKeys.test(job.key)),
  ...contentJobs
]
// Messages include long paragraphs (About, Privacy), so their batches are smaller.
const run = async (jobs: Job[], attempt: number, size: number) =>
  pMap(
    [
      ...chunk(
        jobs.filter((job) => job.scope === 'messages'),
        Math.ceil(size / 2)
      ),
      ...chunk(
        jobs.filter((job) => job.scope === 'content'),
        size
      )
    ],
    (batch) => translateBatch(batch, attempt),
    { concurrency }
  )
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
  if (
    values.scope !== 'content' &&
    (messageJobs.length || existsSync(catalogFile))
  ) {
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
  if (written.length)
    execFileSync('pnpm', ['exec', 'oxfmt', ...written], { stdio: 'ignore' })
}
