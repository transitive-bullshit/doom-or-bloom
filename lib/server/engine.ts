import 'server-only'
import type {
  Answer,
  Assessment,
  AssessmentRequest,
  AssessmentResponse,
  Component,
  DebugStage,
  DebugTrace,
  Judgment,
  ModelAnswer,
  Question,
  VectorId
} from '@/lib/assessment/schema'
import { limits, vectorIds, worldviewIds } from '@/lib/assessment/schema'
import {
  acceptAnswer,
  atCap,
  canSubmit,
  currentPrompt,
  eligible,
  hasAnswered,
  issuePrompt,
  recordDisposition,
  segmentAnswer
} from '@/lib/assessment/state'
import { candidatePrompts, rankCandidates } from '@/lib/assessment/routing'
import {
  baseResult,
  emptyComponent,
  quantile
} from '@/lib/assessment/projections'
import type { Bundle } from '@/lib/content/loader'
import { retrieveReferences } from '@/lib/content/loader'
import type { Prompt } from '@/lib/content/schema'
import type { Provider } from './provider'
import { projectionInput } from './projection-input'
import { referenceMetadata, referencePolicy } from './reference-input'
import { timelineContext } from '@/lib/assessment/timeline'
import { selectPresentation } from '@/lib/assessment/presentation'
import { createQuestions } from './questions'

type StageQuestions = Record<string, Question>

function choice(answer: ModelAnswer | undefined) {
  return answer?.type === 'choice' ? answer.choice : null
}
function confidence(answer: ModelAnswer | undefined) {
  return answer && answer.type !== 'noul' ? answer.confidence : 0
}
function supported(answer: ModelAnswer | undefined, threshold: number) {
  return (
    ['stated', 'strongly_implied'].includes(choice(answer) ?? '') &&
    confidence(answer) >= threshold
  )
}
function promptDisplay(prompt: Prompt) {
  return {
    promptId: prompt.id,
    text: prompt.text,
    family: prompt.family,
    variant: 'original',
    sourceEvidenceIds: []
  }
}
function usableHistory(state: Assessment) {
  return state.answers.map((a) => ({
    id: a.id,
    prompt: a.promptText,
    answer: a.text,
    correctionTarget: a.correctionClaimTarget ?? a.correctionTarget ?? null
  }))
}
function activeEvidence(state: Assessment) {
  return state.evidence.filter(
    (e) => e.status !== 'superseded' && e.status !== 'disputed'
  )
}
function catastrophicEvidence(state: Assessment) {
  const correctionIndex = state.answers.findLastIndex(
    (answer) => answer.correctionClaimTarget === 'catastrophic_risk'
  )
  const eligibleAnswers = new Set(
    state.answers.slice(Math.max(0, correctionIndex)).map((answer) => answer.id)
  )
  return activeEvidence(state).filter(
    (e) => e.vector === 'risk_landscape' && eligibleAnswers.has(e.answerId)
  )
}
function evidenceText(state: Assessment, evidenceId: string) {
  const e = state.evidence.find((entry) => entry.id === evidenceId)
  const a = state.answers.find((answer) => answer.id === e?.answerId)
  return a?.spans.find((span) => span.id === e?.spanId)?.text ?? ''
}
function clarificationText(label: string, claim: string | null) {
  return `Our read of ${label.toLowerCase()} was: “${claim}” What would you change about that interpretation?`
}
function validateSnapshot(state: Assessment, bundle: Bundle) {
  if (
    state.versions.content !== bundle.manifest.contentVersion ||
    state.versions.rubric !== bundle.manifest.rubricVersion ||
    state.versions.assessment !== bundle.manifest.assessmentVersion
  )
    throw new Error(
      'This saved assessment uses an unavailable version. Export it or restart.'
    )
  const instances = new Set<string>()
  for (const [index, p] of state.prompts.entries()) {
    const authored = bundle.prompts.find((item) => item.id === p.promptId)
    if (
      !authored ||
      (p.family !== 'clarification' &&
        (p.text !== authored.text || p.family !== authored.family)) ||
      p.ordinal !== index + 1 ||
      instances.has(p.id)
    )
      throw new Error('Invalid prompt history')
    if (p.family === 'clarification') {
      const dimension = p.claimTarget
        ? bundle.rubric.catastrophicRisk
        : bundle.rubric.dimensions.find((d) => d.id === p.target)
      if (
        !dimension ||
        (p.claimTarget && p.target !== 'risk_landscape') ||
        !dimension.levels.some(
          (level) => p.text === clarificationText(dimension.label, level)
        ) ||
        p.sourceEvidenceIds.some(
          (id) =>
            !state.evidence.some((e) => e.id === id && e.vector === p.target)
        )
      )
        throw new Error('Invalid authored clarification')
    } else if (p.target || p.claimTarget)
      throw new Error('Invalid clarification scope')
    instances.add(p.id)
  }
  if (state.prompts[0]?.promptId !== 'root')
    throw new Error('Invalid assessment root')
  const answered = new Set<string>()
  for (const answer of state.answers) {
    const prompt = state.prompts.find((p) => p.id === answer.promptInstanceId)
    if (
      !instances.has(answer.promptInstanceId) ||
      answered.has(answer.promptInstanceId) ||
      answer.promptText !== prompt?.text ||
      answer.correctionTarget !== prompt?.target ||
      answer.correctionClaimTarget !== prompt?.claimTarget
    )
      throw new Error('Invalid answer history')
    answered.add(answer.promptInstanceId)
    for (const span of answer.spans)
      if (answer.text.slice(span.start, span.end) !== span.text)
        throw new Error('Invalid evidence offsets')
  }
  for (const e of state.evidence)
    if (
      !state.answers.some(
        (a) => a.id === e.answerId && a.spans.some((s) => s.id === e.spanId)
      ) ||
      [...e.referenceIds, ...e.contextReferenceIds].some(
        (id) => !bundle.references.some((r) => r.id === id)
      )
    )
      throw new Error('Invalid evidence provenance')
  for (const claim of state.referenceClaims)
    if (
      !bundle.references.some((r) => r.id === claim.referenceId) ||
      !state.answers.some(
        (a) =>
          a.id === claim.answerId && a.spans.some((s) => s.id === claim.spanId)
      )
    )
      throw new Error('Invalid reference claim provenance')
  const count = state.attempts.filter(
    (a) => a.promptInstanceId === currentPrompt(state).id && a.evaluated
  ).length
  if (count !== state.recovery.evaluated)
    throw new Error('Recovery counters do not match history')
}

