import { expect, it } from 'vitest'
import { oneLinerProblems } from './one-liner-rules'

const book = {
  quote: 'If Anyone Builds It, Everyone Dies',
  url: 'https://ifanyonebuildsit.com/'
}

it('accepts a neutral description of what someone argues or works on', () => {
  expect(
    oneLinerProblems(
      'AI safety researcher who studies how to keep powerful AI systems under control even if they turn out to be misaligned.'
    )
  ).toEqual([])
})

it('rejects numbers and outcomes in our own words', () => {
  expect(
    oneLinerProblems(
      'Writer who puts her P(doom) at 75% and backs an international pause on frontier AI development.'
    )
  ).toContain('states a P(doom) or percentage')
  expect(
    oneLinerProblems(
      'Researcher who argues that racing to superhuman AI with current methods likely kills everyone.'
    )
  ).toContain('names an outcome (“kills”) outside a quote')
})

it('allows an outcome only inside the verified quote', () => {
  const line =
    'MIRI co-founder and co-author of “If Anyone Builds It, Everyone Dies,” who calls for an international halt to building superintelligence.'
  expect(oneLinerProblems(line, book)).toEqual([])
  expect(oneLinerProblems(line)).toContain(
    'quotes words that are not a verified quote'
  )
  expect(
    oneLinerProblems(
      'Co-author of “If Anyone Builds It, Everyone Dies,” who expects human extinction from superintelligence.',
      book
    )
  ).toContain('names an outcome (“extinction”) outside a quote')
})

it('keeps lines short, plain and punctuated', () => {
  expect(oneLinerProblems('Builds agents.')).toContain(
    'is 14 characters, outside 60–150'
  )
  expect(
    oneLinerProblems(
      'Developer who builds coding agents; writes about context engineering and reliable tools'
    )
  ).toEqual(['does not end with a period', 'uses a semicolon or dash'])
})
