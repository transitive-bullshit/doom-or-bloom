import 'server-only'
import { createHash, randomUUID } from 'node:crypto'
import { readFileSync, readdirSync } from 'node:fs'
import path from 'node:path'
import { loadBundle } from '@/lib/content/loader'
import type { Bundle } from '@/lib/content/loader'
import { runAssessment } from '@/lib/server/engine'
import type { Provider } from '@/lib/server/provider'
import {
  createAssessment,
  currentPrompt,
  hasAnswered,
  canSubmit
} from '@/lib/assessment/state'
import { versions } from '@/lib/assessment/schema'
import type { Operation } from '@/lib/assessment/schema'
import { evidenceReadiness } from '@/lib/assessment/readiness'
import { personaProfileSchema, personas, replyForPrompt } from './catalog'
import type { Persona, ScriptedReply } from './catalog'
import { scriptedProvider } from './synthetic-provider'
import { rankingSchema, suiteSchema } from './schema'
import type { Journey, JourneyStep, JourneySuite } from './schema'
import type { Participant } from './participant'
import type { ParticipantExchange } from './schema'
import { JourneyFailure } from './failure'

export function journeyHashes(bundle: Bundle) {
  const hash = (value: string) =>
    createHash('sha256').update(value).digest('hex')
  const collect = (directory: string): string[] =>
    readdirSync(directory, { withFileTypes: true })
      .flatMap((e) =>
        e.isDirectory()
          ? collect(path.join(directory, e.name))
          : e.name.endsWith('.ts') && !e.name.endsWith('.test.ts')
            ? [path.join(directory, e.name)]
            : []
      )
      .sort()
  const files = ['lib/assessment', 'lib/server', 'lib/journeys'].flatMap(
    collect
  )
  return {
    inputHash: hash(JSON.stringify(personas)),
    engineHash: hash(
      files.map((file) => `${file}\n${readFileSync(file, 'utf8')}`).join('\n')
    ),
    contentHash: hash(JSON.stringify(bundle))
  }
}

