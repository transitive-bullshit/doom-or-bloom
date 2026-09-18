import 'server-only'
import { createHash } from 'node:crypto'
import { readFileSync, readdirSync } from 'node:fs'
import path from 'node:path'
import matter from 'gray-matter'
import { z } from 'zod'
import {
  rootPrompt,
  supportedContentVersions,
  supportedAssessmentVersions,
  vectorIds,
  versions
} from '@/lib/assessment/schema'
import {
  findingSchema,
  manifestSchema,
  promptSchema,
  questionTemplatesSchema,
  referenceSchema,
  resourceSchema,
  rubricSchema
} from './schema'
import type { Reference } from './schema'

export function loadReferences(directory: string): Reference[] {
  return readdirSync(directory)
    .filter((file) => file.endsWith('.md'))
    .sort()
    .map((file) => {
      const parsed = matter(readFileSync(path.join(directory, file), 'utf8'))
      return {
        ...referenceSchema.parse(parsed.data),
        summary: parsed.content.trim()
      }
    })
}
export function loadDraftReferences(): Reference[] {
  const directory = path.join(process.cwd(), 'content/drafts')
  return readdirSync(directory, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .flatMap((entry) =>
      loadReferences(path.join(directory, entry.name, 'references'))
    )
}
export function loadBundle(contentVersion: string = versions.content) {
  if (!supportedContentVersions.some((version) => version === contentVersion))
    throw new Error('This content version is unavailable. Export or restart.')
  const currentManifest = manifestSchema.parse(
    JSON.parse(
      readFileSync(path.join(process.cwd(), 'content/manifest.json'), 'utf8')
    )
  )
  const manifest =
    currentManifest.contentVersion === contentVersion
      ? currentManifest
      : manifestSchema.parse(
          JSON.parse(
            readFileSync(
              path.join(
                process.cwd(),
                'content/releases',
                contentVersion,
                'manifest.json'
              ),
              'utf8'
            )
          )
        )
  if (
    manifest.contentVersion !== contentVersion ||
    manifest.rubricVersion !== versions.rubric ||
    !supportedAssessmentVersions.includes(manifest.assessmentVersion)
  )
    throw new Error('Unsupported content bundle')
  const directory = path.join(
    process.cwd(),
    'content/releases',
    manifest.contentVersion
  )
  const json = (name: string) =>
    JSON.parse(readFileSync(path.join(directory, name), 'utf8')) as unknown
  const prompts = z.array(promptSchema).parse(json('prompts.json'))
  const findings = z.array(findingSchema).parse(json('findings.json'))
  const resources = z.array(resourceSchema).parse(json('resources.json'))
  const rubric = rubricSchema.parse(
    JSON.parse(
      readFileSync(
        path.join(
          process.cwd(),
          'content/rubrics',
          manifest.rubricVersion,
          'rubric.json'
        ),
        'utf8'
      )
    )
  )
  const references = loadReferences(path.join(directory, 'references'))
  const questionTemplates = questionTemplatesSchema.parse(
    JSON.parse(
      readFileSync(
        path.join(
          process.cwd(),
          'content/rubrics',
          manifest.rubricVersion,
          'questions.json'
        ),
        'utf8'
      )
    )
  )
  const bundle = {
    manifest,
    prompts,
    findings,
    resources,
    rubric,
    references,
    questionTemplates
  }
  validateBundle(bundle)
  return bundle
}
export type Bundle = ReturnType<typeof loadBundle>
export function bundleFiles(bundle: Pick<Bundle, 'manifest'>) {
  const base = path.join(process.cwd(), 'content')
  const directories = [
    `releases/${bundle.manifest.contentVersion}`,
    `rubrics/${bundle.manifest.rubricVersion}`
  ]
  const collect = (directory: string): string[] =>
    readdirSync(path.join(base, directory), { withFileTypes: true }).flatMap(
      (entry) => {
        const file = `${directory}/${entry.name}`
        // The manifest contains these hashes and cannot hash itself.
        return entry.isDirectory()
          ? collect(file)
          : file === `releases/${bundle.manifest.contentVersion}/manifest.json`
            ? []
            : [file]
      }
    )
  return directories.flatMap(collect).sort()
}
export function bundleHashes(bundle: Pick<Bundle, 'manifest'>) {
  return Object.fromEntries(
    bundleFiles(bundle).map((file) => [
      file,
      createHash('sha256')
        .update(readFileSync(path.join(process.cwd(), 'content', file)))
        .digest('hex')
    ])
  )
}
export function validateBundle(bundle: Bundle) {
  const all = [
    ...bundle.prompts,
    ...bundle.references,
    ...bundle.findings,
    ...bundle.resources
  ]
  const ids = new Set(all.map((item) => item.id))
  if (ids.size !== all.length) throw new Error('Duplicate content ID')
  const root = bundle.prompts.filter((p) => p.family === 'root')
  if (
    root.length !== 1 ||
    root[0]?.id !== 'root' ||
    root[0].text !== rootPrompt
  )
    throw new Error('Exactly one canonical root is required')
  const families = new Set(bundle.prompts.map((p) => p.family))
  const reachable = new Set(['root'])
  let added = true
  while (added) {
    added = false
    const covered = new Set(
      bundle.prompts
        .filter((p) => reachable.has(p.id))
        .flatMap((p) => p.targets)
    )
    const priorFamilies = new Set(
      bundle.prompts.filter((p) => reachable.has(p.id)).map((p) => p.family)
    )
    for (const p of bundle.prompts) {
      if (
        !reachable.has(p.id) &&
        p.prerequisites.every((v) => covered.has(v)) &&
        (p.permittedAfter.includes('*') ||
          p.permittedAfter.some((family) => priorFamilies.has(family)))
      ) {
        reachable.add(p.id)
        added = true
      }
    }
  }
  if (reachable.size !== bundle.prompts.length)
    throw new Error('Unreachable prompt graph')
  for (const prompt of bundle.prompts) {
    if (prompt.contentVersion !== bundle.manifest.contentVersion)
      throw new Error('Prompt version mismatch')
    for (const family of prompt.permittedAfter)
      if (family !== '*' && !families.has(family))
        throw new Error('Unknown graph transition')
    if (prompt.family !== 'root' && prompt.permittedAfter.length === 0)
      throw new Error('Unreachable prompt')
    if (prompt.prerequisites.some((v) => prompt.exclusions.includes(v)))
      throw new Error('Contradictory prompt rules')
    if (new Set(prompt.targets).size !== prompt.targets.length)
      throw new Error('Duplicate prompt target')
    if (Object.values(prompt.recoveryVariants).some((text) => !text.trim()))
      throw new Error('Missing recovery copy')
  }
  for (const vector of vectorIds)
    if (
      !bundle.rubric.dimensions.some((d) => d.id === vector) ||
      !bundle.prompts.some((p) => p.targets.includes(vector))
    )
      throw new Error('Missing rubric dimension')
  if (bundle.rubric.version !== bundle.manifest.rubricVersion)
    throw new Error('Rubric version mismatch')
  if (bundle.questionTemplates.version !== bundle.manifest.rubricVersion)
    throw new Error('Question template version mismatch')
  for (const [id, question] of Object.entries(
    bundle.questionTemplates.questions
  )) {
    const expected =
      id === 'dimension' ||
      id === 'catastrophic_score' ||
      id.startsWith('route_')
        ? 'score'
        : ['horizon', 'horizon_unknown', 'conviction', 'resolution'].includes(
              id
            )
          ? 'noul'
          : 'choice'
    if (question.type !== expected)
      throw new Error('Incorrect authored primitive type')
    for (const match of question.instructions.matchAll(/\{\{(\w+)\}\}/g))
      if (
        ![
          'source',
          'meaning',
          'levels',
          'title',
          'referenceId',
          'promptId'
        ].includes(match[1]!)
      )
        throw new Error('Unknown authored evidence slot')
  }
  for (const item of [...bundle.findings, ...bundle.resources])
    for (const condition of [...item.conditions, ...item.exclusions])
      if (
        (condition.min !== undefined &&
          condition.max !== undefined &&
          condition.min > condition.max) ||
        (!condition.assessed &&
          (condition.min !== undefined || condition.max !== undefined))
      )
        throw new Error('Impossible authored condition')
  for (const resource of bundle.resources)
    if (
      resource.referenceIds.some(
        (id) => !bundle.references.some((r) => r.id === id)
      )
    )
      throw new Error('Unknown resource reference')
  if (
    new Set(bundle.rubric.dimensions.map((d) => d.id)).size !== vectorIds.length
  )
    throw new Error('Duplicate rubric dimension')
  for (const reference of bundle.references) {
    if (reference.content_version !== bundle.manifest.contentVersion)
      throw new Error('Reference version mismatch')
    for (const related of [...reference.entities, ...reference.related])
      if (!bundle.references.some((r) => r.id === related))
        throw new Error('Unknown related reference')
    for (const heading of [
      'Neutral context',
      'Reported facts',
      'Interpretations',
      'Known unknowns',
      'Claim support',
      'Related entries',
      'Review notes'
    ])
      if (!reference.summary.includes(`## ${heading}`))
        throw new Error('Incomplete reference sections')
  }
  if (bundle.manifest.status === 'reviewed') {
    if (
      !bundle.manifest.reviewer ||
      bundle.rubric.status !== 'reviewed' ||
      bundle.questionTemplates.status !== 'reviewed' ||
      all.some((a) => a.status !== 'reviewed') ||
      bundle.references.some((r) => !r.reviewer)
    )
      throw new Error('Human review is incomplete')
    if (
      Object.keys(bundle.manifest.hashes).sort().join() !==
      bundleFiles(bundle).join()
    )
      throw new Error('Reviewed bundle must hash every asset')
  }
  for (const [file, hash] of Object.entries(bundle.manifest.hashes)) {
    if (
      !/^((releases|rubrics)\/[a-zA-Z0-9._-]+\/[a-zA-Z0-9._/-]+)$/.test(file) ||
      file.includes('..')
    )
      throw new Error('Invalid manifest path')
    const actual = createHash('sha256')
      .update(readFileSync(path.join(process.cwd(), 'content', file)))
      .digest('hex')
    if (actual !== hash) throw new Error('Content hash mismatch')
  }
}
export function retrieveReferences(
  bundle: Bundle,
  text: string,
  topics: string[] = []
) {
  const publishedDate = (reference: Reference) =>
    reference.kind !== 'entity' &&
    /^\d{4}-\d{2}(?:-\d{2})?$/.test(reference.date)
      ? reference.date
      : ''
  const normalized = text
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, ' ')
    .trim()
  return bundle.references
    .map((reference) => {
      const matched = reference.aliases.some((alias) =>
        ` ${normalized} `.includes(
          ` ${alias
            .toLowerCase()
            .replace(/[^\p{L}\p{N}]+/gu, ' ')
            .trim()} `
        )
      )
      return {
        reference,
        matched,
        score:
          (matched ? 100 : 0) +
          reference.topics.filter((topic) => topics.includes(topic)).length
      }
    })
    .filter((r) => r.score > 0)
    .sort(
      (a, b) =>
        b.score - a.score ||
        publishedDate(b.reference).localeCompare(publishedDate(a.reference)) ||
        a.reference.id.localeCompare(b.reference.id)
    )
    .slice(0, 12)
}
