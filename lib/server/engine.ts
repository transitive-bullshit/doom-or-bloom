import 'server-only'
import { classifyLocalReply } from '@/lib/assessment/local-reply'
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
import {
  limits,
  vectorIds,
  worldviewIds,
  supportedAssessmentVersions,
  versions
} from '@/lib/assessment/schema'
import {
  acceptAnswer,
  atCap,
  canSubmit,
  currentPrompt,
  eligible,
  hasAnswered,
  issuePrompt,
  recordDisposition
} from '@/lib/assessment/state'
import { candidatePrompts, rankCandidates } from '@/lib/assessment/routing'
import {
  baseResult,
  emptyComponent,
  quantile
} from '@/lib/assessment/projections'
import type { Bundle } from '@/lib/content/loader'
import type { Prompt } from '@/lib/content/schema'
import type { Provider } from './provider'
import { projectionInput } from './projection-input'
import { timelineContext } from '@/lib/assessment/timeline'
import { participantQuestionPolicy } from '@/lib/assessment/prompt-policy'
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
function clarificationText(label: string, claim: string | null) {
  return `Our read of ${label.toLowerCase()} was: “${claim}” What would you change about that interpretation?`
}
function validateSnapshot(state: Assessment, bundle: Bundle) {
  if (
    state.versions.content !== bundle.manifest.contentVersion ||
    state.versions.rubric !== bundle.manifest.rubricVersion ||
    !supportedAssessmentVersions.includes(state.versions.assessment)
  )
    throw new Error(
      'This saved assessment uses an unavailable version. Export it or restart.'
    )
  const instances = new Set<string>()
  for (const [index, p] of state.prompts.entries()) {
    const authored = bundle.prompts.find((item) => item.id === p.promptId)
    // Local draft edits can delete a question. Keep its issued history without
    // retaining a deleted catalog entry; known questions still validate exactly.
    if (
      (!authored && ['root', 'clarification'].includes(p.family)) ||
      (authored &&
        p.family !== 'clarification' &&
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
  }
  for (const e of state.evidence)
    if (
      !state.answers.some((a) => a.id === e.answerId) ||
      [...e.referenceIds, ...e.contextReferenceIds].some(
        (id) => !bundle.references.some((r) => r.id === id)
      )
    )
      throw new Error('Invalid evidence provenance')
  for (const claim of state.referenceClaims)
    if (
      !bundle.references.some((r) => r.id === claim.referenceId) ||
      !state.answers.some((a) => a.id === claim.answerId)
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
    statusQuestion
  } = createQuestions(bundle.questionTemplates)
  let state = structuredClone(request.assessment)
  validateSnapshot(state, bundle)
  state.versions = { ...state.versions, assessment: versions.assessment }
  // Preserve legacy traces/claims, but reference checks no longer affect this flow.
  state.unresolved = state.unresolved.filter(
    (item) => item.kind !== 'reference'
  )
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
      remainingAttempts,
      debugEnabled && request.debug
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
    if (result.requests) stage.requests = result.requests
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
        questionPolicy: participantQuestionPolicy,
        dimensionDefinitions: Object.fromEntries(
          bundle.rubric.dimensions.map(({ id, label, meaning }) => [
            id,
            { label, meaning }
          ])
        ),
        coverageDefinitions: {
          assessed:
            'Supported participant evidence is available; not a quality score.',
          ambiguous:
            'Relevant language has unresolved meaning; do not invent a position.',
          unassessed:
            'No supported evidence is established; missing evidence is not low quality.'
        },
        coverage: state.coverage,
        unresolved: state.unresolved,
        familiarity: state.familiarity.level,
        calibrationGaps: {
          horizon: timelineContext(state) === null,
          conviction: !state.answers.some((a) => a.hasConviction)
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
      throw new Error(
        'More supported coverage is needed to offer a provisional result'
      )
    if (state.result?.evidenceRevision === state.evidenceRevision) {
      state.result.capped = capped || state.result.capped
      state.status = capped ? 'capped' : 'results'
      return
    }
    let components: Component[] = []
    if (eligible(state)) {
      const scores = rubricQuestions(
        bundle.rubric,
        'completeParticipantEvidence; prior typed judgments are interpretations, not independent evidence'
      )
      const questions: StageQuestions = {}
      for (const dimension of bundle.rubric.dimensions) {
        questions[`${dimension.id}:status`] = statusQuestion(
          `${dimension.label}: ${dimension.meaning}`,
          'completeParticipantEvidence'
        )
        questions[`${dimension.id}:score`] = scores[dimension.id]!
        if (
          worldviewIds.includes(dimension.id as (typeof worldviewIds)[number])
        )
          questions[`${dimension.id}:position`] = authoredQuestion('position', {
            meaning: `${dimension.label}: ${dimension.meaning}`
          })
      }
      const catastrophe = bundle.rubric.catastrophicRisk
      questions['catastrophic_risk:status'] = statusQuestion(
        `${catastrophe.label}: ${catastrophe.meaning}`,
        'completeParticipantEvidence'
      )
      questions['catastrophic_risk:position'] = authoredQuestion('position', {
        meaning: `${catastrophe.label}: ${catastrophe.meaning}`
      })
      questions['catastrophic_risk:score'] = authoredQuestion(
        'catastrophic_score',
        { meaning: `${catastrophe.label}: ${catastrophe.meaning}` },
        catastrophe.levels
      )
      const evaluation = await evaluate(
        'D: projection',
        projectionInput(state, bundle),
        questions
      )
      addJudgments(
        'project',
        `result:${state.evidenceRevision}`,
        questions,
        evaluation.answers,
        evaluation.model
      )
      components = bundle.rubric.dimensions.map((dimension) => {
        const score = evaluation.answers[`${dimension.id}:score`]
        const evidenceIds = activeEvidence(state)
          .filter(
            (entry) =>
              entry.vector === dimension.id &&
              !(
                dimension.id === 'risk_landscape' &&
                state.answers.some(
                  (answer) =>
                    answer.id === entry.answerId &&
                    answer.correctionClaimTarget === 'catastrophic_risk'
                )
              )
          )
          .map((entry) => entry.id)
        if (
          !supported(
            evaluation.answers[`${dimension.id}:status`],
            bundle.rubric.presenceThreshold
          ) ||
          !evidenceIds.length ||
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
          evidenceIds,
          claim: dimension.levels[Math.round(score.score)]!
        }
      })
      const score = evaluation.answers['catastrophic_risk:score']
      const sourceIds = catastrophicEvidence(state).map((entry) => entry.id)
      const fingerprintRisk =
        supported(
          evaluation.answers['catastrophic_risk:status'],
          bundle.rubric.presenceThreshold
        ) &&
        choice(evaluation.answers['catastrophic_risk:position']) ===
          'assessable' &&
        score?.type === 'score' &&
        sourceIds.length > 0
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
              evidenceIds: sourceIds,
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
        claim: horizon
          ? `Timing expressed in answer ${state.answers.indexOf(horizon) + 1}; see the full answer for its scope and uncertainty.`
          : null,
        evidenceIds: horizon
          ? activeEvidence(state)
              .filter(
                (e) =>
                  e.answerId === horizon.id &&
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
    if (!bundle.prompts.some((prompt) => prompt.id === p.promptId))
      throw new Error(
        'This question is no longer available. Try a different question.'
      )
    const answerId = `${p.id}:a`
    const questions: StageQuestions = {}
    questions.disposition = dispositionQuestion
    questions.familiarity = authoredQuestion('familiarity')
    for (const dimension of bundle.rubric.dimensions) {
      questions[`${dimension.id}:status`] = statusQuestion(
        `${dimension.label}: ${dimension.meaning}`,
        '`current.answer` in the context of usableHistory'
      )
    }
    questions.horizon = authoredQuestion('horizon')
    questions.conviction = authoredQuestion('conviction')
    const tensionTemplate = authoredQuestion('tension')
    if (tensionTemplate.type !== 'choice')
      throw new Error('Invalid tension template')
    questions.tension = authoredQuestion(
      'tension',
      {},
      {
        ...Object.fromEntries(
          bundle.rubric.dimensions.map((d) => [
            d.id,
            `${d.label}: ${d.meaning}`
          ])
        ),
        ...tensionTemplate.criteria
      }
    )
    const input = {
      current: { id: answerId, prompt: p.text, answer: op.text },
      usableHistory: usableHistory(state).slice(-5),
      clarificationTarget: p.claimTarget ?? p.target ?? null
    }
    const localReply = classifyLocalReply(op.text)
    const evaluation = localReply
      ? null
      : await evaluate('A: interpret', input, questions)
    const disposition = localReply
      ? 'non_answer'
      : choice(evaluation!.answers.disposition)
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
      localReply ? 1 : confidence(evaluation!.answers.disposition),
      request.requestId,
      bundle.rubric.nonAnswerThreshold
    )
    if (localReply === 'paperclip_request' && !state.recovery.paperclipShown) {
      state.status = 'paused'
      state.recovery.paperclipShown = true
      state.recovery.paperclipActive = true
    }
    trace.decisions.push({
      action: 'response disposition and recovery gate',
      detail: {
        source: localReply
          ? 'local exact-phrase policy; no Jev request'
          : 'Jev disposition',
        localReply,
        raw: evaluation?.answers.disposition ?? null,
        threshold: bundle.rubric.nonAnswerThreshold,
        recovery: state.recovery,
        consumed: state.attempts.at(-1)?.disposition
      }
    })
    if (state.attempts.at(-1)?.disposition === 'usable') {
      if (!evaluation) throw new Error('Missing usable answer evaluation')
      const answer: Answer = {
        id: answerId,
        promptInstanceId: p.id,
        promptText: p.text,
        text: op.text,
        substantive: true,
        correctionTarget: p.target,
        correctionClaimTarget: p.claimTarget,
        hasHorizon:
          evaluation.answers.horizon?.type === 'noul' &&
          evaluation.answers.horizon.noul >= bundle.rubric.presenceThreshold,
        hasConviction:
          evaluation.answers.conviction?.type === 'noul' &&
          evaluation.answers.conviction.noul >= bundle.rubric.presenceThreshold
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
        if (supported(status, bundle.rubric.presenceThreshold)) {
          state.evidence.push({
            id: `${answerId}:e:${dimension.id}`,
            answerId,
            vector: dimension.id,
            status: choice(status) === 'stated' ? 'stated' : 'strongly_implied',
            judgmentIds: judgments
              .filter((j) => j.questionId.startsWith(dimension.id))
              .map((j) => j.id),
            referenceIds: [],
            contextReferenceIds: []
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
      if (atCap(state)) await project(true)
      else if (p.target && eligible(state)) await project()
      else if (!(await route())) {
        if (eligible(state)) await project()
        else state.status = 'paused'
      }
    } else {
      trace.decisions.push({
        action: 'speculative profile judgments discarded; later stages skipped',
        detail: Object.keys(evaluation?.answers ?? {}).filter(
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
