// Cloudflare Clairic as the result stage's optional extraction model,
// evaluated on 2026-10-20 and not adopted
// (docs/research/cloudflare-system-one-spike-2026-10-20.md). Clairic proposes
// values and exact spans (stated P(doom), quotes, timelines) and estimates
// quantities with intervals. A decision model (Jev or Clef) still verifies
// every displayed claim, because Clairic does not reliably reject past,
// conditional or superseded statements.
import {
  experimentalAxes,
  hinges,
  milestones
} from '@/lib/assessment/worldview-experiment'
import type {
  Extraction,
  ExtractionAnswer,
  ExtractionRequest,
  Extractor
} from './provider'
import {
  runWorkersAiWithRetry,
  type WorkersAiModel,
  type WorkersAiOptions
} from './workers-ai'

const catastrophe =
  'AI causing human extinction or a comparably irreversible civilization-scale catastrophe (such as AI takeover or permanent human disempowerment)'

type Field = Record<string, unknown> & { type: string; instructions: string }

const outlookScale = [
  '0 = strongly oriented toward catastrophe or overwhelming harm',
  '0.25 = leans toward concern about harmful futures, while allowing better outcomes',
  '0.5 = mixed or undecided',
  '0.75 = leans toward beneficial futures, while allowing serious risks',
  '1 = strongly oriented toward transformative flourishing'
].join('; ')
const transformationScale = experimentalAxes.transformation.levels
  .map((level, i) => `${i / 4} = ${level}`)
  .join('; ')

export function clairicFields(mode: ExtractionRequest['mode']) {
  const fields: Record<string, Field> = {
    pdoom_stated_value: {
      type: 'number',
      decimals: 2,
      null_threshold: 0.2,
      instructions: `The participant's own stated probability, in percent, of ${catastrophe}. Only a number or verbal odds (such as "one in five" or "a coin flip") the participant actually states as their own estimate. If the participant declines to give a number or never states one, the answer is null, not zero.`
    },
    pdoom_stated_token: {
      type: 'text',
      null_threshold: 0.4,
      instructions: `The exact probability expression (for example "20%", "10–20%", "one in five", "a coin flip") the participant uses for their own likelihood of ${catastrophe}. Null if they state no probability.`
    },
    pdoom_estimate: {
      type: 'estimate',
      min: 0.01,
      max: 100,
      step: 0.01,
      scale: 'log',
      instructions: `The participant's own probability, in percent, of ${catastrophe}, inferred from their whole account. This is their belief, not yours.`
    },
    // Shadow readings: recorded for comparison, never displayed.
    map_outlook: {
      type: 'estimate',
      min: 0,
      max: 1,
      step: 0.01,
      instructions: `The participant's expressed outlook on AI's future on a 0-1 scale: ${outlookScale}.`
    },
    map_transformation: {
      type: 'estimate',
      min: 0,
      max: 1,
      step: 0.01,
      instructions: `The eventual magnitude of societal change the participant expects from AI, good or bad, on a 0-1 scale: ${transformationScale}`
    }
  }
  if (mode === 'persona') {
    fields.pdoom_evidence = {
      type: 'text',
      instructions: `The participant's exact words that best show how likely they consider ${catastrophe}: an expected outcome, a dismissal or acceptance of the risk, or confidence in safeguards.`
    }
    for (const id of ['influence', 'transformation'] as const)
      fields[`${id}_evidence`] = {
        type: 'text',
        instructions: `The participant's exact words that best answer "${experimentalAxes[id].question}" as their own adopted view.`
      }
    for (const m of milestones) {
      fields[`milestone_${m.id}_quote`] = {
        type: 'text',
        null_threshold: 0.4,
        instructions: `The participant's exact words giving their timing for ${m.meaning}: a date, range, relative horizon, dependency, unknown timing or may-never-arrive position. Null if they give no timing for this.`
      }
      fields[`milestone_${m.id}_year`] = {
        type: 'number',
        integer: true,
        null_threshold: 0.2,
        instructions: `The calendar year by which the participant expects ${m.meaning}. Null, not a guess, if they give no timing for this.`
      }
    }
    for (const h of hinges)
      fields[`hinge_${h.id}`] = {
        type: 'text',
        null_threshold: 0.4,
        instructions: `The participant's exact words stating ${h.meaning}. Null if none.`
      }
  }
  return fields
}

