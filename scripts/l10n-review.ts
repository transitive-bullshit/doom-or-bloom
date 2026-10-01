// Writes a native-speaker review packet for one locale: the root question,
// the recovery and retry copy, and the wording of result claims, with English
// beside each translation. Everything else may stay machine-translated.
//
//   pnpm l10n:review --locale=<code> [--back-translate --allow-paid --max-cost=<usd>]
//   pnpm l10n:review --locale=<code> --approve=<reviewer>
//
// --back-translate adds a machine back-translation for reviewers who want a
// second reading. --approve records a completed review: it marks every
// current entry in the packet `reviewed` by that reviewer.
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { execFileSync } from 'node:child_process'
import path from 'node:path'
import { parseArgs } from 'node:util'
import {
  catalogCodes,
  defaultLocale,
  languageName,
  languageTag,
  type CatalogCode
} from '../i18n/config'
import { flattenMessages, type Catalog } from '../i18n/message-checks'
import { versions } from '../lib/assessment/schema'
import {
  l10nKey,
  l10nPath,
  messageMetaPath,
  messageMetaSchema,
  releaseSources,
  reviewedMessageKeys,
  rubricSources,
  sourceHash
} from '../lib/content/l10n'
import { readL10n, readRelease, readRubric } from '../lib/content/l10n-loader'
import { createMeter, openaiText } from '../lib/benchmark/providers'

const { values } = parseArgs({
  options: {
    locale: { type: 'string' },
    'back-translate': { type: 'boolean', default: false },
    'allow-paid': { type: 'boolean', default: false },
    'max-cost': { type: 'string' },
    approve: { type: 'string' },
    model: { type: 'string', default: 'gpt-5.6-sol' }
  }
})
const locale = values.locale as CatalogCode
if (!catalogCodes.includes(locale) || locale === defaultLocale)
  throw new Error('--locale must be a non-English locale code')
if (values['back-translate'] && !values['allow-paid'])
  throw new Error('--back-translate makes paid calls: add --allow-paid')
const root = process.cwd()
const readJson = (file: string): unknown =>
  JSON.parse(readFileSync(path.join(root, file), 'utf8'))
const language = languageName(locale)

type Item = {
  section: 'root' | 'recovery' | 'claims'
  key: string
  english: string
  translation: string | null
  status: string
  uses?: number
}

// Authored content of the current release and rubric.
const release = readRelease(versions.content)
const releaseFile = readL10n(locale, 'release', versions.content)
const rubricFile = readL10n(locale, 'rubric', versions.rubric)
const current = (
  file: typeof releaseFile,
  key: string,
  english: string
): Pick<Item, 'translation' | 'status'> => {
  const entry = file?.entries[key]
  if (!entry) return { translation: null, status: 'missing' }
  if (entry.sourceHash !== sourceHash(english))
    return { translation: entry.text, status: 'stale' }
  return {
    translation: entry.text,
    status: entry.reviewer
      ? `${entry.reviewStatus} by ${entry.reviewer}`
      : entry.reviewStatus
  }
}
const items: Item[] = []
const rootPrompt = release.prompts.find((prompt) => prompt.id === 'root')!
items.push({
  section: 'root',
  key: l10nKey.prompt('root', 'text'),
  english: rootPrompt.text,
  ...current(releaseFile, l10nKey.prompt('root', 'text'), rootPrompt.text)
})
// Recovery copy repeats across questions: review each distinct English once.
const recovery = new Map<string, Item>()
for (const source of releaseSources(release))
  if (source.review && source.key !== l10nKey.prompt('root', 'text')) {
    const seen = recovery.get(source.source)
    if (seen) seen.uses = (seen.uses ?? 1) + 1
    else
      recovery.set(source.source, {
        section: 'recovery',
        key: source.key,
        english: source.source,
        uses: 1,
        ...current(releaseFile, source.key, source.source)
      })
  }
items.push(...recovery.values())
for (const source of rubricSources(readRubric(versions.rubric)))
  items.push({
    section: 'claims',
    key: source.key,
    english: source.source,
    ...current(rubricFile, source.key, source.source)
  })

// UI messages: retry and recovery copy, and claim wording built in code.
const english = flattenMessages(readJson('messages/en.json') as Catalog)
const catalogFile = `messages/${locale}.json`
const translated = existsSync(path.join(root, catalogFile))
  ? flattenMessages(readJson(catalogFile) as Catalog)
  : new Map<string, string>()
const metaFile = messageMetaPath(locale)
const meta = existsSync(path.join(root, metaFile))
  ? messageMetaSchema.parse(readJson(metaFile))
  : null
for (const [key, source] of english)
  if (reviewedMessageKeys.test(key)) {
    const entry = meta?.entries[key]
    items.push({
      section: key.startsWith('Claims.') ? 'claims' : 'recovery',
      key,
      english: source,
      translation: translated.get(key) ?? null,
      status: !translated.has(key)
        ? 'missing'
        : entry && entry.sourceHash !== sourceHash(source)
          ? 'stale'
          : entry?.reviewer
            ? `${entry.reviewStatus} by ${entry.reviewer}`
            : (entry?.reviewStatus ?? 'unrecorded')
    })
  }

