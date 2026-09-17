import {
  loadBundle,
  loadDraftReferences,
  loadReferences,
  validateBundle
} from '../lib/content/loader'
import { loadAuthoringContext } from '../lib/content/authoring-context'
import {
  findingSchema,
  promptSchema,
  resourceSchema
} from '../lib/content/schema'
import { readFileSync } from 'node:fs'
import path from 'node:path'
import { z } from 'zod'
const bundle = loadBundle()
const drafts = loadDraftReferences()
const context = loadAuthoringContext(bundle)
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
  `Validated ${context.taxonomy.riskFamilies.length} risk families, ${context.taxonomy.safetyConcepts.length} concepts, ${context.development.journeys.length} draft development journeys and ${context.intake.sources.length} source intake records. Authoring context is outside runtime scoring.`
)