export async function runAssessment(
  request: AssessmentRequest,
  provider: Provider,
  bundle: Bundle,
  debugEnabled = false,
  signal?: AbortSignal
): Promise<AssessmentResponse> {
  const {
    authoredQuestion,
    dispositionQuestion,
    rubricQuestions,
    spanQuestion,
    statusQuestion
  } = createQuestions(bundle.questionTemplates)
  let state = structuredClone(request.assessment)
  validateSnapshot(state, bundle)
  const baseRevision = state.revision
  const started = performance.now()
  const trace: DebugTrace = {
    requestId: request.requestId,
    baseRevision,
    stages: [],
    decisions: [],
    elapsedMs: 0
  }
  const operationSignal = signal
    ? AbortSignal.any([signal, AbortSignal.timeout(120_000)])
    : AbortSignal.timeout(120_000)
  let remainingAttempts = limits.providerAttempts as number
  const evaluate = async (
    name: string,
    input: unknown,
    questions: StageQuestions
  ) => {
    const stageStarted = performance.now()
    if (remainingAttempts <= 0)
      throw new Error(
        'The local inference request budget was reached. Your answer is saved.'
      )
    const result = await provider.evaluate(
      input,
      questions,
      operationSignal,
      remainingAttempts
    )
    remainingAttempts -= result.attempts
    if (remainingAttempts < 0)
      throw new Error(
        'The evaluator exceeded the local inference request budget'
      )
    const stage: DebugStage = {
      name,
      state: input,
      questions,
      answers: result.answers,
      model: result.model,
      elapsedMs: Math.round(performance.now() - stageStarted),
      inputBytes: Buffer.byteLength(
        JSON.stringify({ state: input, questions })
      ),
      outputBytes: Buffer.byteLength(JSON.stringify(result.answers)),
      usage: result.usage,
      attempts: result.attempts
    }
    trace.stages.push(stage)
    if (provider.kind === 'live' && result.model !== state.versions.model)
      throw new Error(
        'The evaluator model version changed. Restart to use the new version.'
      )
    return result
  }
  const addJudgments = (
    stage: Judgment['stage'],
    answerId: string,
    questions: StageQuestions,
    answers: Record<string, ModelAnswer>,
    model: string
  ) => {
    if (stage === 'route' || stage === 'project')
      state.judgments = state.judgments.filter((j) => j.stage !== stage)
    const judgments = Object.entries(answers).map(([id, answer]) => ({
      id: `${request.requestId}:${stage}:${id}`,
      questionId: id,
      answerId,
      stage,
      question: questions[id]!,
      answer,
      model,
      rubricVersion: state.versions.rubric
    }))
    state.judgments.push(...judgments)
    return judgments
  }
  const route = async (deterministic = false) => {
    if (atCap(state)) return false
    const candidates = candidatePrompts(state, bundle.prompts)
    trace.decisions.push({
      action: 'candidate eligibility',
      detail: candidates.map(({ prompt, reason, missing, repetition }) => ({
        id: prompt.id,
        reason,
        missing,
        repetition
      }))
    })
    const eligibleCandidates = candidates
      .filter((c) => !c.reason)
      .sort((a, b) => {
        const priority = (c: typeof a) =>
          c.missing +
          c.calibration +
          state.unresolved.filter((u) => c.prompt.targets.includes(u.vector))
            .length *
            2 -
          c.repetition -
          c.prompt.effort
        return (
          priority(b) - priority(a) || a.prompt.id.localeCompare(b.prompt.id)
        )
      })
      .slice(0, Math.floor(limits.questions / 4))
    if (!eligibleCandidates.length) return false
    let selected: Prompt
    if (deterministic || state.answers.length === 0)
      selected =
        eligibleCandidates.find((c) => c.prompt.family === 'concretization')
          ?.prompt ?? eligibleCandidates[0]!.prompt
    else {
      const questions: StageQuestions = {}
      for (const { prompt } of eligibleCandidates) {
        for (const benefit of [
          'coverage',
          'ambiguity',
          'tension',
          'projection'
        ] as const)
          questions[`${prompt.id}:${benefit}`] = authoredQuestion(
            `route_${benefit}`,
            { promptId: prompt.id }
          )
      }
      const input = {
        participantEvidence: usableHistory(state),
        coverage: state.coverage,
        unresolved: state.unresolved,
        familiarity: state.familiarity.level,
        calibrationGaps: {
          horizon: !state.answers.some((a) => a.context?.horizonSpanId),
          conviction: !state.answers.some((a) => a.context?.convictionSpanId)
        },
        candidates: eligibleCandidates.map((c) => ({
          id: c.prompt.id,
          text: c.prompt.text,
          targets: c.prompt.targets
        }))
      }
      const evaluation = await evaluate('C: route', input, questions)
      addJudgments(
        'route',
        currentPrompt(state).id,
        questions,
        evaluation.answers,
        evaluation.model
      )
      const ranking = rankCandidates(
        state,
        bundle.prompts,
        evaluation.answers,
        bundle.rubric
      )
      trace.decisions.push({
        action: 'routing priorities and tie-break by ID',
        detail: ranking.map(
          ({
            prompt,
            priority,
            coverage,
            ambiguity,
            tension,
            projection,
            repetition
          }) => ({
            id: prompt.id,
            priority,
            coverage,
            ambiguity,
            tension,
            projection,
            repetition,
            effort: prompt.effort,
            weights: bundle.rubric.routingWeights
          })
        )
      })
      selected = ranking[0]!.prompt
    }
    state = issuePrompt(state, promptDisplay(selected))
    trace.decisions.push({
      action: 'prompt issued',
      detail: { id: selected.id, deterministic }
    })
    return true
  }
  const project = async (capped = false) => {
    if (!eligible(state) && !capped)
      throw new Error('Answer three substantive prompts to unlock your result')
    if (state.result?.evidenceRevision === state.evidenceRevision) {
      state.result.capped = capped || state.result.capped
      state.status = capped ? 'capped' : 'results'
      return
    }
    let components: Component[] = []
    if (eligible(state)) {
      const scores = rubricQuestions(
        bundle.rubric,
        'completeParticipantEvidence and canonical referenceContext; prior typed judgments are interpretations, not independent evidence'
      )
      const questions: StageQuestions = {}
      for (const dimension of bundle.rubric.dimensions) {
        questions[`${dimension.id}:status`] = statusQuestion(
          dimension.meaning,
          'completeParticipantEvidence'
        )
        questions[`${dimension.id}:score`] = scores[dimension.id]!
        if (
          worldviewIds.includes(dimension.id as (typeof worldviewIds)[number])
        )
          questions[`${dimension.id}:position`] = authoredQuestion('position', {
            meaning: dimension.meaning
          })
        const candidates = Object.fromEntries(
          activeEvidence(state)
            .filter((e) => e.vector === dimension.id)
            .map((e) => [e.id, evidenceText(state, e.id)])
        )
        questions[`${dimension.id}:evidence`] = spanQuestion(
          dimension.meaning,
          candidates,
          'the exact active source excerpts supplied as choices'
        )
      }
      const catastrophe = bundle.rubric.catastrophicRisk
      questions['catastrophic_risk:status'] = statusQuestion(
        catastrophe.meaning,
        'completeParticipantEvidence'
      )
      questions['catastrophic_risk:position'] = authoredQuestion('position', {
        meaning: catastrophe.meaning
      })
      questions['catastrophic_risk:score'] = authoredQuestion(
        'catastrophic_score',
        { meaning: catastrophe.meaning },
        catastrophe.levels
      )
      questions['catastrophic_risk:evidence'] = spanQuestion(
        catastrophe.meaning,
        Object.fromEntries(
          catastrophicEvidence(state).map((e) => [
            e.id,
            evidenceText(state, e.id)
          ])
        ),
        'the exact active source excerpts supplied as choices'
      )
      const compact = projectionInput(state, bundle, questions)
      trace.decisions.push({
        action: 'lossless projection source aliases',
        detail: compact.aliases
      })
      const rawEvaluation = await evaluate(
        'D: projection',
        compact.input,
        compact.providerQuestions
      )
      const evaluation = {
        ...rawEvaluation,
        answers: compact.restore(rawEvaluation.answers)
      }
      addJudgments(
        'project',
        `result:${state.evidenceRevision}`,
        questions,
        evaluation.answers,
        evaluation.model
      )
      components = bundle.rubric.dimensions.map((dimension) => {
        const score = evaluation.answers[`${dimension.id}:score`]
        const evidenceId = choice(
          evaluation.answers[`${dimension.id}:evidence`]
        )
        if (
          !supported(
            evaluation.answers[`${dimension.id}:status`],
            bundle.rubric.presenceThreshold
          ) ||
          !evidenceId ||
          evidenceId === 'none' ||
          !activeEvidence(state).some((e) => e.id === evidenceId) ||
          score?.type !== 'score' ||
          (worldviewIds.includes(
            dimension.id as (typeof worldviewIds)[number]
          ) &&
            choice(evaluation.answers[`${dimension.id}:position`]) !==
              'assessable')
        )
          return emptyComponent(dimension.id, dimension.label)
        const max = dimension.levels.length - 1
        const unresolved = state.unresolved.some(
          (item) => item.vector === dimension.id
        )
        return {
          vector: dimension.id,
          label: dimension.label,
          value: score.score / max,
          range: unresolved
            ? [0, 1]
            : [
                quantile(score.probabilities, bundle.rubric.quantiles[0], max),
                quantile(score.probabilities, bundle.rubric.quantiles[1], max)
              ],
          distribution: score.probabilities,
          confidence: score.confidence,
          evidenceIds: [evidenceId],
          claim: dimension.levels[Math.round(score.score)]!
        }
      })
      const score = evaluation.answers['catastrophic_risk:score']
      const sourceId = choice(evaluation.answers['catastrophic_risk:evidence'])
      const fingerprintRisk =
        supported(
          evaluation.answers['catastrophic_risk:status'],
          bundle.rubric.presenceThreshold
        ) &&
        choice(evaluation.answers['catastrophic_risk:position']) ===
          'assessable' &&
        score?.type === 'score' &&
        sourceId &&
        catastrophicEvidence(state).some((e) => e.id === sourceId)
          ? {
              vector: 'catastrophic_risk',
              label: catastrophe.label,
              value: score.score / (catastrophe.levels.length - 1),
              range: state.unresolved.some((u) => u.vector === 'risk_landscape')
                ? ([0, 1] as [number, number])
                : ([
                    quantile(
                      score.probabilities,
                      bundle.rubric.quantiles[0],
                      catastrophe.levels.length - 1
                    ),
                    quantile(
                      score.probabilities,
                      bundle.rubric.quantiles[1],
                      catastrophe.levels.length - 1
                    )
                  ] as [number, number]),
              distribution: score.probabilities,
              confidence: score.confidence,
              evidenceIds: [sourceId],
              claim: catastrophe.levels[Math.round(score.score)]!
            }
          : emptyComponent('catastrophic_risk', catastrophe.label)
      components.push(fingerprintRisk)
    } else
      components = bundle.rubric.dimensions.map((d) =>
        emptyComponent(d.id, d.label)
      )
    for (const c of components.filter((c) =>
      vectorIds.includes(c.vector as VectorId)
    ))
      state.coverage[c.vector as VectorId] =
        c.value === null ? 'unassessed' : 'assessed'
    const result = baseResult(state, components, bundle.rubric, capped)
    const horizon = timelineContext(state)
    result.fingerprint = [
      {
        ...emptyComponent('timeline', 'Timeline'),
        claim: horizon?.span.text ?? null,
        evidenceIds: horizon
          ? activeEvidence(state)
              .filter(
                (e) =>
                  e.answerId === horizon.answer.id &&
                  e.vector === 'capability_trajectory'
              )
              .map((e) => e.id)
          : []
      },
      ...[
        'beneficial_potential',
        'catastrophic_risk',
        'technical_controllability',
        'institutional_competence'
      ].map(
        (id) =>
          components.find((c) => c.vector === id) ??
          emptyComponent(id, bundle.rubric.catastrophicRisk.label)
      )
    ]
    const sourceIds = new Set([
      ...state.referenceClaims.map((c) => c.referenceId),
      ...activeEvidence(state).flatMap((e) => [
        ...e.referenceIds,
        ...e.contextReferenceIds
      ])
    ])
    result.sources = bundle.references
      .filter((r) => sourceIds.has(r.id))
      .map((r) => ({
        id: r.id,
        title: r.title,
        urls: r.sources.map((s) => s.url),
        status: r.status,
        accessed: r.sources[0]!.accessed
      }))
    const presentation = selectPresentation(state, components, bundle)
    result.findings = presentation.findings
    result.resources = presentation.resources
    state.result = result
    state.status = capped ? 'capped' : 'results'
    trace.decisions.push({
      action: 'projection composition',
      detail: {
        horizontalWeights: bundle.rubric.horizontalWeights,
        verticalWeights: 'equal supported weights',
        components,
        horizontal: result.horizontal,
        vertical: result.vertical,
        selectedFindings: result.findings.map((f) => f.id),
        selectedResources: result.resources.map((r) => r.id)
      }
    })
  }

  const op = request.operation
  if (op.type === 'answer') {
    if (!canSubmit(state))
      throw new Error('Choose a recovery action before answering this prompt')
    const p = currentPrompt(state)
    const answerId = `${p.id}:a`
    const spans = segmentAnswer(op.text, answerId)
    const candidates = Object.fromEntries(spans.map((s) => [s.id, s.text]))
    const questions: StageQuestions = {}
    questions.disposition = dispositionQuestion
    questions.familiarity = authoredQuestion('familiarity')
    questions.topic = authoredQuestion('topic')
    for (const dimension of bundle.rubric.dimensions) {
      questions[`${dimension.id}:status`] = statusQuestion(
        dimension.meaning,
        '`current.answer` in the context of usableHistory'
      )
      questions[`${dimension.id}:span`] = spanQuestion(
        dimension.meaning,
        candidates
      )
    }
    for (const [key, meaning] of [
      ['horizon', 'an explicitly expressed forecast horizon or milestone'],
      [
        'conviction',
        'an explicitly expressed strength of the participant’s own belief'
      ],
      ['assumption', 'an explicitly expressed consequential assumption']
    ] as const)
      questions[key] = spanQuestion(meaning, candidates)
    const tensionTemplate = authoredQuestion('tension')
    if (tensionTemplate.type !== 'choice')
      throw new Error('Invalid tension template')
    questions.tension = authoredQuestion(
      'tension',
      {},
      {
        ...Object.fromEntries(
          bundle.rubric.dimensions.map((d) => [d.id, d.meaning])
        ),
        ...tensionTemplate.criteria
      }
    )
    const input = {
      current: { prompt: p.text, answer: op.text, spans },
      usableHistory: usableHistory(state).slice(-5),
      clarificationTarget: p.claimTarget ?? p.target ?? null
    }
    const evaluation = await evaluate('A: interpret', input, questions)
    const disposition = choice(evaluation.answers.disposition)
    if (
      !['usable', 'non_answer', 'navigation', 'needs_clarification'].includes(
        disposition ?? ''
      )
    )
      throw new Error('Invalid answer disposition')
    state = recordDisposition(
      state,
      disposition as
        | 'usable'
        | 'non_answer'
        | 'navigation'
        | 'needs_clarification',
      confidence(evaluation.answers.disposition),
      request.requestId,
      bundle.rubric.nonAnswerThreshold
    )
    trace.decisions.push({
      action: 'response disposition and recovery gate',
      detail: {
        raw: evaluation.answers.disposition,
        threshold: bundle.rubric.nonAnswerThreshold,
        recovery: state.recovery,
        consumed: state.attempts.at(-1)?.disposition
      }
    })
    if (state.attempts.at(-1)?.disposition === 'usable') {
      const answer: Answer = {
        id: answerId,
        promptInstanceId: p.id,
        promptText: p.text,
        text: op.text,
        spans,
        substantive: true,
        correctionTarget: p.target,
        correctionClaimTarget: p.claimTarget,
        context: Object.fromEntries(
          ['horizon', 'conviction', 'assumption'].map((key) => [
            `${key}SpanId`,
            spans.some((s) => s.id === choice(evaluation.answers[key]))
              ? choice(evaluation.answers[key])
              : null
          ])
        ) as NonNullable<Answer['context']>
      }
      state = acceptAnswer(state, answer)
      const judgments = addJudgments(
        'interpret',
        answerId,
        questions,
        evaluation.answers,
        evaluation.model
      )
      const familiarity = choice(evaluation.answers.familiarity)
      if (
        ['general', 'expert'].includes(familiarity ?? '') &&
        (state.familiarity.level !== 'expert' || familiarity === 'expert') &&
        confidence(evaluation.answers.familiarity) >=
          bundle.rubric.presenceThreshold
      )
        state.familiarity = {
          level: familiarity as 'general' | 'expert',
          answerId,
          judgmentId: judgments.find((j) => j.questionId === 'familiarity')!.id
        }
      if (p.target && !p.claimTarget) {
        state.coverage[p.target] = 'unassessed'
        state.evidence = state.evidence.map((e) =>
          e.vector === p.target ? { ...e, status: 'superseded' } : e
        )
        state.unresolved = state.unresolved.filter(
          (item) => item.vector !== p.target
        )
      }
      for (const dimension of bundle.rubric.dimensions) {
        const status = evaluation.answers[`${dimension.id}:status`]
        const spanId = choice(evaluation.answers[`${dimension.id}:span`])
        if (
          supported(status, bundle.rubric.presenceThreshold) &&
          spans.some((s) => s.id === spanId)
        ) {
          state.evidence.push({
            id: `${answerId}:e:${dimension.id}`,
            answerId,
            spanId: spanId!,
            vector: dimension.id,
            status: choice(status) === 'stated' ? 'stated' : 'strongly_implied',
            judgmentIds: judgments
              .filter((j) => j.questionId.startsWith(dimension.id))
              .map((j) => j.id),
            referenceIds: [],
            contextReferenceIds: [],
            horizonSpanId:
              choice(evaluation.answers.horizon) === 'none'
                ? null
                : choice(evaluation.answers.horizon),
            convictionSpanId:
              choice(evaluation.answers.conviction) === 'none'
                ? null
                : choice(evaluation.answers.conviction),
            assumptionSpanId:
              choice(evaluation.answers.assumption) === 'none'
                ? null
                : choice(evaluation.answers.assumption)
          })
          state.coverage[dimension.id] = 'assessed'
        } else if (
          choice(status) === 'unclear' ||
          choice(status) === 'weakly_inferred'
        ) {
          state.coverage[dimension.id] = 'ambiguous'
          if (
            !state.unresolved.some(
              (u) => u.vector === dimension.id && u.kind === 'ambiguity'
            )
          )
            state.unresolved.push({
              id: `${answerId}:u:${dimension.id}`,
              vector: dimension.id,
              evidenceIds: [],
              kind: 'ambiguity'
            })
        }
      }
      const tension = choice(evaluation.answers.tension)
      if (
        vectorIds.includes(tension as VectorId) &&
        confidence(evaluation.answers.tension) >=
          bundle.rubric.presenceThreshold
      )
        state.unresolved.push({
          id: `${answerId}:tension`,
          vector: tension as VectorId,
          evidenceIds: state.evidence
            .filter((e) => e.vector === tension)
            .map((e) => e.id),
          kind: 'tension'
        })
      const topic = choice(evaluation.answers.topic)
      const references = retrieveReferences(
        bundle,
        op.text,
        topic && topic !== 'none' ? [topic] : []
      )
      trace.decisions.push({
        action: 'reference candidates',
        detail: references.map((r) => ({
          id: r.reference.id,
          aliasMatched: r.matched,
          score: r.score
        }))
      })
      if (references.length) {
        const identifyQuestions: StageQuestions = Object.fromEntries(
          references.map(({ reference }) => [
            reference.id,
            authoredQuestion('identity', { title: reference.title })
          ])
        )
        const identity = await evaluate(
          'B1: identify references',
          {
            currentAnswer: op.text,
            referencePolicy,
            candidates: references.map(({ reference }) => ({
              id: reference.id,
              title: reference.title,
              ...referenceMetadata(reference),
              aliases: reference.aliases
            }))
          },
          identifyQuestions
        )
        addJudgments(
          'identify',
          answerId,
          identifyQuestions,
          identity.answers,
          identity.model
        )
        const identified = references.filter(
          ({ reference }) =>
            choice(identity.answers[reference.id]) === 'mentioned' &&
            confidence(identity.answers[reference.id]) >=
              bundle.rubric.presenceThreshold
        )
        const selected = identified.slice(0, limits.resolvedReferences)
        if (
          identified.length > selected.length ||
          Object.values(identity.answers).some((a) => choice(a) === 'unclear')
        )
          state.unresolved.push({
            id: `${answerId}:reference`,
            vector: 'grounded_understanding',
            evidenceIds: [],
            kind: 'reference'
          })
        if (selected.length) {
          const groundQuestions: StageQuestions = {}
          for (const { reference } of selected) {
            groundQuestions[`${reference.id}:span`] = spanQuestion(
              `the participant's claim invoking ${reference.title}`,
              candidates
            )
            for (const check of [
              'attribution',
              'fit',
              'uncertainty',
              'materiality'
            ] as const)
              groundQuestions[`${reference.id}:${check}`] = authoredQuestion(
                `ground_${check}`,
                { referenceId: reference.id }
              )
          }
          const grounding = await evaluate(
            'B2: grounded claims',
            {
              currentAnswer: op.text,
              spans,
              referencePolicy,
              canonicalSummaries: selected.map(({ reference }) => ({
                id: reference.id,
                title: reference.title,
                ...referenceMetadata(reference),
                summary: reference.summary
              }))
            },
            groundQuestions
          )
          const groundJudgments = addJudgments(
            'ground',
            answerId,
            groundQuestions,
            grounding.answers,
            grounding.model
          )
          for (const { reference } of selected) {
            const spanId = choice(grounding.answers[`${reference.id}:span`])
            if (spanId && spans.some((s) => s.id === spanId))
              state.referenceClaims.push({
                id: `${answerId}:ref:${reference.id}`,
                answerId,
                spanId,
                referenceId: reference.id,
                ...(Object.fromEntries(
                  ['attribution', 'fit', 'uncertainty', 'materiality'].map(
                    (key) => [
                      key,
                      choice(grounding.answers[`${reference.id}:${key}`]) ??
                        'unclear'
                    ]
                  )
                ) as Pick<
                  Assessment['referenceClaims'][number],
                  'attribution' | 'fit' | 'uncertainty' | 'materiality'
                >),
                judgmentIds: groundJudgments
                  .filter((j) => j.questionId.startsWith(`${reference.id}:`))
                  .map((j) => j.id)
              })
          }
          for (const e of state.evidence.filter(
            (item) => item.answerId === answerId
          )) {
            e.referenceIds = selected
              .filter(
                ({ reference }) =>
                  choice(grounding.answers[`${reference.id}:span`]) === e.spanId
              )
              .map(({ reference }) => reference.id)
            e.judgmentIds.push(
              ...groundJudgments
                .filter((j) =>
                  e.referenceIds.some((id) => j.questionId.startsWith(`${id}:`))
                )
                .map((j) => j.id)
            )
          }
          for (const { reference } of selected)
            if (
              choice(grounding.answers[`${reference.id}:materiality`]) ===
                'yes' &&
              confidence(grounding.answers[`${reference.id}:materiality`]) >=
                0.85 &&
              ['attribution', 'fit'].some(
                (check) =>
                  choice(grounding.answers[`${reference.id}:${check}`]) ===
                    'no' &&
                  confidence(grounding.answers[`${reference.id}:${check}`]) >=
                    0.85
              )
            )
              state.unresolved.push({
                id: `${answerId}:reference:${reference.id}`,
                vector: 'grounded_understanding',
                evidenceIds: state.evidence
                  .filter((e) => e.answerId === answerId)
                  .map((e) => e.id),
                kind: 'reference'
              })
        }
      } else if (topic && topic !== 'none')
        state.unresolved.push({
          id: `${answerId}:unknown-reference`,
          vector: 'grounded_understanding',
          evidenceIds: [],
          kind: 'reference'
        })
      if (atCap(state)) await project(true)
      else if (p.target && eligible(state)) await project()
      else if (!(await route())) {
        if (eligible(state)) await project()
        else state.status = 'paused'
      }
    } else {
      trace.decisions.push({
        action: 'speculative profile judgments discarded; later stages skipped',
        detail: Object.keys(evaluation.answers).filter(
          (id) => id !== 'disposition'
        )
      })
      if (atCap(state)) await project(true)
    }
  } else if (op.type === 'project')
    await project(atCap(state) && hasAnswered(state))
  else if (op.type === 'skip') {
    if (!(await route(state.answers.length === 0))) await project(atCap(state))
  } else if (op.type === 'continue') {
    if (atCap(state)) throw new Error('Restart to begin another assessment')
    if (hasAnswered(state)) {
      if (!(await route())) await project()
    } else {
      state.status =
        state.recovery.evaluated >= limits.recovery ? 'paused' : 'answering'
    }
  } else if (op.type === 'clarify') {
    if (!state.result || atCap(state))
      throw new Error(
        'Clarification is unavailable; restart for another assessment'
      )
    if (op.claim && op.vector !== 'risk_landscape')
      throw new Error('Invalid clarification scope')
    const component = state.result.components.find(
      (c) => c.vector === (op.claim ?? op.vector) && c.value !== null
    )
    if (!component) throw new Error('Select an assessed claim to clarify')
    const prompt = bundle.prompts.find((p) => p.id === 'concrete.general')!
    state = issuePrompt(state, {
      ...promptDisplay(prompt),
      family: 'clarification',
      text: clarificationText(component.label, component.claim),
      target: op.vector,
      claimTarget: op.claim,
      sourceEvidenceIds: component.evidenceIds
    })
  } else if (op.type === 'retry') {
    if (
      state.recovery.evaluated >= limits.recovery ||
      hasAnswered(state) ||
      state.status === 'capped'
    )
      throw new Error('Try a different question or restart')
    state.status = 'recovery'
    state.recovery.paperclipActive = false
  } else if (op.type === 'dismiss') state.recovery.paperclipActive = false
  else if (op.type === 'stop') {
    state.status = 'paused'
    state.recovery.reason = 'stopped'
    state.recovery.clearMisses = 0
    state.recovery.paperclipActive = false
  } else if (op.type === 'complete') {
    if (!state.result) throw new Error('View a result before completing')
    state.status = atCap(state) ? 'capped' : 'completed'
  }
  state.revision = baseRevision + 1
  trace.elapsedMs = Math.round(performance.now() - started)
  return {
    assessmentId: state.id,
    baseRevision,
    requestId: request.requestId,
    assessment: state,
    provider: provider.kind,
    debug: debugEnabled && request.debug ? trace : undefined
  }
}
