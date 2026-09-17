import { z } from 'zod'
import {
  dispositionSchema,
  limits,
  vectorSchema,
  versions
} from '@/lib/assessment/schema'
import type { Assessment, Operation } from '@/lib/assessment/schema'
import { eligible, currentPrompt } from '@/lib/assessment/state'
export const eventNames = [
  'assessment_started',
  'answer_classified',
  'answer_recovery_shown',
  'assessment_paused',
  'paperclip_interlude_shown',
  'question_routed',
  'results_unlocked',
  'results_viewed',
  'assessment_completed',
  'clarification_started',
  'result_recomputed',
  'assessment_capped',
  'assessment_restarted',
  'resource_opened',
  'full_report_downloaded',
  'share_card_downloaded',
  'share_intent_opened'
] as const
export type EventName = (typeof eventNames)[number]
const eventSchema = z.object({
  name: z.enum(eventNames),
  assessmentId: z.uuid(),
  properties: z.object({
    assessment_version: z.string().refine((v) => v === versions.assessment),
    content_version: z.string().refine((v) => v === versions.content),
    rubric_version: z.string().refine((v) => v === versions.rubric),
    model_version: z.string().refine((v) => v === versions.model),
    question_count: z.number().int().min(1).max(limits.prompts),
    substantive_count: z.number().int().min(0).max(limits.prompts),
    disposition: dispositionSchema.optional(),
    attempt_bucket: z.enum(['one', 'two', 'three']).optional(),
    pause_reason: z
      .enum([
        'non_answer',
        'needs_clarification',
        'navigation',
        'exhausted',
        'stopped',
        'no_candidates'
      ])
      .optional(),
    recovery_action: z.enum(['retry', 'skip', 'stop', 'dismiss']).optional(),
    completion_reason: z.enum(['voluntary', 'cap']).optional(),
    vector: vectorSchema.optional(),
    coverage_bucket: z.enum(['sparse', 'partial', 'broad']).optional(),
    outlook_region: z.enum(['doom', 'mixed', 'bloom', 'unplaced']).optional(),
    reasoning_region: z.enum(['less', 'more', 'unplaced']).optional(),
    range_bucket: z.enum(['wide', 'narrow']).optional(),
    provisional: z.boolean().optional(),
    // IDs are checked against the current asset catalog before emission.
    prompt_id: z.string().max(120).optional(),
    prompt_family: z.string().max(80).optional(),
    resource_id: z.string().max(120).optional()
  })
})
export type Event = z.infer<typeof eventSchema>
export type EventProperties = Event['properties']
export type Catalog = { prompts: Record<string, string>; resources: string[] }
export function sanitizeEvent(raw: unknown, catalog: Catalog): Event | null {
  const result = eventSchema.safeParse(raw)
  if (!result.success) return null
  const event = result.data,
    p = event.properties
  if (p.prompt_id && !(p.prompt_id in catalog.prompts)) return null
  if (
    p.prompt_family &&
    ![...Object.values(catalog.prompts), 'clarification'].includes(
      p.prompt_family
    )
  )
    return null
  if (p.resource_id && !catalog.resources.includes(p.resource_id)) return null
  return event
}
export function makeEvent(
  state: Assessment,
  name: EventName,
  extra: Partial<EventProperties> = {}
): Event {
  const covered = Object.values(state.coverage).filter(
    (v) => v === 'assessed'
  ).length
  const x = state.result?.horizontal,
    y = state.result?.vertical
  return {
    name,
    assessmentId: state.id,
    properties: {
      assessment_version: state.versions.assessment,
      content_version: state.versions.content,
      rubric_version: state.versions.rubric,
      model_version: state.versions.model,
      question_count: state.prompts.length,
      substantive_count: state.answers.length,
      coverage_bucket:
        covered < 5 ? 'sparse' : covered < 11 ? 'partial' : 'broad',
      outlook_region:
        x?.value == null
          ? 'unplaced'
          : x.value < 0.35
            ? 'doom'
            : x.value > 0.65
              ? 'bloom'
              : 'mixed',
      reasoning_region:
        y?.value == null ? 'unplaced' : y.value < 0.5 ? 'less' : 'more',
      range_bucket:
        !x ||
        !y ||
        Math.max(x.range[1] - x.range[0], y.range[1] - y.range[0]) > 0.4
          ? 'wide'
          : 'narrow',
      ...extra
    }
  }
}
export function transitionEvents(
  previous: Assessment,
  next: Assessment,
  operation: Operation,
  requestId: string
) {
  const events: Event[] = []
  const add = (
    name: EventName,
    marker: string,
    properties: Partial<EventProperties> = {}
  ) => {
    const key = `${name}:${marker}`
    if (next.eventMarkers.includes(key)) return
    next.eventMarkers.push(key)
    const extras: Partial<EventProperties> = { ...properties }
    if (['retry', 'skip', 'stop', 'dismiss'].includes(operation.type))
      extras.recovery_action = operation.type as
        | 'retry'
        | 'skip'
        | 'stop'
        | 'dismiss'
    events.push(makeEvent(next, name, extras))
  }
  const attempt = next.attempts.find((a) => a.id === requestId)
  if (operation.type === 'answer' && attempt) {
    const props: Partial<EventProperties> = {
      disposition: attempt.disposition,
      attempt_bucket:
        next.attempts.filter(
          (a) => a.promptInstanceId === attempt.promptInstanceId
        ).length >= 3
          ? 'three'
          : next.attempts.filter(
                (a) => a.promptInstanceId === attempt.promptInstanceId
              ).length === 2
            ? 'two'
            : 'one',
      prompt_id: currentPrompt(previous).promptId,
      prompt_family: currentPrompt(previous).family
    }
    add('answer_classified', requestId, props)
    if (attempt.disposition !== 'usable' && next.status !== 'capped')
      add('answer_recovery_shown', requestId, props)
  }
  if (next.answers.length > 0) add('assessment_started', 'once')
  if (eligible(next)) add('results_unlocked', 'once')
  if (next.prompts.length > previous.prompts.length)
    add('question_routed', String(next.prompts.length), {
      prompt_id: currentPrompt(next).promptId,
      prompt_family: currentPrompt(next).family
    })
  if (next.status === 'paused' && previous.status !== 'paused')
    add('assessment_paused', requestId, {
      pause_reason: next.recovery.reason ?? 'no_candidates'
    })
  if (!previous.recovery.paperclipShown && next.recovery.paperclipShown)
    add('paperclip_interlude_shown', 'once')
  if (operation.type === 'clarify')
    add('clarification_started', String(next.prompts.length), {
      vector: operation.vector
    })
  if (next.result && ['results', 'completed', 'capped'].includes(next.status)) {
    add('results_viewed', String(next.result.evidenceRevision), {
      provisional: next.result.provisional
    })
    if (
      operation.type === 'answer' &&
      currentPrompt(previous).target &&
      previous.result &&
      next.result.evidenceRevision !== previous.result.evidenceRevision
    )
      add('result_recomputed', String(next.result.evidenceRevision), {
        vector: currentPrompt(previous).target
      })
  }
  if (next.status === 'capped')
    add('assessment_capped', 'once', { completion_reason: 'cap' })
  if (
    next.status === 'completed' ||
    (next.status === 'capped' && eligible(next))
  )
    add('assessment_completed', 'once', {
      completion_reason: next.status === 'capped' ? 'cap' : 'voluntary'
    })
  return events
}
export function stripUrl(raw: string) {
  try {
    const url = new URL(raw)
    url.search = ''
    url.hash = ''
    return url.href
  } catch {
    return ''
  }
}
