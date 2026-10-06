import { z } from 'zod'
import { siteUrl } from '@/lib/site'
import type { AiQuestion } from './ai-questions'

// The pure parts of the monthly AI-answer check (scripts/seo-ai-citations.ts):
// reading citations from an OpenAI web search reply, matching the site's
// domain, and comparing one run with the previous one.

/** A URL's host, lowercased and without a leading "www.". */
export function domainOf(url: string) {
  try {
    return new URL(url).hostname.toLowerCase().replace(/^www\./u, '')
  } catch {
    return ''
  }
}

/** The site's domain, doom-or-bloom.com. */
export const siteDomain = domainOf(siteUrl)

/** Whether a URL is on the site or one of its subdomains. */
export function isOwnUrl(url: string, domain = siteDomain) {
  const host = domainOf(url)
  return host === domain || host.endsWith(`.${domain}`)
}

/**
 * A URL without its fragment or the `utm_` parameters search tools add
 * (OpenAI appends `?utm_source=openai`), so the same page compares equal.
 */
export function cleanUrl(url: string) {
  try {
    const parsed = new URL(url)
    parsed.hash = ''
    const tracking = [...parsed.searchParams.keys()].filter((key) =>
      key.startsWith('utm_')
    )
    for (const key of tracking) parsed.searchParams.delete(key)
    return parsed.toString()
  } catch {
    return url
  }
}

// USD per million tokens, checked 2026-10-06 on OpenAI's pricing page. Cached
// input is priced in full, as elsewhere in the repo's estimates.
export const modelRates = {
  'gpt-5-nano': { input: 0.05, output: 0.4 },
  'gpt-6-luna': { input: 0.1, output: 0.5 },
  'gpt-5-mini': { input: 0.25, output: 2 }
} as const
export type CitationModel = keyof typeof modelRates
/** Each web search costs $10 per 1,000; the pages it reads bill as input. */
const webSearchUsd = 0.01

export type Usage = {
  inputTokens: number
  outputTokens: number
  /** Billed web searches. */
  searches: number
}

export function replyCost(model: CitationModel, usage: Usage) {
  const rates = modelRates[model]
  return (
    (usage.inputTokens * rates.input + usage.outputTokens * rates.output) /
      1_000_000 +
    usage.searches * webSearchUsd
  )
}

const replySchema = z.object({
  status: z.string(),
  output: z.array(
    z.object({
      type: z.string(),
      action: z
        .object({
          query: z.string().optional(),
          queries: z.array(z.string()).optional(),
          url: z.string().optional(),
          sources: z
            .array(z.object({ type: z.string(), url: z.string().optional() }))
            .optional()
        })
        .optional(),
      content: z
        .array(
          z.object({
            type: z.string(),
            text: z.string().optional(),
            annotations: z
              .array(
                z.object({
                  type: z.string(),
                  url: z.string().optional(),
                  title: z.string().optional(),
                  start_index: z.number().optional()
                })
              )
              .optional()
          })
        )
        .optional()
    })
  ),
  usage: z.object({
    input_tokens: z.number().nonnegative(),
    output_tokens: z.number().nonnegative()
  }),
  tool_usage: z
    .object({
      web_search: z
        .object({ num_requests: z.number().nonnegative() })
        .optional()
    })
    .optional()
})

type Citation = {
  /** 1 for the first distinct URL the answer cites, 2 for the next. */
  rank: number
  url: string
  title: string
  domain: string
  own: boolean
}

export type Reply = {
  /** `completed`, or `incomplete` when the reply hit its output limit. */
  status: string
  text: string
  citations: Citation[]
  /** Pages the searches read, cited or not. */
  sources: string[]
  searchQueries: string[]
  usage: Usage
}

const unique = <T>(values: T[]) => [...new Set(values)]

/**
 * Why a reply can't count as an answer, or null when it can: it must be
 * completed, or incomplete (cut off at its output limit) with answer text.
 */
export function unusableReply(reply: Pick<Reply, 'status' | 'text'>) {
  if (reply.status !== 'completed' && reply.status !== 'incomplete')
    return `reply ${reply.status}`
  if (!reply.text.trim()) return `${reply.status} reply without text`
  return null
}

