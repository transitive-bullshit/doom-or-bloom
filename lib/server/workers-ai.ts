// Transport for Cloudflare Workers AI System One models (Clef, Clairic),
// evaluated on 2026-10-20 and not adopted
// (docs/research/cloudflare-system-one-spike-2026-10-20.md).
//
// With CLOUDFLARE_API_TOKEN and CLOUDFLARE_ACCOUNT_ID set, requests go to the
// Workers AI REST API. Otherwise they go through the authenticated `cf` CLI,
// so local comparison runs need no token in this process; the CLI adds about
// 0.7 s per request.
import { execFile } from 'node:child_process'
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

export type WorkersAiModel =
  | '@cf/cloudflare/clef'
  | '@cf/cloudflare/clef-flash'
  | '@cf/cloudflare/clairic'

export class WorkersAiError extends Error {
  constructor(
    message: string,
    readonly transient: boolean,
    readonly status?: number
  ) {
    super(message)
    this.name = 'WorkersAiError'
  }
}

export type WorkersAiOptions = {
  signal?: AbortSignal
  timeoutMs?: number
  /** Injected for tests; defaults to the global fetch. */
  fetch?: typeof fetch
  retryDelayMs?: number
}

const transientStatuses = new Set([408, 429, 500, 502, 503, 504, 529])

async function runRest<T>(
  model: WorkersAiModel,
  body: unknown,
  { signal, timeoutMs = 30_000, fetch: fetcher = fetch }: WorkersAiOptions,
  token: string,
  account: string
): Promise<T> {
  const signals = [AbortSignal.timeout(timeoutMs)]
  if (signal) signals.push(signal)
  const response = await fetcher(
    `https://api.cloudflare.com/client/v4/accounts/${encodeURIComponent(account)}/ai/run/${model}`,
    {
      method: 'POST',
      headers: {
        authorization: `Bearer ${token}`,
        'content-type': 'application/json'
      },
      body: JSON.stringify(body),
      signal: AbortSignal.any(signals),
      cache: 'no-store'
    }
  )
  const parsed = (await response.json().catch(() => null)) as {
    success?: boolean
    result?: T
    errors?: Array<{ code?: number; message?: string }>
  } | null
  if (!response.ok || !parsed?.success || parsed.result === undefined) {
    // Error messages are Cloudflare's own; they never contain the token.
    const detail = parsed?.errors
      ?.map((e) => `${e.code ?? ''} ${e.message ?? ''}`.trim())
      .join('; ')
    throw new WorkersAiError(
      `Workers AI ${response.status}${detail ? `: ${detail.slice(0, 400)}` : ''}`,
      transientStatuses.has(response.status),
      response.status
    )
  }
  return parsed.result
}

async function runCli<T>(
  model: WorkersAiModel,
  body: unknown,
  { signal, timeoutMs = 30_000 }: WorkersAiOptions
): Promise<T> {
  const dir = mkdtempSync(join(tmpdir(), 'workers-ai-'))
  const file = join(dir, 'body.json')
  writeFileSync(file, JSON.stringify(body))
  try {
    const stdout = await new Promise<string>((resolve, reject) => {
      execFile(
        'cf',
        ['ai', 'run', model, '--body', `@${file}`, '--quiet'],
        { signal, timeout: timeoutMs, maxBuffer: 64 * 1024 * 1024 },
        (err, out, stderr) => {
          if (err) {
            const text = `${stderr || ''}${out || ''}`.slice(0, 600)
            const transient =
              /\b(429|500|502|503|504|529|timeout|timed out|ECONNRESET|capacity|overloaded)\b/i.test(
                text + err.message
              )
            reject(new WorkersAiError(text || err.message, transient))
          } else resolve(out)
        }
      )
    })
    const start = stdout.indexOf('{')
    if (start < 0)
      throw new WorkersAiError(
        `Unparseable output: ${stdout.slice(0, 200)}`,
        false
      )
    return JSON.parse(stdout.slice(start)) as T
  } finally {
    rmSync(dir, { recursive: true, force: true })
  }
}

export async function runWorkersAi<T>(
  model: WorkersAiModel,
  body: unknown,
  options: WorkersAiOptions = {}
): Promise<{ output: T; elapsedMs: number }> {
  const token = process.env.CLOUDFLARE_API_TOKEN?.trim()
  const account = process.env.CLOUDFLARE_ACCOUNT_ID?.trim()
  const started = performance.now()
  const output =
    token && account
      ? await runRest<T>(model, body, options, token, account)
      : await runCli<T>(model, body, options)
  return { output, elapsedMs: Math.round(performance.now() - started) }
}

/** One retry for transient failures, as the Jev adapter allows. */
export async function runWorkersAiWithRetry<T>(
  model: WorkersAiModel,
  body: unknown,
  options: WorkersAiOptions = {}
) {
  try {
    return { ...(await runWorkersAi<T>(model, body, options)), attempts: 1 }
  } catch (err) {
    if (!(err instanceof WorkersAiError) || !err.transient) throw err
    await new Promise((r) => setTimeout(r, options.retryDelayMs ?? 1500))
    return { ...(await runWorkersAi<T>(model, body, options)), attempts: 2 }
  }
}