if (values.approve) {
  // Record a completed review on every current entry of the packet.
  const reviewer = values.approve
  const approve = <T extends { reviewStatus: string; reviewer?: string }>(
    entry: T
  ) => Object.assign(entry, { reviewStatus: 'reviewed', reviewer })
  let count = 0
  const keys = new Set(items.map(({ key }) => key))
  for (const [kind, version, file] of [
    ['release', versions.content, releaseFile],
    ['rubric', versions.rubric, rubricFile]
  ] as const) {
    if (!file) continue
    for (const source of kind === 'release'
      ? releaseSources(release).filter(({ review }) => review)
      : rubricSources(readRubric(versions.rubric))) {
      const entry = file.entries[source.key]
      if (entry && entry.sourceHash === sourceHash(source.source)) {
        approve(entry)
        count++
      }
    }
    writeFileSync(
      path.join(root, l10nPath(locale, kind, version)),
      `${JSON.stringify(file, null, 2)}\n`
    )
  }
  if (meta) {
    for (const [key, entry] of Object.entries(meta.entries))
      if (
        keys.has(key) &&
        entry.sourceHash === sourceHash(english.get(key) ?? '')
      ) {
        approve(entry)
        count++
      }
    writeFileSync(
      path.join(root, metaFile),
      `${JSON.stringify(meta, null, 2)}\n`
    )
  }
  execFileSync(
    'pnpm',
    [
      'exec',
      'oxfmt',
      l10nPath(locale, 'release', versions.content),
      l10nPath(locale, 'rubric', versions.rubric),
      metaFile
    ].filter((file) => existsSync(path.join(root, file))),
    { stdio: 'ignore' }
  )
  console.log(`Marked ${count} ${language} entries reviewed by ${reviewer}.`)
  process.exit(0)
}

// Optional machine back-translation, as a second reading for reviewers.
const back = new Map<string, string>()
if (values['back-translate']) {
  const maxCost = Number(values['max-cost'])
  if (!(maxCost > 0 && maxCost <= 2))
    throw new Error('--max-cost must be greater than 0 and at most $2')
  mkdirSync(path.join(root, 'eval/runs'), { recursive: true })
  const ledger = `eval/runs/l10n-review-${locale}-${Date.now()}.jsonl`
  const meter = createMeter(path.join(root, ledger), maxCost)
  const pending = items.filter((item) => item.translation)
  for (let i = 0; i < pending.length; i += 40) {
    const batch = pending.slice(i, i + 40)
    const keys = batch.map((item) => item.key)
    const text = await openaiText(
      {
        model: values.model!,
        store: false,
        reasoning: { effort: 'none' },
        max_output_tokens: 8000,
        instructions: `Translate each ${language} text literally back into English, so a reviewer who does not read ${language} can check its meaning. Keep placeholders and markup unchanged. Do not improve or interpret it. Reply with a JSON object with exactly the given keys.`,
        input: JSON.stringify(
          Object.fromEntries(batch.map((item) => [item.key, item.translation]))
        ),
        text: {
          format: {
            type: 'json_schema',
            name: 'back_translations',
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
      `l10n-review:${locale}`
    )
    for (const [key, value] of Object.entries(
      JSON.parse(text) as Record<string, string>
    ))
      back.set(key, value)
  }
  console.log(
    `Back-translation spent about $${meter.spent().toFixed(3)} (ledger ${ledger}).`
  )
}

const quote = (text: string | null) =>
  text === null
    ? '_(missing)_'
    : text
        .split('\n')
        .map((line) => `> ${line}`)
        .join('\n')
const block = (item: Item) =>
  [
    `### \`${item.key}\`${item.uses && item.uses > 1 ? ` (used by ${item.uses} questions)` : ''}`,
    '',
    `Status: ${item.status}`,
    '',
    'English:',
    '',
    quote(item.english),
    '',
    `${language}:`,
    '',
    quote(item.translation),
    ...(back.has(item.key)
      ? ['', 'Back-translation (machine):', '', quote(back.get(item.key)!)]
      : []),
    ''
  ].join('\n')
const section = (name: Item['section']) =>
  items.filter((item) => item.section === name).map(block)
const counts = items.reduce<Record<string, number>>((all, item) => {
  const status = item.status.split(' ')[0]!
  all[status] = (all[status] ?? 0) + 1
  return all
}, {})
const markdown = [
  `# ${language} review packet`,
  '',
  `Generated ${new Date().toISOString().slice(0, 10)} for \`${locale}\` (${languageTag(locale)}), content ${versions.content} and rubric ${versions.rubric}. Statuses: ${Object.entries(
    counts
  )
    .map(([status, count]) => `${count} ${status}`)
    .join(', ')}.`,
  '',
  'Only these strings need a native speaker before they are treated as final: the root question, the recovery and retry copy, and the wording of result claims. Everything else may stay machine-translated. Check that each translation keeps the English meaning and degree, adds no loaded premise, reads neutrally and naturally, and leaves Doom, Bloom, Doom or Bloom and P(doom) untranslated. Placeholders such as `{readings}` and ICU syntax must stay as they are.',
  '',
  `Send corrections as edits to \`${l10nPath(locale, 'release', versions.content)}\`, \`${l10nPath(locale, 'rubric', versions.rubric)}\` or \`messages/${locale}.json\` (with their \`${metaFile}\` hashes refreshed by \`pnpm l10n:translate --locale=${locale} --only-stale\`). Record the completed review with \`pnpm l10n:review --locale=${locale} --approve=<reviewer>\`.`,
  '',
  '## Root question',
  '',
  ...section('root'),
  '## Recovery and retry copy',
  '',
  ...section('recovery'),
  '## Result claims',
  '',
  'Rubric levels (`level:*`) and the claims built in code (`Claims.*`) describe what the participant’s answers suggest. They are interpretations, not facts, and must keep their hedges.',
  '',
  ...section('claims')
].join('\n')
const output = `docs/l10n-review/${locale}.md`
mkdirSync(path.join(root, 'docs/l10n-review'), { recursive: true })
writeFileSync(path.join(root, output), markdown)
execFileSync('pnpm', ['exec', 'oxfmt', output], { stdio: 'ignore' })
console.log(`Wrote ${output} (${items.length} entries).`)