/** The answer, its citations and the pages its searches read. */
export function readReply(body: unknown): Reply {
  const reply = replySchema.parse(body)
  const searches = reply.output.filter(
    (item) => item.type === 'web_search_call'
  )
  const parts = reply.output
    .filter((item) => item.type === 'message')
    .flatMap((item) => item.content ?? [])
    .filter((part) => part.type === 'output_text')
  const cited = new Map<string, string>()
  for (const part of parts)
    for (const annotation of (part.annotations ?? []).toSorted(
      (a, b) => (a.start_index ?? 0) - (b.start_index ?? 0)
    ))
      if (annotation.type === 'url_citation' && annotation.url) {
        const url = cleanUrl(annotation.url)
        if (!cited.has(url)) cited.set(url, annotation.title ?? '')
      }
  return {
    status: reply.status,
    text: parts
      .map((part) => part.text ?? '')
      .join('\n')
      .trim(),
    citations: [...cited].map(([url, title], index) => ({
      rank: index + 1,
      url,
      title,
      domain: domainOf(url),
      own: isOwnUrl(url)
    })),
    sources: unique(
      searches.flatMap(({ action }) => [
        ...(action?.sources ?? []).flatMap((source) =>
          source.type === 'url' && source.url ? [cleanUrl(source.url)] : []
        ),
        ...(action?.url ? [cleanUrl(action.url)] : [])
      ])
    ),
    searchQueries: unique(
      searches.flatMap(
        ({ action }) => action?.queries ?? (action?.query ? [action.query] : [])
      )
    ),
    usage: {
      inputTokens: reply.usage.input_tokens,
      outputTokens: reply.usage.output_tokens,
      searches:
        reply.tool_usage?.web_search?.num_requests ??
        searches.filter((item) => item.action?.query || item.action?.queries)
          .length
    }
  }
}

export type AnsweredQuestion = AiQuestion & {
  status: 'answered'
  /** Whether the answer cites a page on the site. */
  cited: boolean
  /** Ranks of the site's citations among the distinct cited URLs. */
  ownRanks: number[]
  /** Whether a page on the site was among those the searches read. */
  consulted: boolean
  /** Distinct cited domains, in rank order. */
  domains: string[]
  citations: Citation[]
  sources: string[]
  searchQueries: string[]
  answer: string
  replyStatus: string
  usage: Usage
  usd: number
}
type FailedQuestion = AiQuestion & { status: 'failed'; error: string }
export type QuestionResult = AnsweredQuestion | FailedQuestion

export function answeredQuestion(
  question: AiQuestion,
  reply: Reply,
  usd: number
): AnsweredQuestion {
  const own = reply.citations.filter((citation) => citation.own)
  return {
    ...question,
    status: 'answered',
    cited: own.length > 0,
    ownRanks: own.map((citation) => citation.rank),
    consulted: reply.sources.some((url) => isOwnUrl(url)),
    domains: unique(reply.citations.map((citation) => citation.domain)),
    citations: reply.citations,
    sources: reply.sources,
    searchQueries: reply.searchQueries,
    answer: reply.text,
    replyStatus: reply.status,
    usage: reply.usage,
    usd
  }
}

/** One run's file, work/seo/ai-citations/<date>.json. */
export type CitationRun = {
  version: 1
  date: string
  model: string
  domain: string
  startedAt: string
  finishedAt: string
  costUsd: number
  /** Bounds of requests that got no response and may still have been billed. */
  unresolvedUsd?: number
  results: QuestionResult[]
}

const answered = (results: QuestionResult[]) =>
  results.filter(
    (result): result is AnsweredQuestion => result.status === 'answered'
  )

/** The newest earlier run's file name, from a directory listing. */
/** A run's file name: one per day and model, so runs of different models never overwrite each other. */
export const runFileName = (date: string, model: string) =>
  `${date}-${model}.json`

/** The newest earlier run by the same model, from a directory listing. */
export function previousRunFile(names: string[], date: string, model: string) {
  const suffix = `-${model}.json`
  return names
    .filter(
      (name) =>
        name.endsWith(suffix) &&
        /^\d{4}-\d{2}-\d{2}$/u.test(name.slice(0, -suffix.length))
    )
    .filter((name) => name < runFileName(date, model))
    .toSorted()
    .at(-1)
}

/** Cited domains by how many answers cite them, then by citations. */
export function topDomains(results: QuestionResult[], limit = 10) {
  const counts = new Map<string, { answers: number; citations: number }>()
  for (const result of answered(results)) {
    for (const citation of result.citations) {
      const count = counts.get(citation.domain) ?? { answers: 0, citations: 0 }
      count.citations++
      counts.set(citation.domain, count)
    }
    for (const domain of result.domains) counts.get(domain)!.answers++
  }
  return [...counts]
    .map(([domain, count]) => ({ domain, ...count }))
    .toSorted(
      (a, b) =>
        b.answers - a.answers ||
        b.citations - a.citations ||
        a.domain.localeCompare(b.domain)
    )
    .slice(0, limit)
}

