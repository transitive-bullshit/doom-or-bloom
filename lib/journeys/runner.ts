import 'server-only'
import { createHash, randomUUID } from 'node:crypto'
import { readFileSync, readdirSync } from 'node:fs'
import path from 'node:path'
import { loadBundle } from '@/lib/content/loader'
import type { Bundle } from '@/lib/content/loader'
import { AssessmentFailure } from '@/lib/server/assessment-failure'
import { runAssessment } from '@/lib/server/engine'
import { projectionInput } from '@/lib/server/projection-input'
import type { Provider } from '@/lib/server/provider'
import {
  createAssessment,
  currentPrompt,
  hasAnswered,
  canSubmit,
  issuePrompt
} from '@/lib/assessment/state'
import { versions, vectorSchema } from '@/lib/assessment/schema'
import type { Operation, DebugStage } from '@/lib/assessment/schema'
import { evidenceReadiness } from '@/lib/assessment/readiness'
import { personaProfileSchema, personas } from './catalog'
import { fixedUserAnswers, fixedUserPersona } from './fixed'
import { recoveryPreludes } from './scenarios'
import type { Persona } from './catalog'
import type { Prompt } from '@/lib/content/schema'
import { rankingSchema, suiteSchema } from './schema'
import type {
  Journey,
  JourneyStep,
  JourneySuite,
  FailedOperation
} from './schema'
import type { Participant } from './participant'
import type { ParticipantExchange } from './schema'
import { JourneyFailure, providerFailure } from './failure'

export function journeyHashes(
  bundle: Bundle,
  inputs: unknown = personas,
  includeMechanical = false
) {
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
  const files = ['lib/assessment', 'lib/server', 'lib/journeys']
    .flatMap(collect)
    .filter(
      (file) =>
        includeMechanical || !file.startsWith('lib/journeys/mechanical/')
    )
  return {
    inputHash: hash(JSON.stringify(inputs)),
    engineHash: hash(
      files.map((file) => `${file}\n${readFileSync(file, 'utf8')}`).join('\n')
    ),
    contentHash: hash(JSON.stringify(bundle))
  }
}

// Explicit adapter for deterministic engine tests; live callers never supply it.
export type MechanicalJourney = {
  provider: Provider
  reply(prompt: Prompt): { text: string; key: string }
  snapshot: Journey['personaSnapshot']
  prelude: string[]
}

