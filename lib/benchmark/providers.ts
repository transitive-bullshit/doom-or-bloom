import 'server-only'
import { appendFileSync, existsSync, readFileSync } from 'node:fs'
import { setTimeout as sleep } from 'node:timers/promises'
import { z } from 'zod'
import { versions } from '@/lib/assessment/schema'
import { JourneyFailure, providerFailure } from '@/lib/journeys/failure'
import { liveJourneyBudget, meterJev } from '@/lib/journeys/live-budget'
import { createLiveProvider } from '@/lib/server/live-provider'
import type { Provider } from '@/lib/server/provider'
import { upstreamFetch } from '@/lib/server/upstream-fetch'

type Usage = { input_tokens: number; output_tokens: number }

/** Estimated spend already recorded in a run's cost ledger. */
function ledgerSpend(file: string) {
  if (!existsSync(file)) return 0
  return readFileSync(file, 'utf8')
    .split('\n')
    .filter(Boolean)
    .reduce((sum, line) => sum + (JSON.parse(line) as { usd: number }).usd, 0)
}

/**
 * A hard cost cap across every session of a run, plus an append-only ledger
 * of each paid call. Reservations follow the journey budget: a failed call
 * keeps its reservation, and cached input is priced in full.
 */
export function createMeter(ledgerFile: string, maximumUsd: number) {
  const spentBefore = ledgerSpend(ledgerFile)
  if (spentBefore >= maximumUsd)
    throw new JourneyFailure(
      `This run already spent about $${spentBefore.toFixed(2)} of its $${maximumUsd} cap. Raise --max-cost to continue.`
    )
  const budget = liveJourneyBudget(maximumUsd - spentBefore)
  const { rates } = budget.report()
  return {
    budget,
    record(kind: keyof typeof rates, tag: string, usage: Usage, requests = 1) {
      const usd =
        (usage.input_tokens * rates[kind].input +
          usage.output_tokens * rates[kind].output) /
        1_000_000
      appendFileSync(
        ledgerFile,
        `${JSON.stringify({
          at: new Date().toISOString(),
          kind,
          tag,
          requests,
          inputTokens: usage.input_tokens,
          outputTokens: usage.output_tokens,
          usd
        })}\n`
      )
    },
    spent: () => spentBefore + budget.report().estimatedUsd,
    maximumUsd
  }
}
export type Meter = ReturnType<typeof createMeter>

/** Live Jev through the normal provider, metered and recorded per call. */
export function benchmarkJev(meter: Meter, tag: string): Provider {
  const metered = meterJev(createLiveProvider(versions.model), meter.budget)
  return {
    kind: 'live',
    async evaluate(...args) {
      const result = await metered.evaluate(...args)
      meter.record('jev', tag, result.usage, result.attempts)
      return result
    }
  }
}

export type OpenAIRequest = {
  model: string
  store: false
  reasoning: { effort: 'none' | 'low' | 'medium' }
  max_output_tokens: number
  instructions: string
  input: string
  text?: {
    format: {
      type: 'json_schema'
      name: string
      schema: Record<string, unknown>
      strict: true
    }
  }
}

const responseSchema = z.object({
  status: z.string(),
  output: z.array(
    z.object({
      type: z.string(),
      content: z
        .array(z.object({ type: z.string(), text: z.string().optional() }))
        .optional()
    })
  ),
  usage: z.object({
    input_tokens: z.number().nonnegative(),
    output_tokens: z.number().nonnegative()
  })
})

/**
 * One OpenAI Responses call within the run budget. Transient failures retry
 * twice; errors carry only local categories, never bodies or credentials.
 */
export async function openaiText(
  request: OpenAIRequest,
  meter: Meter,
  tag: string,
  apiKey = process.env.OPENAI_API_KEY
) {
  if (!apiKey?.trim()) throw new JourneyFailure('Missing OPENAI_API_KEY')
  const body = JSON.stringify(request)
  for (let attempt = 1; ; attempt++) {
    const settle = meter.budget.reserve(
      'openai',
      Buffer.byteLength(body) + 4096,
      request.max_output_tokens
    )
    const response = await upstreamFetch(
      'https://api.openai.com/v1/responses',
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        },
        body,
        signal: AbortSignal.timeout(120_000)
      },
      {
        provider: 'OpenAI',
        event: 'benchmark_call_failed',
        model: request.model
      }
    ).catch((err: unknown) => {
      if (attempt < 3) return null
      throw providerFailure('OpenAI', err)
    })
    if (!response || response.status === 429 || response.status >= 500) {
      if (attempt >= 3)
        throw new JourneyFailure(
          `OpenAI request failed (HTTP ${response?.status ?? 'transport'})`
        )
      await sleep(3000 * attempt)
      continue
    }
    if (!response.ok)
      throw new JourneyFailure(
        `OpenAI request failed (HTTP ${response.status})`
      )
    const output = responseSchema.parse(await response.json())
    settle(output.usage.input_tokens, output.usage.output_tokens, 1)
    meter.record('openai', tag, output.usage)
    const text = output.output
      .flatMap((item) =>
        item.type === 'message'
          ? (item.content ?? [])
              .filter((part) => part.type === 'output_text')
              .map((part) => part.text ?? '')
          : []
      )
      .join('\n')
      .trim()
    if (output.status !== 'completed' || !text)
      throw new JourneyFailure('OpenAI response was incomplete or empty')
    return text
  }
}
