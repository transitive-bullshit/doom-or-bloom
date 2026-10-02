import { expect, it } from 'vitest'
import {
  publicStatementProblems,
  publicStatements,
  publicStatementsSchema,
  type PublicStatements
} from './public-statements'

const statement = (date: string, quote = 'AI will change how we work.') => ({
  quote,
  date,
  venue: 'Interview',
  url: 'https://example.com/interview',
  verified: '2026-10-02'
})
const file = (overrides: Partial<PublicStatements> = {}): PublicStatements => ({
  slug: 'example',
  summary:
    'Researcher who expects large benefits from AI and calls for independent testing of the most capable systems.',
  statements: [
    statement('2026-09-12'),
    statement('2026-01'),
    statement('2024-10-03')
  ],
  ...overrides
})

it('accepts short, dated quotes listed newest first', () => {
  expect(publicStatementProblems(file())).toEqual([])
})

it('requires newest first, whatever the date precision', () => {
  expect(
    publicStatementProblems(
      file({
        statements: [
          statement('2026-01'),
          statement('2026-09-12'),
          statement('2024-10')
        ]
      })
    )
  ).toContain('statement 1 is older than the one after it; list newest first')
})

it('keeps quotes short and free of our own quotation marks', () => {
  const long = Array.from({ length: 31 }, () => 'word').join(' ')
  const problems = publicStatementProblems(
    file({
      statements: [
        statement('2026-09-12', long),
        statement('2026-01', '“Quoted twice.”'),
        statement('2024-10')
      ]
    })
  )
  expect(problems).toContain('statement 1 has 31 words, over 30')
  expect(problems).toContain('statement 2 wraps its quote in quotation marks')
})

it('holds the summary to the one-liner rule', () => {
  expect(
    publicStatementProblems(
      file({
        summary:
          'Researcher who puts the chance of AI-driven extinction at 20% and calls for a pause.'
      })
    )
  ).toContain('summary states a P(doom) or percentage')
})

it('needs three to five sourced statements', () => {
  expect(
    publicStatementsSchema.safeParse(
      file({ statements: [statement('2026-01'), statement('2025-01')] })
    ).success
  ).toBe(false)
})

it('passes every committed profile', () => {
  const problems = [...publicStatements.values()].flatMap((statements) =>
    publicStatementProblems(statements).map(
      (problem) => `${statements.slug}: ${problem}`
    )
  )
  expect(problems).toEqual([])
})
