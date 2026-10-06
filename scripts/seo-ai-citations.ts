// The monthly AI-answer check: asks the questions in lib/seo/ai-questions.ts
// to an OpenAI model with web search and records which pages each answer
// cites. See docs/MEASUREMENT.md#search-engines.
//
//   pnpm seo:ai-citations (--dry-run | --allow-paid --max-cost=<usd>)
//                         [--model=gpt-5-nano] [--concurrency=8]
//
// A run writes work/seo/ai-citations/<date>-<model>.json (a rerun of the same
// model the same day replaces it), prints the answers citing the site, the top cited domains and
// the changes since the newest earlier run, and appends each paid call to
// eval/runs/seo-ai-citations-<time>.jsonl. The OpenAI key comes from the
// environment; run it from a login shell that has it.
import {
  appendFileSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  writeFileSync
} from 'node:fs'
import path from 'node:path'
import { setTimeout as sleep } from 'node:timers/promises'
import { parseArgs } from 'node:util'
import pMap from 'p-map'
import {
  answeredQuestion,
  formatSummary,
  modelRates,
  previousRunFile,
  runFileName,
  unusableReply,
  readReply,
  replyCost,
  siteDomain,
  type CitationModel,
  type CitationRun,
  type QuestionResult,
  type Usage
} from '../lib/seo/ai-citations'
import { aiQuestions, type AiQuestion } from '../lib/seo/ai-questions'

const { values } = parseArgs({
  options: {
    'dry-run': { type: 'boolean', default: false },
    'allow-paid': { type: 'boolean', default: false },
    'max-cost': { type: 'string' },
    model: { type: 'string', default: 'gpt-5-nano' },
    concurrency: { type: 'string', default: '8' }
  }
})
if (values['dry-run'] === values['allow-paid'])
  throw new Error('Choose --dry-run or --allow-paid --max-cost=<usd>')
const maxCost = Number(values['max-cost'])
if (values['allow-paid'] && !(maxCost > 0 && maxCost <= 1))
  throw new Error('--max-cost must be greater than 0 and at most $1')
if (!Object.hasOwn(modelRates, values.model!))
  throw new Error(
    `--model must be one of ${Object.keys(modelRates).join(', ')}`
  )
const model = values.model as CitationModel
const concurrency = Number(values.concurrency)
if (!Number.isInteger(concurrency) || concurrency < 1)
  throw new Error('--concurrency must be a positive whole number')

// One answer is bounded by its searches and output tokens; the pages its
// searches read bill as input tokens, which stay far below this bound.
const maxSearches = 3
const maxOutputTokens = 6000
const answerBound = replyCost(model, {
  inputTokens: 60_000,
  outputTokens: maxOutputTokens,
  searches: maxSearches
})
// Asked as written, with no instructions, from an approximate US location.
// Every answer searches at least once.
const request = {
  model,
  store: false,
  reasoning: { effort: 'low' },
  max_output_tokens: maxOutputTokens,
  max_tool_calls: maxSearches,
  tools: [
    {
      type: 'web_search',
      user_location: { type: 'approximate', country: 'US' }
    }
  ],
  tool_choice: 'required',
  include: ['web_search_call.action.sources']
}

console.log(
  `${aiQuestions.length} questions to ${model} with web search, at most about $${(answerBound * aiQuestions.length).toFixed(2)} (up to ${maxSearches} searches per answer):`
)
for (const question of aiQuestions)
  console.log(`  ${question.id.padEnd(28)} ${question.question}`)
if (values['dry-run']) process.exit(0)

const apiKey = process.env.OPENAI_API_KEY?.trim()
if (!apiKey)
  throw new Error(
    "Missing OPENAI_API_KEY. Run from a login shell that has it: bash -lc 'pnpm seo:ai-citations …'"
  )

const root = process.cwd()
mkdirSync(path.join(root, 'eval/runs'), { recursive: true })
const ledger = `eval/runs/seo-ai-citations-${Date.now()}.jsonl`
// Spend from usage, plus reservations for calls in flight. A call that ends
// without a response may still be billed, so its bound moves to `unresolved`:
// it counts against the cap, is logged, and is reported as possible spend.
let spent = 0
let reserved = 0
let unresolved = 0

