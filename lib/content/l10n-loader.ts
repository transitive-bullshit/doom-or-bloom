import 'server-only'
import { existsSync, readFileSync } from 'node:fs'
import path from 'node:path'
import { z } from 'zod'
import { defaultLocale, type Locale } from '@/i18n/config'
import { supportedContentVersions } from '@/lib/assessment/schema'
import type { AuthoredText } from '@/lib/assessment/display-text'
import {
  findingSchema,
  promptSchema,
  resourceSchema,
  rubricSchema,
  type Prompt
} from './schema'
import {
  l10nFileSchema,
  l10nKey,
  l10nPath,
  promptFields,
  resourceFields,
  translated,
  type L10nFile,
  type L10nKind
} from './l10n'

const read = (file: string): unknown =>
  JSON.parse(readFileSync(path.join(process.cwd(), file), 'utf8'))

/** A committed translation file, or null when it does not exist. */
export function readL10n(
  locale: string,
  kind: L10nKind,
  version: string
): L10nFile | null {
  try {
    return l10nFileSchema.parse(read(l10nPath(locale, kind, version)))
  } catch (err) {
    if ((err as NodeJS.ErrnoException).code === 'ENOENT') return null
    throw err
  }
}

/** The English authored text of a release, without loading its references. */
export function readRelease(version: string) {
  if (!/^[a-zA-Z0-9._-]+$/u.test(version)) throw new Error('Invalid version')
  const file = (name: string) => `content/releases/${version}/${name}`
  return {
    prompts: z.array(promptSchema).parse(read(file('prompts.json'))),
    findings: z.array(findingSchema).parse(read(file('findings.json'))),
    resources: z.array(resourceSchema).parse(read(file('resources.json')))
  }
}

export function readRubric(version: string) {
  if (!/^[a-zA-Z0-9._-]+$/u.test(version)) throw new Error('Invalid version')
  return rubricSchema.parse(read(`content/rubrics/${version}/rubric.json`))
}

type Versions = { content: string; rubric: string }

// Content files never change while the server runs.
const cache = new Map<string, AuthoredText | null>()

/**
 * The authored text of an assessment's pinned release and rubric in a
 * locale, for the display layer. Only translations that match their current
 * English source are included; everything else stays English. English, and
 * versions no longer on disk, return null.
 */
export function authoredText(
  locale: Locale,
  versions: Versions
): AuthoredText | null {
  if (locale === defaultLocale) return null
  const id = `${locale}:${versions.content}:${versions.rubric}`
  if (cache.has(id)) return cache.get(id)!
  let text: AuthoredText | null = null
  if (
    supportedContentVersions.some((version) => version === versions.content)
  ) {
    const release = readRelease(versions.content)
    const rubric = existsSync(
      path.join(process.cwd(), 'content/rubrics', versions.rubric)
    )
      ? readRubric(versions.rubric)
      : null
    const releaseL10n = readL10n(locale, 'release', versions.content)
    const rubricL10n = readL10n(locale, 'rubric', versions.rubric)
    const entry = (file: L10nFile | null, key: string, source: string) => ({
      source,
      text: translated(file, key, source)
    })
    text = {
      prompts: Object.fromEntries(
        release.prompts.map((prompt) => [
          prompt.id,
          entry(releaseL10n, l10nKey.prompt(prompt.id, 'text'), prompt.text)
        ])
      ),
      findings: Object.fromEntries(
        release.findings.map((finding) => [
          finding.id,
          entry(releaseL10n, l10nKey.finding(finding.id), finding.text)
        ])
      ),
      resources: Object.fromEntries(
        release.resources.map((resource) => [
          resource.id,
          Object.fromEntries(
            resourceFields.flatMap((field) => {
              const source = resource[field]
              return source === undefined
                ? []
                : [
                    [
                      field,
                      entry(
                        releaseL10n,
                        l10nKey.resource(resource.id, field),
                        source
                      )
                    ]
                  ]
            })
          )
        ])
      ),
      levels: Object.fromEntries(
        (rubric
          ? [
              ...rubric.dimensions,
              {
                id: 'catastrophic_risk',
                levels: rubric.catastrophicRisk.levels
              }
            ]
          : []
        ).map(({ id, levels }) => [
          id,
          levels.map((level, index) =>
            entry(rubricL10n, l10nKey.level(id, index), level)
          )
        ])
      )
    }
  }
  cache.set(id, text)
  return text
}

/**
 * The authored text a read-only page needs: the questions it shows, its
 * findings and resources, and every level text its claims can quote.
 */
export function authoredTextFor(
  locale: Locale,
  versions: Versions,
  used: { promptIds: string[]; findingIds?: string[]; resourceIds?: string[] }
): AuthoredText | null {
  const text = authoredText(locale, versions)
  if (!text) return null
  const pick = <T>(entries: Record<string, T>, ids: string[] = []) =>
    Object.fromEntries(
      Object.entries(entries).filter(([id]) => ids.includes(id))
    )
  return {
    prompts: pick(text.prompts, used.promptIds),
    findings: pick(text.findings, used.findingIds),
    resources: pick(text.resources, used.resourceIds),
    levels: text.levels
  }
}

/** Each question's recovery copy in a locale, by prompt ID. */
export function recoveryCopy(locale: Locale, contentVersion: string) {
  const release = readRelease(contentVersion)
  const file =
    locale === defaultLocale
      ? null
      : readL10n(locale, 'release', contentVersion)
  return Object.fromEntries(
    release.prompts.map((prompt) => [
      prompt.id,
      Object.fromEntries(
        promptFields
          .filter((field) => field !== 'text')
          .map((field) => [
            field,
            translated(
              file,
              l10nKey.prompt(prompt.id, field),
              prompt.recoveryVariants[field as 'reask']
            )
          ])
      ) as Prompt['recoveryVariants']
    ])
  )
}
