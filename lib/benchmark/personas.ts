import { readFileSync } from 'node:fs'
import { z } from 'zod'
import { personas as catalog } from '@/lib/journeys/catalog'
import type { Persona } from '@/lib/journeys/catalog'
import { casualPersonas } from './casual-personas'

const personaSetsPath = 'eval/benchmark/personas.json'

// `terse` exists only in the benchmark: 1–10 typed words, like the median real
// participant. The other styles are the simulated-user catalog's.
export const answerStyles = [
  'terse',
  'brief',
  'conversational',
  'detailed'
] as const
export type AnswerStyle = (typeof answerStyles)[number]

const personaSetsSchema = z.strictObject({
  id: z.string(),
  description: z.string(),
  sets: z.record(
    z.string(),
    z.strictObject({
      description: z.string(),
      repeats: z.number().int().min(1).max(5).optional(),
      groups: z
        .array(
          z.strictObject({
            group: z.string(),
            styles: z.array(z.enum(answerStyles)).min(1),
            personas: z.array(z.string()).min(1)
          })
        )
        .min(1)
    })
  )
})
export type PersonaSets = z.infer<typeof personaSetsSchema>

const benchmarkPersonas: Persona[] = [...catalog, ...casualPersonas]

export function findPersona(id: string) {
  const persona = benchmarkPersonas.find((p) => p.id === id)
  if (!persona) throw new Error(`Unknown benchmark persona: ${id}`)
  return persona
}

export function loadPersonaSets(file = personaSetsPath): PersonaSets {
  const sets = personaSetsSchema.parse(JSON.parse(readFileSync(file, 'utf8')))
  for (const [name, set] of Object.entries(sets.sets)) {
    const ids = set.groups.flatMap((group) => group.personas)
    ids.forEach(findPersona)
    if (new Set(ids).size !== ids.length)
      throw new Error(`Persona set "${name}" lists a persona twice`)
  }
  return sets
}

export type Job = {
  key: string
  persona: string
  group: string
  style: AnswerStyle
  repeat: number
}

/** Interviews for a named set, optionally narrowed to personas and styles. */
export function expandJobs(
  sets: PersonaSets,
  name: string,
  filter: { personas?: string[]; styles?: AnswerStyle[]; repeats?: number } = {}
): Job[] {
  const set = sets.sets[name]
  if (!set) throw new Error(`Unknown persona set: ${name}`)
  const members = new Set(set.groups.flatMap((group) => group.personas))
  const outside = filter.personas?.filter((id) => !members.has(id)) ?? []
  if (outside.length)
    throw new Error(
      `Not in the "${name}" set: ${outside.join(', ')}. Add personas to ${personaSetsPath} to benchmark them.`
    )
  const repeats = filter.repeats ?? set.repeats ?? 1
  const jobs = set.groups.flatMap(({ group, styles, personas }) =>
    personas
      .filter((id) => !filter.personas || filter.personas.includes(id))
      .flatMap((persona) =>
        styles
          .filter((style) => !filter.styles || filter.styles.includes(style))
          .flatMap((style) =>
            Array.from({ length: repeats }, (_, i) => ({
              key: `${persona}__${style}__${i + 1}`,
              persona,
              group,
              style,
              repeat: i + 1
            }))
          )
      )
  )
  if (!jobs.length) throw new Error('The selection matches no interviews')
  return jobs
}