export async function runPersona(
  persona: Persona,
  bundle: Bundle,
  turns = 5,
  live?: Provider,
  participant?: Participant,
  exerciseResults = false,
  resume?: Journey,
  mechanical?: MechanicalJourney
): Promise<Journey> {
  if (!Number.isInteger(turns) || turns < 1 || turns > 6)
    throw new Error('Journey turn bound is 1–6')
  if (participant && live?.kind !== 'live')
    throw new Error(
      'Generated participants require the live assessment provider'
    )
  if (resume && (!resume.failedOperation || !live || participant))
    throw new Error(
      'Resume requires a saved failed operation and an evaluator, without a participant generator'
    )
  const source = live ?? mechanical?.provider
  const fixed = persona.id === fixedUserPersona.id ? fixedUserAnswers : null
  if (!source || (!resume && !participant && !mechanical && !fixed))
    throw new Error(
      'Journey runs require an evaluator and generated participant; mechanical tests must supply an explicit adapter'
    )
  const prelude = mechanical?.prelude ?? recoveryPreludes.get(persona.id) ?? []
  let currentStage: NonNullable<Journey['failureStage']> = 'operation'
  let completedStages: DebugStage[] = []
  let failedOperation: FailedOperation | undefined
  let failedElapsedMs = 0
  const provider: Provider = {
    kind: source.kind,
    async evaluate(...args) {
      const questions = args[1]
      currentStage = questions.disposition
        ? 'interpret'
        : Object.keys(questions).some((id) => id.endsWith(':score'))
          ? 'project'
          : 'route'
      const started = performance.now()
      try {
        const result = await source.evaluate(...args)
        const completed: DebugStage = {
          name:
            currentStage === 'interpret'
              ? 'A: interpret'
              : currentStage === 'project'
                ? 'D: projection'
                : questions.tension_pair
                  ? 'C: clarify tension'
                  : 'C: route',
          state: args[0],
          questions,
          answers: result.answers,
          model: result.model,
          elapsedMs: Math.round(performance.now() - started),
          inputBytes: Buffer.byteLength(
            JSON.stringify({ state: args[0], questions })
          ),
          outputBytes: Buffer.byteLength(JSON.stringify(result.answers)),
          usage: result.usage,
          attempts: result.attempts
        }
        if (result.requests) completed.requests = result.requests
        completedStages.push(completed)
        return result
      } catch (err) {
        failedElapsedMs = Math.round(performance.now() - started)
        throw providerFailure('Jev', err)
      }
    }
  }
  let state = resume?.failedOperation
    ? structuredClone(resume.failedOperation.assessment)
    : createAssessment(
        `journey-${live ? randomUUID() : createHash('sha256').update(persona.id).digest('hex').slice(0, 20)}`,
        live ? versions.model : 'persona-script-v1'
      )
  if (!resume) {
    state.versions.content = bundle.manifest.contentVersion
    state.versions.rubric = bundle.manifest.rubricVersion
  }
  const steps: JourneyStep[] = structuredClone(resume?.steps ?? [])
  const participantExchanges: ParticipantExchange[] = structuredClone(
    resume?.participantExchanges ?? []
  )
  let pendingAnswer: string | null = resume?.pendingAnswer ?? null
  let firstReadyAnswer: number | null = resume?.firstReadyAnswer ?? null
  let error: string | null = null
  let stopped = 'turn budget reached'
  let earlyResult = false
  const answerSnapshots = !mechanical
  let latestResult = resume?.result ?? null
  async function step(
    operation: Operation,
    reply?: { text: string; key: string },
    snapshot = false
  ) {
    currentStage = 'operation'
    completedStages = []
    failedElapsedMs = 0
    const previous = state
    const before = evidenceReadiness(previous)
    const requestId = `${state.id}:step${steps.length + 1}`
    const response = await runAssessment(
      {
        requestId,
        assessment: state,
        operation,
        debug: true
      },
      provider,
      bundle,
      true
    ).catch((err: unknown) => {
      if (err instanceof AssessmentFailure) {
        completedStages = err.trace.stages.filter(
          (stage) => Object.keys(stage.answers).length > 0
        )
        err = err.cause
      }
      const safe =
        err instanceof JourneyFailure
          ? err
          : new JourneyFailure('Assessment operation failed before completion.')
      failedOperation = {
        requestId,
        assessment: structuredClone(previous),
        operation,
        completedStages,
        stage: currentStage as FailedOperation['stage'],
        elapsedMs: failedElapsedMs,
        error: safe.message,
        attempts: safe.evaluation?.attempts ?? null
      }
      if (snapshot) failedOperation.snapshot = true
      if (safe.evaluation?.requests)
        failedOperation.requests = safe.evaluation.requests
      throw safe
    })
    if (snapshot) {
      const recorded = steps.at(-1)!
      recorded.result = response.assessment.result ?? undefined
      recorded.resultState = projectionInput(previous, bundle)
      delete recorded.resultUnavailable
      latestResult = response.assessment.result
      if (recorded.trace && response.debug) {
        recorded.trace.stages.push(...response.debug.stages)
        recorded.trace.decisions.push(...response.debug.decisions)
      }
      recorded.stages.push(
        ...response.debug!.stages.map((s) => ({
          name: s.name,
          model: s.model,
          questions: Object.keys(s.questions).length,
          attempts: s.attempts,
          usage: s.usage
        }))
      )
      return
    }
    state = response.assessment
    const readiness = evidenceReadiness(state)
    if (readiness.ready && firstReadyAnswer === null)
      firstReadyAnswer = state.answers.length
    const decision = response.debug!.decisions.find(
      (d) => d.action === 'routing priorities and tie-break by ID'
    )
    const rankings = rankingSchema.array().parse(decision?.detail ?? [])
    const recorded: JourneyStep = {
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
    }
    if (
      exerciseResults &&
      state.result &&
      ['results', 'capped'].includes(state.status)
    )
      recorded.result = state.result
    if (!answerSnapshots || operation.type === 'answer') steps.push(recorded)
    if (answerSnapshots && operation.type === 'answer') {
      recorded.resultState = projectionInput(state, bundle)
      if (state.result?.evidenceRevision === state.evidenceRevision) {
        recorded.result = state.result
        latestResult = state.result
      } else if (readiness.ready) {
        recorded.resultUnavailable =
          'Projection did not complete; inspect the saved failure.'
        await step({ type: 'project' }, undefined, true)
      } else {
        recorded.resultUnavailable =
          'The real readiness gate does not yet allow a result.'
        latestResult = null
      }
    }
  }
  try {
    if (resume?.failedOperation) {
      await step(
        resume.failedOperation.operation,
        undefined,
        resume.failedOperation.snapshot ?? false
      )
      pendingAnswer = null
      stopped = 'saved operation resumed'
    } else {
      for (const text of prelude) await step({ type: 'answer', text })
      if (prelude.length && state.status === 'paused')
        await step({ type: 'retry' })
      for (let i = 0; i < (fixed ? fixed.length : turns); i++) {
        if (fixed) {
          const original = fixed[i]!
          const authored = bundle.prompts.find(
            (p) => p.id === original.promptId && p.text === original.question
          )
          if (!authored)
            throw new Error(
              'Fixed transcript question no longer matches its authored replay bundle'
            )
          // The original transcript is fixed, not answers transplanted onto a
          // newly selected question. Preserve the actual router decision in the prior step.
          if (
            currentPrompt(state).text !== original.question ||
            hasAnswered(state)
          ) {
            state.prompts = state.prompts.filter((p) =>
              state.answers.some((a) => a.promptInstanceId === p.id)
            )
            state = issuePrompt(state, {
              promptId: authored.id,
              text: original.question,
              family: authored.family,
              variant: 'original',
              sourceEvidenceIds: []
            })
          }
          state.status = 'answering'
          await step(
            { type: 'answer', text: original.answer },
            { text: original.answer, key: 'fixed-original-answer' }
          )
          steps.at(-1)?.trace?.decisions.push({
            action: 'fixed transcript replay',
            detail: {
              originalQuestion: original.question,
              nextRouterQuestion: steps.at(-1)?.nextPrompt?.text ?? null,
              note: 'Next replay question is held fixed, regardless of the router recommendation.'
            }
          })
          if (state.answers.length !== i + 1)
            throw new Error('An original fixed answer was not accepted')
          stopped = 'fixed transcript replay complete'
          continue
        }
        if (state.status === 'capped') {
          stopped = 'app prompt cap reached'
          break
        }
        if (hasAnswered(state)) {
          if (state.status === 'results' && participant) {
            stopped = 'automatic result: no consequential unanswered follow-up'
            break
          } else if (state.status === 'results')
            await step({ type: 'continue' })
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
        if (!prompt)
          throw new Error('Chosen prompt is missing from the content bundle')
        if (participant) {
          currentStage = 'participant'
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
          if (!mechanical) throw new Error('Missing participant generator')
          const reply = mechanical.reply(prompt)
          await step({ type: 'answer', text: reply.text }, reply)
        }
        if (state.status === 'paused') {
          stopped = 'paused for recovery or unavailable evidence'
          break
        }
        if (
          !answerSnapshots &&
          exerciseResults &&
          evidenceReadiness(state).ready &&
          i < turns - 1
        ) {
          if (i === turns - 2) {
            await step({ type: 'project' })
            const component = state
              .result!.components.filter(
                (c) => c.claim !== null && c.evidenceIds.length > 0
              )
              .sort(
                (a, b) =>
                  Number(a.value !== null) - Number(b.value !== null) ||
                  b.range[1] - b.range[0] - (a.range[1] - a.range[0])
              )[0]
            if (component) {
              await step(
                component.vector === 'catastrophic_risk'
                  ? {
                      type: 'clarify',
                      vector: 'risk_landscape',
                      claim: 'catastrophic_risk'
                    }
                  : {
                      type: 'clarify',
                      vector: vectorSchema.parse(component.vector)
                    }
              )
            }
          } else if (!earlyResult) {
            await step({ type: 'project' })
            await step({ type: 'continue' })
            earlyResult = true
          }
        }
      }
      if (
        !answerSnapshots &&
        evidenceReadiness(state).ready &&
        state.status !== 'capped' &&
        (!exerciseResults ||
          state.result?.evidenceRevision !== state.evidenceRevision)
      )
        await step({ type: 'project' })
      else if (!(answerSnapshots ? latestResult : state.result))
        stopped =
          state.status === 'paused' ? stopped : 'more supported coverage needed'
    }
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
    personaSnapshot: resume?.personaSnapshot
      ? structuredClone(resume.personaSnapshot)
      : live
        ? personaProfileSchema.parse(persona)
        : structuredClone(mechanical?.snapshot ?? persona),
    steps,
    result: answerSnapshots ? latestResult : state.result,
    stopped,
    error,
    firstReadyAnswer,
    accepted: state.answers.length,
    finalReadiness: evidenceReadiness(state),
    components:
      (answerSnapshots ? latestResult : state.result)?.components ?? []
  }
  if (participant || resume?.participantExchanges) {
    journey.participantExchanges = participantExchanges
    journey.pendingAnswer = pendingAnswer
  }
  if (error) journey.failureStage = currentStage
  if (failedOperation) journey.failedOperation = failedOperation
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
  if (live?.kind !== 'live' || !participant)
    throw new Error(
      'Live journey suites require Jev and a generated participant'
    )
  const bundle = loadBundle()
  const hashes = journeyHashes(bundle, { personas, fixedUserAnswers })
  const allPersonas = [...personas, fixedUserPersona]
  const selected = personaId
    ? allPersonas.filter((p) => p.id === personaId)
    : allPersonas
  if (!selected.length) throw new Error('Unknown persona')
  const journeys: Journey[] = []
  for (const persona of selected) {
    const journey = await runPersona(
      persona,
      bundle,
      turns,
      live,
      persona.id === fixedUserPersona.id ? undefined : participant
    )
    journeys.push(journey)
    onJourney?.(journey)
    if (journey.error && journey.accepted === 0) break
  }
  const suite: JourneySuite = {
    schemaVersion: 1,
    id,
    createdAt: new Date().toISOString(),
    mode: 'live',
    authoring: 'OpenAI participant with live Jev assessment',
    versions: {
      ...versions,
      model: versions.model
    },
    ...hashes,
    turns,
    requestBudget: budgetReport?.() ?? null,
    journeys
  }
  suite.participantModel = participant.model
  suite.answerSnapshots = true
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
