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
import { limits, vectorIds } from '@/lib/assessment/schema'
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
import {
  dispositionQuestion,
  rubricQuestions,
  spanQuestion,
  statusQuestion
} from './questions'

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
    correctionTarget: a.correctionTarget ?? null
  }))
}
function activeEvidence(state: Assessment) {
  return state.evidence.filter(
    (e) => e.status !== 'superseded' && e.status !== 'disputed'
  )
}
function evidenceText(state: Assessment, evidenceId: string) {
  const e = state.evidence.find((entry) => entry.id === evidenceId)
  const a = state.answers.find((answer) => answer.id === e?.answerId)
  return a?.spans.find((span) => span.id === e?.spanId)?.text ?? ''
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
      (p.family !== 'clarification' && p.text !== authored.text) ||
      p.ordinal !== index + 1 ||
      instances.has(p.id)
    )
      throw new Error('Invalid prompt history')
    instances.add(p.id)
  }
  if (state.prompts[0]?.promptId !== 'root')
    throw new Error('Invalid assessment root')
  const answered = new Set<string>()
  for (const answer of state.answers) {
    if (
      !instances.has(answer.promptInstanceId) ||
      answered.has(answer.promptInstanceId) ||
      answer.promptText !==
        state.prompts.find((p) => p.id === answer.promptInstanceId)?.text
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
  const evaluate = async (
    name: string,
    input: unknown,
    questions: StageQuestions
  ) => {
    const stageStarted = performance.now()
    const result = await provider.evaluate(input, questions, operationSignal)
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
          questions[`${prompt.id}:${benefit}`] = {
            type: 'score',
            instructions: `How useful would asking candidate ${prompt.id} be for ${benefit === 'coverage' ? 'eliciting consequential missing coverage' : benefit === 'ambiguity' ? 'resolving a material stated ambiguity' : benefit === 'tension' ? 'investigating a consequential apparent tension without assuming contradiction' : 'reducing uncertainty in expected impact or demonstrated reasoning'}? Judge this independently over the supplied participant evidence and candidate. A missing risk/upside is not automatically consequential.`,
            criteria: [
              'No relevant gain',
              'Small relevant gain',
              'Useful gain on a consequential gap',
              'High-value gain on a central unresolved issue'
            ]
          }
      }
      const input = {
        participantEvidence: usableHistory(state),
        coverage: state.coverage,
        unresolved: state.unresolved,
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
        'completeParticipantEvidence and activeEvidence; prior derived labels are interpretations, not new evidence'
      )
      const questions: StageQuestions = {}
      for (const dimension of bundle.rubric.dimensions) {
        questions[`${dimension.id}:status`] = statusQuestion(
          dimension.meaning,
          'completeParticipantEvidence'
        )
        questions[`${dimension.id}:score`] = scores[dimension.id]!
        const candidates = Object.fromEntries(
          activeEvidence(state)
            .filter((e) => e.vector === dimension.id)
            .map((e) => [e.id, evidenceText(state, e.id)])
        )
        questions[`${dimension.id}:evidence`] = spanQuestion(
          dimension.meaning,
          candidates,
          'activeEvidence'
        )
      }
      const usedReferences = new Set(
        activeEvidence(state).flatMap((e) => [
          ...e.referenceIds,
          ...e.contextReferenceIds
        ])
      )
      const input = {
        completeParticipantEvidence: usableHistory(state),
        activeEvidence: activeEvidence(state),
        referenceContext: bundle.references
          .filter((r) => usedReferences.has(r.id))
          .map((r) => ({ id: r.id, summary: r.summary })),
        derivedInterpretations:
          'Ledger status labels are derived; only raw answers and reference source facts are observations.',
        coverage: state.coverage,
        unresolved: state.unresolved,
        versions: state.versions
      }
      const evaluation = await evaluate('D: projection', input, questions)
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
          score?.type !== 'score'
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
    } else
      components = bundle.rubric.dimensions.map((d) =>
        emptyComponent(d.id, d.label)
      )
    for (const c of components)
      state.coverage[c.vector as VectorId] =
        c.value === null ? 'unassessed' : 'assessed'
    const result = baseResult(state, components, bundle.rubric, capped)
    const matches = (
      condition: Bundle['findings'][number]['conditions'][number]
    ) => {
      const c = components.find(
        (component) => component.vector === condition.vector
      )
      return (
        c?.value !== null &&
        c?.value !== undefined &&
        (condition.min === undefined || c.value >= condition.min) &&
        (condition.max === undefined || c.value <= condition.max)
      )
    }
    result.findings = bundle.findings
      .filter((f) => f.conditions.every(matches) && !f.exclusions.some(matches))
      .slice(0, 3)
      .map((f) => ({
        id: f.id,
        text: f.text,
        evidenceIds: f.conditions.flatMap(
          (c) =>
            components.find((component) => component.vector === c.vector)
              ?.evidenceIds ?? []
        )
      }))
    const purposes = new Set<string>()
    result.resources = bundle.resources
      .filter((r) => r.conditions.every(matches) && !r.exclusions.some(matches))
      .filter((r) => {
        if (purposes.has(r.purpose)) return false
        purposes.add(r.purpose)
        return true
      })
      .slice(0, 3)
      .map(({ id, title, url, purpose, effort }) => ({
        id,
        title,
        url,
        purpose,
        effort
      }))
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
    questions.topic = {
      type: 'choice',
      instructions:
        'Which topic family best describes a reference actually invoked in `current.answer`, including an indirectly described reference? Choose none if no identifiable reference is invoked.',
      criteria: {
        science: 'Scientific capability evidence',
        capabilities: 'AI capability demonstration',
        governance: 'Institutions or governance',
        architecture: 'Model architecture or research method',
        risk: 'Risk incident or argument',
        none: 'No identifiable reference is invoked'
      }
    }
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
    questions.tension = {
      type: 'choice',
      instructions:
        'Does `current.answer` leave a consequential apparent incompatibility with usableHistory under the same scope and assumptions? A revision, different scope, or changed assumption is not automatically a contradiction. Select the implicated dimension only when investigation would help.',
      criteria: {
        ...Object.fromEntries(
          bundle.rubric.dimensions.map((d) => [d.id, d.meaning])
        ),
        none: 'No consequential unresolved tension'
      }
    }
    const input = {
      current: { prompt: p.text, answer: op.text, spans },
      usableHistory: usableHistory(state).slice(-5),
      clarificationTarget: p.target ?? null
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
        correctionTarget: p.target
      }
      state = acceptAnswer(state, answer)
      const judgments = addJudgments(
        'interpret',
        answerId,
        questions,
        evaluation.answers,
        evaluation.model
      )
      if (p.target) {
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
            {
              type: 'choice',
              instructions: `Does the participant actually invoke ${reference.title} as identifiable evidence in currentAnswer, possibly through an indirect description? Mere thematic relevance is not a mention.`,
              criteria: {
                mentioned:
                  'An identifiable invocation or attribution is present',
                contextual:
                  'Related context only; not attributed to the participant',
                unclear: 'Cannot resolve identity',
                none: 'No reference to this item'
              }
            }
          ])
        )
        const identity = await evaluate(
          'B1: identify references',
          {
            currentAnswer: op.text,
            candidates: references.map(({ reference }) => ({
              id: reference.id,
              title: reference.title,
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
              groundQuestions[`${reference.id}:${check}`] = {
                type: 'choice',
                instructions: `Assess ${check === 'attribution' ? 'whether the reference is accurately characterized' : check === 'fit' ? 'whether reference facts support the participant claim' : check === 'uncertainty' ? 'whether relevant source uncertainty is preserved' : 'whether the participant conclusion depends materially on this reference'} for ${reference.id} using currentAnswer and the corresponding canonicalSummary. The snapshot is fallible; distinguish observation from interpretation.`,
                criteria: {
                  yes: 'Supported by supplied evidence',
                  no: 'Supplied evidence establishes the opposite',
                  unclear: 'Insufficient or disputed evidence'
                }
              }
          }
          const grounding = await evaluate(
            'B2: grounded claims',
            {
              currentAnswer: op.text,
              spans,
              canonicalSummaries: selected.map(({ reference }) => ({
                id: reference.id,
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
    const component = state.result.components.find(
      (c) => c.vector === op.vector && c.value !== null
    )
    if (!component) throw new Error('Select an assessed claim to clarify')
    const prompt = bundle.prompts.find((p) => p.id === 'concrete.general')!
    state = issuePrompt(state, {
      ...promptDisplay(prompt),
      family: 'clarification',
      text: `Our read of ${component.label.toLowerCase()} was: “${component.claim}” What would you change about that interpretation?`,
      target: op.vector,
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
