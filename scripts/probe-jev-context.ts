// Explicit, bounded live experiment. Synthetic input only; no automatic retries.
import assert from 'node:assert/strict'
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { parseArgs, parseEnv } from 'node:util'
import { resolve } from 'node:path'
import { APIError } from '@typesafe-ai/sdk'
import { upstreamHeaders } from '../lib/server/upstream-fetch'

const { values } = parseArgs({
  options: {
    send: { type: 'boolean', default: false }
  }
})
assert.ok(values.send, 'Supply --send to authorize four synthetic API requests')
const env = parseEnv(await readFile('.env.production.local', 'utf8'))
assert.ok(env.TYPESAFE_API_KEY?.trim(), 'Missing TYPESAFE_API_KEY')
const directory = resolve(
  'work/diagnostics/jev-context',
  new Date().toISOString().replaceAll(':', '-')
)
await mkdir(directory, { recursive: true, mode: 0o700 })
const question = {
  type: 'noul',
  instructions: 'Does the state contain a greeting?'
}
const base = { model: 'jev-1.13.0', state: 'hello', questions: { q: question } }
const cases = [
  {
    name: 'state-30000-words',
    body: JSON.stringify({ ...base, state: ' hello'.repeat(30_000) })
  },
  {
    name: 'state-34000-words',
    body: JSON.stringify({ ...base, state: ' hello'.repeat(34_000) })
  },
  {
    name: 'total-70000-words',
    body: JSON.stringify({
      ...base,
      questions: Object.fromEntries(
        Array.from({ length: 20 }, (_, i) => [
          `q${i}`,
          {
            ...question,
            instructions:
              ' hello'.repeat(3500) + ' Does the state contain a greeting?'
          }
        ])
      )
    })
  },
  // Large HTTP body with the same tiny semantic input: test bytes vs tokens.
  {
    name: 'whitespace-350000-bytes',
    body: JSON.stringify(base) + ' '.repeat(350_000)
  }
]
for (const { name, body } of cases) {
  const started = performance.now()
  const response = await fetch('https://api.typesafe.ai/v1/systemone', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${env.TYPESAFE_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body,
    signal: AbortSignal.timeout(30_000)
  })
  const text = await response.text()
  let parsed: unknown = text
  try {
    parsed = JSON.parse(text)
  } catch {
    /* Preserve non-JSON firewall errors. */
  }
  const error = response.ok
    ? undefined
    : APIError.fromResponse(response.status, parsed, response.headers)
  const result = {
    name,
    createdAt: new Date().toISOString(),
    requestBytes: Buffer.byteLength(body),
    status: response.status,
    headers: upstreamHeaders(response.headers),
    elapsedMs: Math.round(performance.now() - started),
    response: parsed,
    sdk: error
      ? {
          type: error.constructor.name,
          message: error.message,
          requestId: error.requestId,
          body: error.body
        }
      : undefined
  }
  await writeFile(
    resolve(directory, `${name}.json`),
    JSON.stringify(result, null, 2),
    { mode: 0o600 }
  )
  console.log(JSON.stringify(result))
}
console.log(JSON.stringify({ directory }))
