import { z } from 'zod'
import { resultSchema } from '../assessment/schema'
import { personaProfileSchema } from '../journeys/catalog'
import { personaMetadataSchema } from './payload'
import type { personaRepository } from './repository'

/** The unparsed row a public profile renders from (`selectedProfile`). */
export type PublicProfileRow = NonNullable<
  Awaited<ReturnType<ReturnType<typeof personaRepository>['selectedProfile']>>
>

const sources = personaProfileSchema.pick({ sources: true })
const answersSchema = z.array(
  z.strictObject({
    id: z.string(),
    promptId: z.string(),
    question: z.string(),
    answer: z.string()
  })
)

/** Validates a public profile row. Single profiles stay strict. */
export function parsePublicProfile(row: PublicProfileRow) {
  return {
    assessmentId: row.assessmentId,
    metadata: personaMetadataSchema.parse(row.metadata),
    sources: sources.parse({ sources: row.sources }).sources,
    recordedSources: sources.parse({ sources: row.recordedSources }).sources,
    result: resultSchema.parse(row.result),
    answers: answersSchema.parse(row.answers)
  }
}
