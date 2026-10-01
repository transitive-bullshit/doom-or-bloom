import 'server-only'
import { sql } from 'drizzle-orm'
import { drizzle } from 'drizzle-orm/node-postgres'
import type { Pool } from 'pg'
import { jevProviderStatus, jevSpend } from '../db/schema'
import { reportServerError } from './error-reporting'
import {
  JevBudgetExhausted,
  budgetPeriods,
  budgetState,
  crossedThresholds,
  isProviderOutOfCredits,
  jevBudgetLimits,
  jevCostNanoUsd,
  nanoToUsd,
  providerHoldMs,
  type BudgetPeriod,
  type JevBudgetLimits,
  type JevBudgetState,
  type JevUsage
} from './jev-budget'

const provider = 'typesafe'
// Signals carry only aggregate spend and limits, never participant data.
const signal = (
  event: string,
  context: Record<string, unknown>,
  level: 'warn' | 'error'
) =>
  reportServerError(
    event,
    undefined,
    { boundary: 'jev_budget', ...context },
    level
  )

// A malformed budget keeps the default ceiling instead of failing startup:
// a typo while raising the budget must not take the site down.
let reportedInvalidConfig = false
function configuredLimits() {
  const configured = jevBudgetLimits()
  if (configured.invalid.length && !reportedInvalidConfig) {
    reportedInvalidConfig = true
    signal(
      'jev_budget_config_invalid',
      {
        variables: configured.invalid,
        application: { effect: 'default_budget_applied' }
      },
      'error'
    )
  }
  return configured
}

export function jevBudgetStore(pool: Pool) {
  const db = drizzle(pool)
  const limitsFor = (limits?: JevBudgetLimits) => limits ?? configuredLimits()
  return {
    async state(
      now = new Date(),
      limits?: JevBudgetLimits
    ): Promise<JevBudgetState> {
      const periods = budgetPeriods(now)
      const { rows } = await db.execute<{
        month: string | null
        day: string | null
        out_of_credits_at: Date | string | null
      }>(sql`
        select
          (select ${jevSpend.costNanoUsd} from ${jevSpend}
            where ${jevSpend.period} = 'month' and ${jevSpend.periodStart} = ${periods.month}) as month,
          (select ${jevSpend.costNanoUsd} from ${jevSpend}
            where ${jevSpend.period} = 'day' and ${jevSpend.periodStart} = ${periods.day}) as day,
          (select ${jevProviderStatus.outOfCreditsAt} from ${jevProviderStatus}
            where ${jevProviderStatus.provider} = ${provider}) as out_of_credits_at`)
      const row = rows[0]
      return budgetState(
        {
          spent: { month: Number(row?.month ?? 0), day: Number(row?.day ?? 0) },
          outOfCreditsAt: row?.out_of_credits_at
            ? new Date(row.out_of_credits_at)
            : null
        },
        limitsFor(limits),
        now
      )
    },
    /** Atomically adds usage to the UTC day and month and signals crossings. */
    async record(usage: JevUsage, now = new Date(), limits?: JevBudgetLimits) {
      const cost = jevCostNanoUsd(usage)
      if (!usage.requests && !cost) return []
      const periods = budgetPeriods(now)
      const values = (['month', 'day'] as const).map((period) => ({
        period,
        periodStart: periods[period],
        inputTokens: usage.input_tokens,
        outputTokens: usage.output_tokens,
        costNanoUsd: cost,
        requests: usage.requests,
        updatedAt: now
      }))
      // One statement locks month then day in a fixed order: concurrent
      // writers serialize on each row and every increment is retained.
      const rows = await db
        .insert(jevSpend)
        .values(values)
        .onConflictDoUpdate({
          target: [jevSpend.period, jevSpend.periodStart],
          set: {
            inputTokens: sql`${jevSpend.inputTokens} + excluded.input_tokens`,
            outputTokens: sql`${jevSpend.outputTokens} + excluded.output_tokens`,
            costNanoUsd: sql`${jevSpend.costNanoUsd} + excluded.cost_nano_usd`,
            requests: sql`${jevSpend.requests} + excluded.requests`,
            updatedAt: sql`excluded.updated_at`
          }
        })
        .returning({
          period: jevSpend.period,
          periodStart: jevSpend.periodStart,
          costNanoUsd: jevSpend.costNanoUsd
        })
      const configured = limitsFor(limits)
      const crossings = rows.flatMap((row) =>
        crossedThresholds(
          row.costNanoUsd - cost,
          row.costNanoUsd,
          configured[row.period as BudgetPeriod]
        ).map((threshold) => ({ ...row, threshold }))
      )
      for (const crossing of crossings)
        signal(
          'jev_budget_threshold_crossed',
          {
            period: crossing.period,
            periodStart: crossing.periodStart,
            threshold: crossing.threshold,
            spentUsd: nanoToUsd(crossing.costNanoUsd),
            limitUsd: nanoToUsd(configured[crossing.period as BudgetPeriod]),
            application: {
              effect:
                crossing.threshold >= 1
                  ? 'jev_calls_paused_until_period_ends'
                  : 'budget_warning'
            }
          },
          crossing.threshold >= 1 ? 'error' : 'warn'
        )
      return crossings
    },
    /** Starts a provider hold; true only for the request that started it. */
    async markProviderOutOfCredits(now = new Date()) {
      const rows = await db
        .insert(jevProviderStatus)
        .values({ provider, outOfCreditsAt: now, updatedAt: now })
        .onConflictDoUpdate({
          target: jevProviderStatus.provider,
          set: {
            outOfCreditsAt: sql`excluded.out_of_credits_at`,
            updatedAt: sql`excluded.updated_at`
          },
          // Concurrent 402s during an active hold change nothing, so exactly
          // one request reports each hold.
          setWhere: sql`${jevProviderStatus.outOfCreditsAt} <= excluded.out_of_credits_at - ${`${providerHoldMs} milliseconds`}::interval`
        })
        .returning({ provider: jevProviderStatus.provider })
      if (rows.length)
        signal(
          'jev_provider_out_of_credits',
          {
            provider: 'TypeSafe',
            holdMinutes: providerHoldMs / 60_000,
            application: { effect: 'jev_calls_paused_for_hold' }
          },
          'error'
        )
      return rows.length > 0
    }
  }
}
export type JevBudgetStore = ReturnType<typeof jevBudgetStore>

