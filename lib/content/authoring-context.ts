import 'server-only'
import { readFileSync } from 'node:fs'
import path from 'node:path'
import { z } from 'zod'
import { limits } from '@/lib/assessment/schema'
import type { Bundle } from './loader'

const rowSchema = z
  .object({
    'Short Name': z.string().min(1),
    Description: z.string().min(1),
    'Canonical Source 1': z.url(),
    'Canonical Source 2': z.union([z.url(), z.literal('')]),
    'Canonical Source 3': z.union([z.url(), z.literal('')]),
    Wikipedia: z.union([z.url(), z.literal('')]),
    url: z.url()
  })
  .passthrough()
const taxonomySchema = z
  .object({
    status: z.literal('draft'),
    accessedAt: z.string(),
    riskFamilies: z.array(rowSchema),
    safetyConcepts: z.array(rowSchema)
  })
  .passthrough()
const journeySchema = z.strictObject({
  id: z.string().min(1),
  title: z.string(),
  sourcePages: z.array(z.url()),
  riskFamilies: z.array(z.string()),
  concepts: z.array(z.string()),
  turns: z
    .array(
      z.strictObject({
        promptId: z.string(),
        text: z.string().min(1).max(limits.answerChars),
        disposition: z.enum([
          'usable',
          'non_answer',
          'needs_clarification',
          'navigation'
        ])
      })
    )
    .min(3)
    .max(limits.prompts),
  expected: z.array(z.string()).min(1),
  reviewStatus: z.enum(['draft', 'reviewed'])
})
const journeysSchema = z.strictObject({
  status: z.enum(['draft', 'reviewed']),
  reviewer: z.string().nullable(),
  purpose: z.string(),
  journeys: z.array(journeySchema)
})
const intakeSchema = z
  .object({
    sources: z.array(
      z
        .object({
          id: z.string(),
          url: z.url(),
          originalUrls: z.array(z.url()).min(1),
          origins: z.array(z.string()).min(1),
          requiredForInitialCorpus: z.boolean(),
          status: z.enum([
            'pending',
            'research_draft',
            'partial',
            'blocked',
            'draft',
            'reviewed'
          ]),
          referenceIds: z.array(z.string()),
          researchRecords: z
            .array(
              z.strictObject({
                path: z.string().regex(/^docs\/research\/[a-z0-9-]+\.md$/),
                heading: z.string().min(1),
                scope: z.string().min(1)
              })
            )
            .default([])
        })
        .passthrough()
    )
  })
  .passthrough()
function readJson(file: string): unknown {
  return JSON.parse(readFileSync(path.join(process.cwd(), file), 'utf8'))
}
function unique(values: string[], label: string) {
  if (new Set(values).size !== values.length)
    throw new Error(`Duplicate ${label}`)
}
export function loadAuthoringContext(bundle: Bundle) {
  const taxonomy = taxonomySchema.parse(
    readJson('content/context/notion-taxonomy.json')
  )
  const development = journeysSchema.parse(
    readJson('eval/development/argument-journeys.json')
  )
  const intake = intakeSchema.parse(readJson('content/source-intake.json'))
  const families = taxonomy.riskFamilies.map((r) => r['Short Name'])
  const concepts = taxonomy.safetyConcepts.map((r) => r['Short Name'])
  unique(families, 'risk family')
  unique(concepts, 'safety concept')
  unique(
    development.journeys.map((j) => j.id),
    'journey ID'
  )
  unique(
    intake.sources.map((s) => s.id),
    'source ID'
  )
  unique(
    intake.sources.map((s) => s.url),
    'source URL'
  )
  for (const journey of development.journeys) {
    if (
      journey.turns[0]?.promptId !== 'root' ||
      journey.turns.some(
        (t) => !bundle.prompts.some((p) => p.id === t.promptId)
      ) ||
      journey.riskFamilies.some((f) => !families.includes(f)) ||
      journey.concepts.some((c) => !concepts.includes(c))
    )
      throw new Error(`Unknown journey context: ${journey.id}`)
  }
  if (
    development.status === 'reviewed' &&
    (!development.reviewer ||
      development.journeys.some((j) => j.reviewStatus !== 'reviewed'))
  )
    throw new Error('Journey review is incomplete')
  return { taxonomy, development, intake }
}