/**
 * What changed since the previous run, for questions answered in both:
 * answers that started or stopped citing the site, moves in the site's best
 * rank, and domains entering or leaving the top cited domains among the
 * questions both runs answered.
 */
export function compareRuns(
  previous: CitationRun,
  current: CitationRun,
  limit = 10
) {
  const earlierById = new Map(
    answered(previous.results).map((result) => [result.id, result])
  )
  const pairs = answered(current.results).flatMap((later) => {
    const earlier = earlierById.get(later.id)
    return earlier ? [{ earlier, later }] : []
  })
  // Rank domains over the same answered questions in both runs, so a failed
  // or added question doesn't move a domain in or out of the top.
  const top = (results: QuestionResult[]) =>
    topDomains(results, limit).map(({ domain }) => domain)
  const topBefore = top(pairs.map(({ earlier }) => earlier))
  const topNow = top(pairs.map(({ later }) => later))
  return {
    previousDate: previous.date,
    citedBefore: answered(previous.results).filter((result) => result.cited)
      .length,
    answeredBefore: answered(previous.results).length,
    gained: pairs
      .filter(({ earlier, later }) => !earlier.cited && later.cited)
      .map(({ later }) => ({
        question: later.question,
        ranks: later.ownRanks
      })),
    lost: pairs
      .filter(({ earlier, later }) => earlier.cited && !later.cited)
      .map(({ later }) => ({ question: later.question })),
    moved: pairs
      .filter(
        ({ earlier, later }) =>
          earlier.cited &&
          later.cited &&
          earlier.ownRanks[0] !== later.ownRanks[0]
      )
      .map(({ earlier, later }) => ({
        question: later.question,
        before: earlier.ownRanks[0]!,
        after: later.ownRanks[0]!
      })),
    domainsIn: topNow.filter((domain) => !topBefore.includes(domain)),
    domainsOut: topBefore.filter((domain) => !topNow.includes(domain))
  }
}

const ranks = (values: number[]) => values.map((rank) => `#${rank}`).join(', ')
const path = (url: string) => {
  try {
    return new URL(url).pathname
  } catch {
    return url
  }
}

/** The printed summary of a run, and its changes since the previous one. */
export function formatSummary(run: CitationRun, previous?: CitationRun | null) {
  const results = answered(run.results)
  const cited = results.filter((result) => result.cited)
  const consulted = results.filter(
    (result) => !result.cited && result.consulted
  )
  const failed = run.results.filter((result) => result.status === 'failed')
  const lines = [
    `${run.date}: ${run.model} answered ${results.length} of ${run.results.length} questions for about $${run.costUsd.toFixed(3)}`,
    '',
    `Cited in ${cited.length} of ${results.length} answers${cited.length ? ':' : ''}`,
    ...cited.map(
      (result) =>
        `  ${ranks(result.ownRanks)}  ${result.question}  (${unique(
          result.citations
            .filter((citation) => citation.own)
            .map((citation) => path(citation.url))
        ).join(', ')})`
    )
  ]
  if (consulted.length)
    lines.push(
      `Read but not cited in ${consulted.length}: ${consulted.map((result) => result.question).join('; ')}`
    )
  if (failed.length)
    lines.push(
      `Failed: ${failed.map((result) => `${result.question} (${result.error})`).join('; ')}`
    )
  const domains = topDomains(run.results)
  lines.push('', 'Top cited domains (answers citing them, citations):')
  for (const { domain, answers, citations } of domains)
    lines.push(
      `  ${String(answers).padStart(2)} ${String(citations).padStart(3)}  ${domain}`
    )
  if (!previous) {
    lines.push('', 'No earlier run to compare with.')
    return lines.join('\n')
  }
  const changes = compareRuns(previous, run)
  lines.push(
    '',
    `Since ${changes.previousDate} (cited in ${changes.citedBefore} of ${changes.answeredBefore} answers then):`
  )
  const list = (label: string, items: string[]) => {
    if (items.length) lines.push(`  ${label}: ${items.join('; ')}`)
  }
  list(
    'Now cited',
    changes.gained.map((item) => `${item.question} (${ranks(item.ranks)})`)
  )
  list(
    'No longer cited',
    changes.lost.map((item) => item.question)
  )
  list(
    'Best rank moved',
    changes.moved.map(
      (item) => `${item.question} (#${item.before} to #${item.after})`
    )
  )
  list('New in the top domains', changes.domainsIn)
  list('Left the top domains', changes.domainsOut)
  if (
    !changes.gained.length &&
    !changes.lost.length &&
    !changes.moved.length &&
    !changes.domainsIn.length &&
    !changes.domainsOut.length
  )
    lines.push('  No changes in the site’s citations or the top domains.')
  return lines.join('\n')
}