/**
 * One participant operation's view of the budget. The first Jev call checks
 * it once, so operations that make no Jev call are never blocked, and an
 * operation that starts under budget finishes rather than wasting its earlier
 * calls. Concurrent operations can therefore overshoot by what is in flight.
 */
export function jevBudgetGuard(store: JevBudgetStore) {
  let checked: Promise<void> | undefined
  const usage: JevUsage = { input_tokens: 0, output_tokens: 0, requests: 0 }
  return {
    check() {
      checked ??= store.state().then(
        (state) => {
          if (state.blocked) throw new JevBudgetExhausted(state.blocked)
        },
        (err: unknown) => {
          // Fail open: a missing table or database error must not stop every
          // interview. The repository needs the same database anyway.
          reportServerError('jev_budget_unavailable', err, {
            boundary: 'jev_budget',
            application: { effect: 'budget_check_skipped' }
          })
        }
      )
      return checked
    },
    add: (call: Omit<JevUsage, 'requests'>) => {
      usage.input_tokens += call.input_tokens
      usage.output_tokens += call.output_tokens
      usage.requests += 1
    },
    async failed(error: unknown) {
      if (!isProviderOutOfCredits(error)) return
      await store.markProviderOutOfCredits().catch((err: unknown) =>
        reportServerError('jev_budget_unavailable', err, {
          boundary: 'jev_budget',
          application: { effect: 'provider_hold_not_recorded' }
        })
      )
    },
    /** Records successful calls, including those of a failed operation. */
    async flush() {
      if (!usage.requests) return
      const recorded = { ...usage }
      usage.input_tokens = usage.output_tokens = usage.requests = 0
      await store.record(recorded).catch((err: unknown) =>
        reportServerError('jev_budget_unavailable', err, {
          boundary: 'jev_budget',
          application: { effect: 'spend_not_recorded' },
          requests: recorded.requests,
          inputTokens: recorded.input_tokens
        })
      )
    }
  }
}

/** Whether a new participant answer would be blocked right now. */
export async function participantBudgetBlocked(store: JevBudgetStore) {
  try {
    return (await store.state()).blocked
  } catch (err) {
    reportServerError('jev_budget_unavailable', err, {
      boundary: 'jev_budget',
      application: { effect: 'budget_notice_skipped' }
    })
    return null
  }
}
