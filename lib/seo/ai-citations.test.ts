import { describe, expect, test } from 'vitest'
import {
  answeredQuestion,
  cleanUrl,
  compareRuns,
  domainOf,
  formatSummary,
  isOwnUrl,
  previousRunFile,
  readReply,
  replyCost,
  siteDomain,
  topDomains,
  type CitationRun,
  type QuestionResult
} from './ai-citations'
import { aiQuestions } from './ai-questions'

describe('domains', () => {
  test('the site domain comes from the site URL', () => {
    expect(siteDomain).toBe('doom-or-bloom.com')
  })

  test('hosts lose www. and case, and keep other subdomains', () => {
    expect(domainOf('https://WWW.Example.com/a?b=1')).toBe('example.com')
    expect(domainOf('https://en.wikipedia.org/wiki/P%28doom%29')).toBe(
      'en.wikipedia.org'
    )
    expect(domainOf('not a url')).toBe('')
  })

  test('own URLs are the site and its subdomains only', () => {
    expect(isOwnUrl('https://www.doom-or-bloom.com/p-doom')).toBe(true)
    expect(isOwnUrl('https://doom-or-bloom.com/')).toBe(true)
    expect(isOwnUrl('https://es.doom-or-bloom.com/')).toBe(true)
    expect(isOwnUrl('https://notdoom-or-bloom.com/')).toBe(false)
    expect(isOwnUrl('https://doom-or-bloom.com.example.net/')).toBe(false)
    expect(isOwnUrl('https://example.com/?u=doom-or-bloom.com')).toBe(false)
  })

  test('cleaning drops utm parameters and fragments only', () => {
    expect(
      cleanUrl('https://en.wikipedia.org/wiki/P%28doom%29?utm_source=openai')
    ).toBe('https://en.wikipedia.org/wiki/P%28doom%29')
    expect(cleanUrl('https://a.com/x?id=3&utm_medium=x#top')).toBe(
      'https://a.com/x?id=3'
    )
  })
})

// The shape of a gpt-5-nano reply with web search, trimmed.
const reply = {
  status: 'completed',
  output: [
    { type: 'reasoning', content: [], encrypted_content: 'gAAA' },
    {
      type: 'web_search_call',
      status: 'completed',
      action: {
        type: 'search',
        query: 'P(doom) meaning',
        queries: ['P(doom) meaning', 'P(doom) estimates list'],
        sources: [
          { type: 'url', url: 'https://en.wikipedia.org/wiki/P%28doom%29' },
          { type: 'url', url: 'https://www.doom-or-bloom.com/p-doom' },
          { type: 'api', name: 'oai-news' },
          {
            type: 'url',
            url: 'https://en.wikipedia.org/wiki/P%28doom%29?utm_source=openai'
          }
        ]
      }
    },
    {
      type: 'web_search_call',
      status: 'completed',
      action: { type: 'open_page', url: 'https://pauseai.info/pdoom' }
    },
    {
      type: 'message',
      content: [
        {
          type: 'output_text',
          text: 'P(doom) is a stated probability of catastrophe from AI.',
          annotations: [
            {
              type: 'url_citation',
              start_index: 90,
              end_index: 120,
              title: 'P(doom) hub',
              url: 'https://www.doom-or-bloom.com/p-doom?utm_source=openai'
            },
            {
              type: 'url_citation',
              start_index: 10,
              end_index: 40,
              title: 'P(doom)',
              url: 'https://en.wikipedia.org/wiki/P%28doom%29?utm_source=openai'
            },
            {
              type: 'url_citation',
              start_index: 150,
              end_index: 180,
              title: 'P(doom)',
              url: 'https://en.wikipedia.org/wiki/P%28doom%29?utm_source=openai'
            },
            {
              type: 'url_citation',
              start_index: 200,
              end_index: 230,
              title: 'List',
              url: 'https://pauseai.info/pdoom'
            }
          ]
        }
      ]
    }
  ],
  usage: { input_tokens: 8812, output_tokens: 547 },
  tool_usage: { web_search: { num_requests: 1 } }
}

describe('reading a reply', () => {
  test('citations rank distinct URLs in the order the text cites them', () => {
    const { citations, text, status } = readReply(reply)
    expect(status).toBe('completed')
    expect(text).toBe('P(doom) is a stated probability of catastrophe from AI.')
    expect(citations).toEqual([
      {
        rank: 1,
        url: 'https://en.wikipedia.org/wiki/P%28doom%29',
        title: 'P(doom)',
        domain: 'en.wikipedia.org',
        own: false
      },
      {
        rank: 2,
        url: 'https://www.doom-or-bloom.com/p-doom',
        title: 'P(doom) hub',
        domain: 'doom-or-bloom.com',
        own: true
      },
      {
        rank: 3,
        url: 'https://pauseai.info/pdoom',
        title: 'List',
        domain: 'pauseai.info',
        own: false
      }
    ])
  })

  test('sources, queries and billed searches come from the search calls', () => {
    const { sources, searchQueries, usage } = readReply(reply)
    expect(sources).toEqual([
      'https://en.wikipedia.org/wiki/P%28doom%29',
      'https://www.doom-or-bloom.com/p-doom',
      'https://pauseai.info/pdoom'
    ])
    expect(searchQueries).toEqual(['P(doom) meaning', 'P(doom) estimates list'])
    expect(usage).toEqual({ inputTokens: 8812, outputTokens: 547, searches: 1 })
    // Without tool usage, searches count the calls that searched.
    const { tool_usage: _, ...untallied } = reply
    expect(readReply(untallied).usage.searches).toBe(1)
  })

  test('an answer without citations still reads', () => {
    const plain = readReply({
      status: 'incomplete',
      output: [],
      usage: { input_tokens: 10, output_tokens: 0 }
    })
    expect(plain).toMatchObject({ text: '', citations: [], sources: [] })
    expect(plain.usage.searches).toBe(0)
  })

  test('cost adds tokens at model rates to $10 per 1,000 searches', () => {
    expect(
      replyCost('gpt-5-nano', {
        inputTokens: 1_000_000,
        outputTokens: 1_000_000,
        searches: 2
      })
    ).toBeCloseTo(0.05 + 0.4 + 0.02)
  })

  test('an answered question records the site’s ranks and domains', () => {
    const result = answeredQuestion(aiQuestions[0]!, readReply(reply), 0.011)
    expect(result).toMatchObject({
      id: 'what-is-pdoom',
      status: 'answered',
      cited: true,
      ownRanks: [2],
      consulted: true,
      domains: ['en.wikipedia.org', 'doom-or-bloom.com', 'pauseai.info']
    })
  })
})

