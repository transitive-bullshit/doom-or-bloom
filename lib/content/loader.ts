import 'server-only'
import { createHash } from 'node:crypto'
import { readFileSync, readdirSync } from 'node:fs'
import path from 'node:path'
import matter from 'gray-matter'
import { z } from 'zod'
import { rootPrompt, vectorIds, versions } from '@/lib/assessment/schema'
import {
  findingSchema,
  manifestSchema,
  promptSchema,
  referenceSchema,
  resourceSchema,
  rubricSchema
} from './schema'
import type { Reference } from './schema'

export function loadBundle() {
  const manifest = manifestSchema.parse(
    JSON.parse(
      readFileSync(path.join(process.cwd(), 'content/manifest.json'), 'utf8')
    )
  )
  if (
    manifest.contentVersion !== versions.content ||
    manifest.rubricVersion !== versions.rubric
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
  const references: Reference[] = readdirSync(
    path.join(directory, 'references')
  )
    .filter((file) => file.endsWith('.md'))
    .sort()
    .map((file) => {
      const parsed = matter(
        readFileSync(path.join(directory, 'references', file), 'utf8')
      )
      return {
        ...referenceSchema.parse(parsed.data),
        summary: parsed.content.trim()
      }
    })
  const bundle = { manifest, prompts, findings, resources, rubric, references }
  validateBundle(bundle)
  return bundle
}
export type Bundle = ReturnType<typeof loadBundle>
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
  for (const prompt of bundle.prompts) {
    if (prompt.contentVersion !== bundle.manifest.contentVersion)
      throw new Error('Prompt version mismatch')
    for (const family of prompt.permittedAfter)
      if (family !== '*' && !families.has(family))
        throw new Error('Unknown graph transition')
    if (prompt.family !== 'root' && prompt.permittedAfter.length === 0)
      throw new Error('Unreachable prompt')
  }
  for (const vector of vectorIds)
    if (!bundle.rubric.dimensions.some((d) => d.id === vector))
      throw new Error('Missing rubric dimension')
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
      all.some((a) => a.status !== 'reviewed') ||
      bundle.references.some((r) => !r.reviewer)
    )
      throw new Error('Human review is incomplete')
    if (Object.keys(bundle.manifest.hashes).length === 0)
      throw new Error('Reviewed bundle must have hashes')
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
        b.score - a.score || a.reference.id.localeCompare(b.reference.id)
    )
    .slice(0, 12)
}