export async function runPersona(
  persona: Persona,
  bundle: Bundle,
  turns = 5,
  live?: Provider,
  participant?: Participant
): Promise<Journey> {
  if (!Number.isInteger(turns) || turns < 1 || turns > 6)
    throw new Error('Journey turn bound is 1–6')
  if (participant && live?.kind !== 'live')
    throw new Error(
      'Generated participants require the live assessment provider'
    )
  const scripted = scriptedProvider(persona, bundle)
  const provider = live ?? scripted.provider
  let state = createAssessment(
    `journey-${live ? randomUUID() : createHash('sha256').update(persona.id).digest('hex').slice(0, 20)}`,
    live ? versions.model : 'persona-script-v1'
  )
  state.versions.content = bundle.manifest.contentVersion
  state.versions.rubric = bundle.manifest.rubricVersion
  const steps: JourneyStep[] = []
  const participantExchanges: ParticipantExchange[] = []
  let pendingAnswer: string | null = null
  let firstReadyAnswer: number | null = null
  let error: string | null = null
  let stopped = 'turn budget reached'
  async function step(operation: Operation, reply?: ScriptedReply) {
    if (reply) scripted.setReply(reply)
    const previous = state
    const before = evidenceReadiness(previous)
    const response = await runAssessment(
      {
        requestId: `${state.id}:step${steps.length + 1}`,
        assessment: state,
        operation,
        debug: true
      },
      provider,
      bundle,
      true
    )
    state = response.assessment
    const readiness = evidenceReadiness(state)
    if (readiness.ready && firstReadyAnswer === null)
      firstReadyAnswer = state.answers.length
    const decision = response.debug!.decisions.find(
      (d) => d.action === 'routing priorities and tie-break by ID'
    )
    const rankings = rankingSchema.array().parse(decision?.detail ?? [])
    steps.push({
      ordinal: steps.length + 1,
      operation: operation.type as JourneyStep['operation'],
      prompt: currentPrompt(previous),
      answer: operation.type === 'answer' ? operation.text : null,
      scriptKey: reply?.key ?? null,
      disposition:
        operation.type === 'answer'
          ? (state.attempts.at(-1)?.disposition ?? null)
          : null,
      status: state.status,
      readinessBefore: before,
      readiness,
      coverageAdded: Object.keys(state.coverage).filter(
        (v) =>
          previous.coverage[v as keyof typeof previous.coverage] !==
            'assessed' &&
          state.coverage[v as keyof typeof state.coverage] === 'assessed'
      ) as JourneyStep['coverageAdded'],
      nextPrompt:
        currentPrompt(previous).id !== currentPrompt(state).id
          ? currentPrompt(state)
          : null,
      rankings,
      paperclips: state.recovery.paperclipActive,
      stages: response.debug!.stages.map((s) => ({
        name: s.name,
        model: s.model,
        questions: Object.keys(s.questions).length,
        attempts: s.attempts,
        usage: s.usage
      })),
      trace: response.debug
    })
  }
  try {
    for (const text of persona.recoveryPrelude)
      await step({ type: 'answer', text })
    if (persona.recoveryPrelude.length && state.status === 'paused')
      await step({ type: 'retry' })
    for (let i = 0; i < turns; i++) {
      if (state.status === 'capped') {
        stopped = 'app prompt cap reached'
        break
      }
      if (hasAnswered(state)) {
        if (state.status === 'results') await step({ type: 'continue' })
        else {
          stopped = 'no further question available'
          break
        }
      }
      if (!canSubmit(state)) {
        stopped = 'recovery requires editorial inspection'
        break
      }
      const prompt = bundle.prompts.find(
        (p) => p.id === currentPrompt(state).promptId
      )
      if (!prompt) throw new Error('Chosen prompt has no scripted answer')
      if (participant) {
        const exchange = await participant.generate({
          persona,
          prompt: currentPrompt(state),
          history: steps
            .filter((s) => s.answer !== null)
            .map((s) => ({
              question: s.prompt.text,
              answer: s.answer!
            })),
          recoveryGuidance:
            state.status === 'recovery'
              ? prompt.recoveryVariants.clarification
              : null
        })
        participantExchanges.push(exchange)
        pendingAnswer = exchange.response.text
        await step({ type: 'answer', text: pendingAnswer })
        pendingAnswer = null
      } else {
        const reply = replyForPrompt(persona, prompt)
        await step({ type: 'answer', text: reply.text }, reply)
      }
      if (state.status === 'paused') {
        stopped = 'paused for recovery or unavailable evidence'
        break
      }
    }
    if (evidenceReadiness(state).ready && state.status !== 'capped')
      await step({ type: 'project' })
    else if (!state.result)
      stopped =
        state.status === 'paused' ? stopped : 'more supported coverage needed'
  } catch (err) {
    // Transport bodies may contain credentials: save completed steps only and a
    // bounded local message, never raw provider errors or environment values.
    error =
      err instanceof JourneyFailure
        ? err.message
        : 'Run stopped before completing an operation. Inspect the saved exchanges and pending answer; check provider access, request/cost budgets or script coverage locally.'
    stopped = 'operation failed'
  }
  const journey: Journey = {
    personaId: persona.id,
    personaSnapshot: live
      ? personaProfileSchema.parse(persona)
      : structuredClone(persona),
    steps,
    result: state.result,
    stopped,
    error,
    firstReadyAnswer,
    accepted: state.answers.length,
    finalReadiness: evidenceReadiness(state),
    components: state.result?.components ?? []
  }
  if (participant) {
    journey.participantExchanges = participantExchanges
    journey.pendingAnswer = pendingAnswer
  }
  return journey
}

export async function runJourneySuite({
  id,
  personaId,
  turns = 5,
  live,
  participant,
  budgetReport,
  costReport,
  onJourney
}: {
  id: string
  personaId?: string
  turns?: number
  live?: Provider
  participant?: Participant
  budgetReport?: () => JourneySuite['requestBudget']
  costReport?: () => JourneySuite['cost']
  onJourney?: (journey: Journey) => void
}) {
  const bundle = loadBundle()
  const hashes = journeyHashes(bundle)
  const selected = personaId
    ? personas.filter((p) => p.id === personaId)
    : personas
  if (!selected.length) throw new Error('Unknown persona')
  const journeys: Journey[] = []
  for (const persona of selected) {
    const journey = await runPersona(persona, bundle, turns, live, participant)
    journeys.push(journey)
    onJourney?.(journey)
    if (live && journey.error && journey.accepted === 0) break
  }
  const suite: JourneySuite = {
    schemaVersion: 1,
    id,
    createdAt: new Date().toISOString(),
    mode: live ? 'live' : 'synthetic',
    authoring: participant
      ? 'OpenAI participant with live Jev assessment'
      : 'Codex-authored fictional answer scripts',
    versions: {
      ...versions,
      model: live ? versions.model : 'persona-script-v1'
    },
    ...hashes,
    turns,
    requestBudget: budgetReport?.() ?? null,
    journeys
  }
  if (participant) suite.participantModel = participant.model
  if (costReport) suite.cost = costReport()
  return suiteSchema.parse(suite)
}

export function withoutTraces(suite: JourneySuite): JourneySuite {
  return {
    ...suite,
    journeys: suite.journeys.map((j) => ({
      ...j,
      steps: j.steps.map((s) => {
        const step = { ...s }
        delete step.trace
        return step
      })
    }))
  }
}