// Run fixtures: each answer cites the given URLs in order.
const answer = (id: string, urls: string[]): QuestionResult => ({
  ...answeredQuestion(
    { id, question: `Question ${id}?`, group: 'core' },
    {
      status: 'completed',
      text: '',
      citations: urls.map((url, index) => ({
        rank: index + 1,
        url,
        title: '',
        domain: domainOf(url),
        own: isOwnUrl(url)
      })),
      sources: urls,
      searchQueries: [],
      usage: { inputTokens: 0, outputTokens: 0, searches: 1 }
    },
    0.01
  )
})
const failure = (id: string): QuestionResult => ({
  id,
  question: `Question ${id}?`,
  group: 'core',
  status: 'failed',
  error: 'HTTP 500 after 3 tries'
})
const runOf = (date: string, results: QuestionResult[]): CitationRun => ({
  version: 1,
  date,
  model: 'gpt-5-nano',
  domain: siteDomain,
  startedAt: `${date}T00:00:00.000Z`,
  finishedAt: `${date}T00:01:00.000Z`,
  costUsd: 0.2,
  results
})
const own = 'https://www.doom-or-bloom.com/p-doom'
const wiki = 'https://en.wikipedia.org/wiki/P%28doom%29'
const pause = 'https://pauseai.info/pdoom'
const reddit = 'https://www.reddit.com/r/x'

test('top domains count answers first, then citations', () => {
  const results = [
    answer('a', [wiki, `${wiki}#x`, pause]),
    answer('b', [wiki, reddit]),
    answer('c', [pause]),
    failure('d')
  ]
  expect(topDomains(results)).toEqual([
    { domain: 'en.wikipedia.org', answers: 2, citations: 3 },
    { domain: 'pauseai.info', answers: 2, citations: 2 },
    { domain: 'reddit.com', answers: 1, citations: 1 }
  ])
  expect(topDomains(results, 1)).toHaveLength(1)
})

describe('comparing runs', () => {
  const previous = runOf('2026-09-06', [
    answer('gained', [wiki]),
    answer('lost', [own]),
    answer('moved', [wiki, pause, own]),
    answer('steady', [own, wiki]),
    answer('failed-now', [own]),
    failure('failed-then'),
    answer('dropped-question', [own])
  ])
  const current = runOf('2026-10-06', [
    answer('gained', [wiki, own]),
    answer('lost', [wiki]),
    answer('moved', [own, wiki]),
    answer('steady', [own, reddit]),
    failure('failed-now'),
    answer('failed-then', [own]),
    answer('new-question', [own])
  ])

  test('only questions answered in both runs gain, lose or move', () => {
    expect(compareRuns(previous, current)).toEqual({
      previousDate: '2026-09-06',
      citedBefore: 5,
      answeredBefore: 6,
      gained: [{ question: 'Question gained?', ranks: [2] }],
      lost: [{ question: 'Question lost?' }],
      moved: [{ question: 'Question moved?', before: 3, after: 1 }],
      domainsIn: ['reddit.com'],
      domainsOut: ['pauseai.info']
    })
  })

  test('the summary lists the site’s citations and the changes', () => {
    const summary = formatSummary(current, previous)
    expect(summary).toContain(
      '2026-10-06: gpt-5-nano answered 6 of 7 questions for about $0.200'
    )
    expect(summary).toContain('Cited in 5 of 6 answers:')
    expect(summary).toContain('  #2  Question gained?  (/p-doom)')
    expect(summary).toContain('Failed: Question failed-now? (HTTP 500')
    expect(summary).toContain(
      'Since 2026-09-06 (cited in 5 of 6 answers then):'
    )
    expect(summary).toContain('  Now cited: Question gained? (#2)')
    expect(summary).toContain('  No longer cited: Question lost?')
    expect(summary).toContain('  Best rank moved: Question moved? (#3 to #1)')
    expect(summary).toContain('  New in the top domains: reddit.com')
    expect(summary).toContain('  Left the top domains: pauseai.info')
    expect(formatSummary(current, current)).toContain('No changes')
    expect(formatSummary(current)).toContain('No earlier run to compare with.')
  })

  test('the previous run is the newest file dated before this one', () => {
    expect(
      previousRunFile(
        [
          '2026-08-01.json',
          '2026-10-06.json',
          '2026-09-06.json',
          'notes.txt',
          '2026-09-30.json.bak'
        ],
        '2026-10-06'
      )
    ).toBe('2026-09-06.json')
    expect(previousRunFile(['2026-10-06.json'], '2026-10-06')).toBeUndefined()
  })
})

test('question ids are unique', () => {
  const ids = aiQuestions.map((question) => question.id)
  expect(new Set(ids).size).toBe(ids.length)
})