/** The transcript as Clairic state, with each answer body's offsets. */
export function clairicState(evidence: ExtractionRequest['evidence']) {
  let text = ''
  const bodies: Array<{
    id: string
    number: number
    start: number
    end: number
  }> = []
  evidence.forEach((answer, i) => {
    if (i) text += '\n\n'
    text += `Question ${i + 1}: ${answer.prompt}\nAnswer ${i + 1}: `
    const start = text.length
    text += answer.answer
    bodies.push({ id: answer.id, number: i + 1, start, end: text.length })
  })
  return { text, bodies }
}

export function resolveQuote(
  state: ReturnType<typeof clairicState>,
  span: number[] | undefined,
  expand = true
) {
  if (!span || span.length !== 2) return null
  const [start, end] = span as [number, number]
  const body = state.bodies.find((b) => start >= b.start && end <= b.end)
  if (!body || end <= start) return null
  // Clairic returns the minimal span ("by 2030"); a decision model rightly
  // rejects such fragments as too vague, so show the sentences around it.
  const answer = state.text.slice(body.start, body.end)
  const boundary = /(?<=[.!?])\s+|(?<=[。！？।])\s*|\n+/gu
  const sentences: Array<[number, number]> = []
  let from = 0
  for (const match of answer.matchAll(boundary)) {
    sentences.push([from, match.index!])
    from = match.index! + match[0].length
  }
  sentences.push([from, answer.length])
  const s = start - body.start
  const e = end - body.start
  if (!expand) {
    const exact = answer.slice(s, e).trim()
    return exact
      ? { answerId: body.id, answerNumber: body.number, text: exact }
      : null
  }
  const covering = sentences.filter(([a, b]) => a < e && b > s)
  const text = answer
    .slice(covering[0]?.[0] ?? s, covering.at(-1)?.[1] ?? e)
    .trim()
    .slice(0, 900)
  return text ? { answerId: body.id, answerNumber: body.number, text } : null
}

type Raw = {
  model: string
  answers: Record<string, ExtractionAnswer>
  truncated: boolean
  usage: { input_tokens: number; passes?: number }
}

export function createClairicExtractor({
  mode = 'complement',
  onUsage,
  run = runWorkersAiWithRetry
}: {
  mode?: Extractor['mode']
  onUsage?: (tokens: number) => void
  /** Injected for tests. */
  run?: <T>(
    model: WorkersAiModel,
    body: unknown,
    options?: WorkersAiOptions
  ) => Promise<{ output: T; elapsedMs: number; attempts: number }>
} = {}): Extractor {
  const extract = async (
    request: ExtractionRequest,
    signal?: AbortSignal
  ): Promise<Extraction> => {
    const state = clairicState(request.evidence)
    const fields = clairicFields(request.mode)
    const response = await run<Raw>(
      '@cf/cloudflare/clairic',
      {
        model: 'clairic',
        state: state.text,
        fields,
        // Anchors relative timing ("within ten years") to the interview date.
        reference_date:
          request.referenceDate ?? new Date().toISOString().slice(0, 10)
      },
      { signal, timeoutMs: 30_000, maxAttempts: request.attemptBudget ?? 2 }
    )
    const raw = response.output
    onUsage?.(raw.usage.input_tokens)
    if (raw.truncated) throw new Error('Clairic truncated the transcript')
    const quotes: Extraction['quotes'] = {}
    for (const [id, answer] of Object.entries(raw.answers))
      if (answer.type === 'text')
        quotes[id] =
          answer.value === null
            ? null
            : // The stated token stays the exact expression ("about 25%").
              resolveQuote(state, answer.span, id !== 'pdoom_stated_token')
    return {
      model: raw.model,
      answers: raw.answers,
      quotes,
      usage: {
        input_tokens: raw.usage.input_tokens,
        passes: raw.usage.passes ?? 1
      },
      elapsedMs: response.elapsedMs,
      attempts: response.attempts
    }
  }
  return { mode, extract }
}
