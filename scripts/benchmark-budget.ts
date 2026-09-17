import { randomUUID } from 'node:crypto'
import { writeFile } from 'node:fs/promises'
import { loadBundle } from '../lib/content/loader'
import { createLiveProvider } from '../lib/server/live-provider'
import { runAssessment } from '../lib/server/engine'
import {
  acceptAnswer,
  createAssessment,
  currentPrompt,
  issuePrompt,
  recordDisposition,
  segmentAnswer
} from '../lib/assessment/state'
import { limits, vectorIds } from '../lib/assessment/schema'
import type { Provider } from '../lib/server/provider'

const bundle = loadBundle()
const model = process.env.TYPESAFE_MODEL || 'jev-1.13.0'
let state = createAssessment(randomUUID(), model)
const prompt = bundle.prompts.find((p) => p.id === 'timeline.general')!
const stages: Array<Record<string, unknown>> = []
const live = createLiveProvider(model)
const provider: Provider = {
  kind: 'live',
  evaluate: async (input, questions, signal) => {
    const started = performance.now()
    const measurement = {
      questions: Object.keys(questions).length,
      inputBytes: Buffer.byteLength(
        JSON.stringify({ state: input, questions })
      ),
      largestChoice: Math.max(
        0,
        ...Object.values(questions).map((q) =>
          q.type === 'choice' ? Object.keys(q.criteria).length : 0
        )
      )
    }
    try {
      const result = await live.evaluate(input, questions, signal)
      stages.push({
        ...measurement,
        elapsedMs: Math.round(performance.now() - started),
        usage: result.usage,
        attempts: result.attempts,
        model: result.model,
        succeeded: true
      })
      return result
    } catch (err) {
      stages.push({
        ...measurement,
        elapsedMs: Math.round(performance.now() - started),
        succeeded: false,
        status:
          err && typeof err === 'object' && 'status' in err ? err.status : null,
        constraint:
          err instanceof Error &&
          /context|token|length|too large|size/i.test(err.message)
            ? 'input_size'
            : 'unclassified',
        declaredLimits:
          err instanceof Error
            ? Array.from(
                err.message.matchAll(/(\d{3,})\s*(tokens|characters|bytes)/g)
              ).map((m) => ({ maximum: Number(m[1]), unit: m[2] }))
            : [],
        sizeHints:
          err instanceof Error &&
          /context|token|length|too large|size/i.test(err.message)
            ? {
                keywords: [
                  'balance',
                  'credit',
                  'quota',
                  'insufficient',
                  'enough',
                  'exhausted',
                  'exceeded',
                  'length',
                  'capacity',
                  'budget',
                  'state',
                  'questions',
                  'context',
                  'input',
                  'large',
                  'long',
                  'maximum',
                  'character',
                  'token'
                ].filter((word) => err.message.toLowerCase().includes(word)),
                numbers: Array.from(err.message.matchAll(/\b\d[\d,]{3,}\b/g))
                  .slice(0, 8)
                  .map((m) => Number(m[0].replaceAll(',', '')))
              }
            : null,
        numericLimit:
          err instanceof Error
            ? Number(
                err.message.match(
                  /(?:max(?:imum)?(?:[ _a-z-]*length)?|limit)\D{0,30}(\d{3,})/i
                )?.[1] ?? 0
              ) || null
            : null
      })
      throw new Error('Budget benchmark provider request failed')
    }
  }
}
// Synthetic maximum-length evidence, never copied from a participant assessment.
const paragraph =
  'Over the next ten years I expect AI to help science through cheaper experiments and better hypotheses, but distribution depends on access and institutional oversight. I cannot assign a reliable probability of catastrophe. Misuse and loss of control differ from ordinary errors. Independent evaluations could change my view; benchmark success alone does not prove general safety. I prefer safeguards, although my policy preference does not determine the expected outcome. '
const text = paragraph.repeat(5).slice(0, limits.answerChars)
for (let i = 0; i < 50; i++) {
  if (i > 0)
    state = issuePrompt(state, {
      promptId: prompt.id,
      text: prompt.text,
      family: prompt.family,
      variant: 'original',
      sourceEvidenceIds: []
    })
  const p = currentPrompt(state)
  const answerId = `${p.id}:a`
  const spans = segmentAnswer(text, answerId)
  state = recordDisposition(state, 'usable', 1, `synthetic-${i}`)
  state = acceptAnswer(state, {
    id: answerId,
    promptInstanceId: p.id,
    promptText: p.text,
    text,
    spans,
    substantive: true
  })
  for (const vector of vectorIds) {
    state.evidence.push({
      id: `${answerId}:e:${vector}`,
      answerId,
      spanId: spans[0]!.id,
      vector,
      status: 'stated',
      judgmentIds: [],
      referenceIds: [],
      contextReferenceIds: [],
      horizonSpanId: null,
      convictionSpanId: null,
      assumptionSpanId: null
    })
    state.coverage[vector] = 'assessed'
  }
  for (let j = 0; j < 4; j++) {
    const reference = bundle.references[(i * 4 + j) % bundle.references.length]!
    state.referenceClaims.push({
      id: `${answerId}:ref:${reference.id}`,
      answerId,
      spanId: spans[0]!.id,
      referenceId: reference.id,
      attribution: 'unclear',
      fit: 'unclear',
      uncertainty: 'unclear',
      materiality: 'unclear',
      judgmentIds: []
    })
  }
}
let succeeded = false
try {
  const response = await runAssessment(
    {
      assessment: state,
      requestId: randomUUID(),
      operation: { type: 'project' },
      debug: true
    },
    provider,
    bundle,
    true
  )
  succeeded = response.assessment.status === 'capped'
} catch {
  console.error(
    'Maximum-evidence benchmark failed; no transport bodies or credentials logged.'
  )
}
const inputTokens = stages.reduce(
  (sum, s) =>
    sum +
    Number(
      (s.usage as { input_tokens: number } | undefined)?.input_tokens ?? 0
    ),
  0
)
await writeFile(
  'eval/budget-benchmark.json',
  JSON.stringify(
    {
      date: new Date().toISOString(),
      purpose:
        'Synthetic context stress test: 50 maximum-length usable answers, 750 ledger entries, 200 reference claims. Not an authored interview path or accuracy evaluation.',
      model,
      sdk: '0.6.0',
      succeeded,
      snapshotBytes: Buffer.byteLength(JSON.stringify(state)),
      answerCharacters: text.length,
      stages,
      pricing: {
        checked: '2026-09-17',
        source:
          'https://typesafe.ai/blog/introducing-system-one-models-and-jev',
        inputUsdPerMillionTokens: 0.042,
        outputUsdPerMillionTokens: 0,
        measuredRequestListEstimateUsd: (inputTokens * 0.042) / 1_000_000,
        failedRequestCostUnknown: !succeeded
      }
    },
    null,
    2
  ) + '\n'
)
console.log(
  `Budget benchmark recorded: ${succeeded ? 'passed' : 'failed'}; ${stages.length} measured stages.`
)
if (!succeeded) process.exitCode = 1