function record(
  question: AiQuestion,
  usd: number,
  usage: Usage | { unreadable: true } | { unresolved: true }
) {
  appendFileSync(
    path.join(root, ledger),
    `${JSON.stringify({
      at: new Date().toISOString(),
      tag: `seo-ai-citations:${question.id}`,
      model,
      ...usage,
      usd
    })}\n`
  )
}

// OpenAI's error code is a fixed identifier. Never print the message or the
// body, which can echo part of the key.
async function errorCode(response: Response) {
  try {
    const body = (await response.json()) as { error?: { code?: unknown } }
    const code = body.error?.code
    return typeof code === 'string' && /^[a-z0-9_]{1,64}$/u.test(code)
      ? ` ${code}`
      : ''
  } catch {
    return ''
  }
}

async function ask(question: AiQuestion): Promise<QuestionResult> {
  const failed = (error: string): QuestionResult => ({
    ...question,
    status: 'failed',
    error
  })
  const body = JSON.stringify({ ...request, input: question.question })
  for (let attempt = 1; ; attempt++) {
    if (spent + unresolved + reserved + answerBound > maxCost)
      return failed(`skipped to stay under the $${maxCost} cap`)
    reserved += answerBound
    const response = await fetch('https://api.openai.com/v1/responses', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body,
      signal: AbortSignal.timeout(180_000)
    }).catch(() => null)
    reserved -= answerBound
    if (!response) {
      // Timed out or dropped after it may have been accepted and billed.
      unresolved += answerBound
      record(question, answerBound, { unresolved: true })
    }
    if (!response || response.status === 429 || response.status >= 500) {
      if (attempt >= 3)
        return failed(`HTTP ${response?.status ?? 'transport'} after 3 tries`)
      await sleep(3000 * attempt)
      continue
    }
    if (!response.ok)
      return failed(`HTTP ${response.status}${await errorCode(response)}`)
    let reply
    try {
      reply = readReply(await response.json())
    } catch {
      // Billed but unreadable: count the whole bound.
      spent += answerBound
      record(question, answerBound, { unreadable: true })
      return failed('unreadable reply')
    }
    const usd = replyCost(model, reply.usage)
    spent += usd
    record(question, usd, reply.usage)
    const unusable = unusableReply(reply)
    if (unusable) return failed(unusable)
    return answeredQuestion(question, reply, usd)
  }
}

const startedAt = new Date()
const date = startedAt.toISOString().slice(0, 10)
const results = await pMap(aiQuestions, ask, { concurrency })
const run: CitationRun = {
  version: 1,
  date,
  model,
  domain: siteDomain,
  startedAt: startedAt.toISOString(),
  finishedAt: new Date().toISOString(),
  costUsd: spent,
  unresolvedUsd: unresolved,
  results
}
const directory = 'work/seo/ai-citations'
mkdirSync(path.join(root, directory), { recursive: true })
// Save the paid run first, so nothing below can lose it.
const file = `${directory}/${runFileName(date, model)}`
writeFileSync(path.join(root, file), `${JSON.stringify(run, null, 2)}\n`)
const previousName = previousRunFile(
  readdirSync(path.join(root, directory)),
  date,
  model
)
let previous: CitationRun | null = null
if (previousName)
  try {
    previous = JSON.parse(
      readFileSync(path.join(root, directory, previousName), 'utf8')
    ) as CitationRun
  } catch {
    console.warn(`Couldn't read ${previousName}; skipping the comparison.`)
  }
console.log(`\n${formatSummary(run, previous)}`)
const possible = unresolved
  ? ` plus up to $${unresolved.toFixed(3)} for requests that got no response`
  : ''
console.log(
  `\nWrote ${file}. Spent about $${spent.toFixed(3)}${possible} (ledger ${ledger}).`
)
if (results.some((result) => result.status === 'failed')) process.exitCode = 1
