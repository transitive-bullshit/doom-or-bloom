import { createHash } from 'node:crypto'
import path from 'node:path'
import { z } from 'zod'
import type { findingSchema, Prompt, resourceSchema, Rubric } from './schema'

// Committed translations of authored content (docs/INTERNATIONALIZATION.md).
// They live outside the frozen release directories, in
// content/l10n/<locale>/releases/<contentVersion>.json and
// content/l10n/<locale>/rubrics/<rubricVersion>.json, so a translation fix is
// an ordinary commit and never changes a release's content hashes. Each entry
// records the hash of the English it translates: when the English changes,
// the entry is stale, validation fails and the page falls back to English.

const l10nEntrySchema = z.strictObject({
  text: z.string().trim().min(1),
  /** The first 16 hex digits of the SHA-256 of the English source. */
  sourceHash: z.string().regex(/^[0-9a-f]{16}$/),
  /** The model that produced the translation, or `human`. */
  model: z.string().min(1).max(80),
  translatedAt: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  /** `reviewed` after a native speaker checked it (`pnpm l10n:review`). */
  reviewStatus: z.enum(['machine', 'reviewed']),
  reviewer: z.string().min(1).optional()
})
export type L10nEntry = z.infer<typeof l10nEntrySchema>

export const l10nKinds = ['release', 'rubric'] as const
export type L10nKind = (typeof l10nKinds)[number]

export const l10nFileSchema = z.strictObject({
  locale: z.string().regex(/^[a-z]{2}$/),
  kind: z.enum(l10nKinds),
  version: z.string().regex(/^[a-zA-Z0-9._-]+$/),
  entries: z.record(z.string(), l10nEntrySchema)
})
export type L10nFile = z.infer<typeof l10nFileSchema>

/**
 * Provenance of messages/<locale>.json, which next-intl reads as a plain
 * catalog: per key, the hash of the English message it translates.
 * `pnpm l10n:translate --only-stale` uses it to find changed messages.
 */
export const messageMetaSchema = z.strictObject({
  locale: z.string().regex(/^[a-z]{2}$/),
  kind: z.literal('messages'),
  entries: z.record(z.string(), l10nEntrySchema.omit({ text: true }))
})
export type MessageMeta = z.infer<typeof messageMetaSchema>
export const messageMetaPath = (locale: string) =>
  path.join('content/l10n', locale, 'messages.json')

/**
 * UI messages that need native review with the authored root question,
 * recovery copy and rubric levels: the retry and recovery copy around the
 * interview, and the wording of result claims built in code.
 */
export const reviewedMessageKeys =
  /^(?:Interview\.(?:recovery|failure)\.|Interview\.(?:failedTitle|retrySaved|tryAgain|differentQuestion)$|Claims\.(?:levels|unplacedUncertain|unplacedUnestablished)\.|Claims\.(?:uncertain|unestablished|unresolved|readings|facetUnsettled|axisUnsettled|axisTentative|timelineExpressed|timelineUnsettled)$)/u

/** One authored English string a participant can see, by stable key. */
export type L10nSource = {
  key: string
  source: string
  /** Needs native-speaker review before it is treated as final. */
  review: boolean
}

export const promptFields = [
  'text',
  'reask',
  'clarification',
  'exhausted'
] as const
export type PromptField = (typeof promptFields)[number]
export const resourceFields = [
  'title',
  'purpose',
  'question',
  'effort'
] as const
export type ResourceField = (typeof resourceFields)[number]

// Keys use colons because content IDs contain dots.
export const l10nKey = {
  prompt: (id: string, field: PromptField) => `prompt:${id}:${field}`,
  finding: (id: string) => `finding:${id}`,
  resource: (id: string, field: ResourceField) => `resource:${id}:${field}`,
  level: (vector: string, index: number) => `level:${vector}:${index}`
}

export function sourceHash(text: string) {
  return createHash('sha256').update(text).digest('hex').slice(0, 16)
}

export function l10nPath(locale: string, kind: L10nKind, version: string) {
  return path.join(
    'content/l10n',
    locale,
    kind === 'release' ? 'releases' : 'rubrics',
    `${version}.json`
  )
}

type Release = {
  prompts: Prompt[]
  findings: z.infer<typeof findingSchema>[]
  resources: z.infer<typeof resourceSchema>[]
}

/**
 * Participant-visible text of a content release: questions and their recovery
 * copy, findings and resource cards. The root question and every recovery
 * message need native review.
 */
export function releaseSources(release: Release): L10nSource[] {
  return [
    ...release.prompts.flatMap((prompt) =>
      promptFields.map((field) => ({
        key: l10nKey.prompt(prompt.id, field),
        source: field === 'text' ? prompt.text : prompt.recoveryVariants[field],
        review: field !== 'text' || prompt.family === 'root'
      }))
    ),
    ...release.findings.map((finding) => ({
      key: l10nKey.finding(finding.id),
      source: finding.text,
      review: false
    })),
    ...release.resources.flatMap((resource) =>
      resourceFields.flatMap((field) => {
        const source = resource[field]
        return source === undefined
          ? []
          : [
              {
                key: l10nKey.resource(resource.id, field),
                source,
                review: false
              }
            ]
      })
    )
  ]
}

/**
 * The rubric's level texts, which results show as claims. Dimension labels
 * are UI messages (`Claims.labels`), checked against the rubric by
 * lib/assessment/display-text.test.ts.
 */
export function rubricSources(rubric: Rubric): L10nSource[] {
  return [
    ...rubric.dimensions.map(({ id, levels }) => ({ id, levels })),
    { id: 'catastrophic_risk', levels: rubric.catastrophicRisk.levels }
  ].flatMap(({ id, levels }) =>
    levels.map((source, index) => ({
      key: l10nKey.level(id, index),
      source,
      review: true
    }))
  )
}

const placeholders = (text: string) =>
  [...text.matchAll(/\{[^{}]*\}/gu)].map((match) => match[0]).toSorted()

/**
 * Problems that make a translation file incomplete or stale for its English
 * sources: missing or extra entries, a source hash that no longer matches,
 * or placeholders that differ from the English.
 */
export function l10nProblems(
  file: L10nFile | null,
  sources: L10nSource[]
): string[] {
  if (!file) return ['missing file']
  const problems: string[] = []
  const known = new Set(sources.map(({ key }) => key))
  for (const { key, source } of sources) {
    const entry = file.entries[key]
    if (!entry) problems.push(`missing ${key}`)
    else {
      if (entry.sourceHash !== sourceHash(source)) problems.push(`stale ${key}`)
      if (placeholders(entry.text).join() !== placeholders(source).join())
        problems.push(`placeholders differ in ${key}`)
    }
  }
  for (const key of Object.keys(file.entries))
    if (!known.has(key)) problems.push(`extra ${key}`)
  return problems
}

/** The translation of a source when it is current, otherwise the English. */
export function translated(file: L10nFile | null, key: string, source: string) {
  const entry = file?.entries[key]
  return entry && entry.sourceHash === sourceHash(source) ? entry.text : source
}
