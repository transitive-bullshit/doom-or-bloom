import type { Bundle } from '@/lib/content/loader'
import type { Provider } from '@/lib/server/provider'
import { fixtureAnswer } from '@/lib/server/provider'
import { validateEvaluation } from '@/lib/server/live-provider'
import type { ModelAnswer, Question } from '@/lib/assessment/schema'
import type { MechanicalCase } from './schema'
import type { ScriptedReply } from './cases'

export function scriptedProvider(persona: MechanicalCase, bundle: Bundle) {
  let reply: ScriptedReply
  const supported = new Set<string>()
  const model = 'persona-script-v1'
  function pick(q: Question, option: string) {
    if (q.type !== 'choice' || !Object.hasOwn(q.criteria, option))
      throw new Error(`Authored synthetic option ${option} no longer exists`)
    return fixtureAnswer(q, option)
  }
  const provider: Provider = {
    kind: 'fixture',
    evaluate: async (input, questions) => {
      const state = input as {
        current?: unknown
        candidates?: Array<{ id: string; targets: string[] }>
        evidenceSupport?: Array<{ vector: string; contribution: number }>
        unresolved?: Array<{ vector: string }>
      }
      const interpret = Boolean(state.current)
      if (interpret) for (const vector of reply.vectors) supported.add(vector)
      const answerFor = (id: string, q: Question): ModelAnswer => {
        if (interpret) {
          if (id === 'disposition') return pick(q, reply.disposition)
          if (id === 'familiarity') return pick(q, persona.familiarity)
          if (id === 'horizon' || id === 'conviction')
            return {
              type: 'noul',
              noul: (id === 'horizon' ? reply.horizon : reply.conviction)
                ? 0.98
                : 0.02
            }
          if (id === 'tension_present') return { type: 'noul', noul: 0 }
          if (id === 'tension') return pick(q, 'none')
          if (id === 'horizon_unknown') return { type: 'noul', noul: 0 }
          if (id.endsWith(':status'))
            return pick(
              q,
              reply.vectors.includes(
                id.split(':')[0] as (typeof reply.vectors)[number]
              )
                ? 'stated'
                : 'not_expressed'
            )
          throw new Error(`Unscripted interpret judgment ${id}`)
        }
        if (state.candidates) {
          if (id.startsWith('outlook:')) {
            const vector = id.split(':')[1]!
            return pick(
              q,
              !supported.has(vector)
                ? 'not_expressed'
                : persona.levels[vector] === null
                  ? 'explicitly_unknown'
                  : 'assessable'
            )
          }
          const [candidateId, benefit] = id.split(':')
          const candidate = state.candidates.find((c) => c.id === candidateId)
          if (!candidate) throw new Error('Missing scripted route candidate')
          const missing = candidate.targets.some(
            (v) =>
              (state.evidenceSupport?.find((d) => d.vector === v)
                ?.contribution ?? 0) < 1
          )
          const unresolved = candidate.targets.some((v) =>
            state.unresolved?.some((u) => u.vector === v)
          )
          if (benefit === 'novelty')
            return { type: 'noul', noul: missing || unresolved ? 1 : 0 }
          const level =
            benefit === 'coverage'
              ? missing
                ? 3
                : 0
              : benefit === 'ambiguity' || benefit === 'tension'
                ? unresolved
                  ? 3
                  : 0
                : benefit === 'projection'
                  ? candidate.targets.some((v) =>
                      [
                        'beneficial_potential',
                        'risk_landscape',
                        'human_agency',
                        ...bundle.rubric.dimensions
                          .filter(
                            (d) =>
                              d.id.startsWith('causal') ||
                              d.id === 'updateability'
                          )
                          .map((d) => d.id)
                      ].includes(v)
                    )
                    ? 2
                    : 1
                  : -1
          if (level < 0) throw new Error(`Unscripted routing judgment ${id}`)
          return fixtureAnswer(q, undefined, level)
        }
        const [vector, task] = id.split(':')
        const present =
          vector === 'catastrophic_risk'
            ? supported.has('risk_landscape') &&
              persona.levels.catastrophic_risk !== null
            : supported.has(vector!)
        if (task === 'status')
          return pick(
            q,
            present &&
              (persona.levels[vector!] !== null ||
                (q.type === 'choice' &&
                  ![
                    'causal_clarity',
                    'scope_discipline',
                    'appropriate_uncertainty',
                    'internal_coherence',
                    'counterargument_engagement',
                    'updateability',
                    'grounded_understanding'
                  ].includes(vector!)))
              ? 'stated'
              : 'not_expressed'
          )
        if (task === 'position')
          return pick(
            q,
            present && persona.levels[vector!] !== null
              ? 'assessable'
              : 'explicitly_unknown'
          )
        if (task === 'score')
          return fixtureAnswer(q, undefined, persona.levels[vector!] ?? 0)
        throw new Error(`Unscripted projection judgment ${id}`)
      }
      return validateEvaluation(
        {
          model,
          answers: Object.fromEntries(
            Object.entries(questions).map(([id, q]) => [id, answerFor(id, q)])
          ),
          usage: { input_tokens: 0, output_tokens: 0 }
        },
        questions
      )
    }
  }
  return {
    provider,
    setReply: (value: ScriptedReply) => {
      reply = value
    }
  }
}
