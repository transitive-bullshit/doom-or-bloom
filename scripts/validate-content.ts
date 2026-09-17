import {
  loadBundle,
  loadDraftReferences,
  validateBundle
} from '../lib/content/loader'
import { loadAuthoringContext } from '../lib/content/authoring-context'
import { readFileSync } from 'node:fs'
import path from 'node:path'
const bundle = loadBundle()
const drafts = loadDraftReferences()
const context = loadAuthoringContext(bundle)
validateBundle({
  ...bundle,
  references: [...bundle.references, ...drafts],
  manifest: { ...bundle.manifest, status: 'draft', reviewer: null, hashes: {} }
})
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
