import { describe, expect, test } from 'vitest'
import { contractDocs, datedHeadings } from './contract-rules'

describe('contractDocs', () => {
  const readme = `# Project guide

See [architecture](architecture.md).

## Choose the relevant contract

| When changing… | Read… |
| --- | --- |
| Product | [PRODUCT.md](PRODUCT.md) |
| Analytics | [MEASUREMENT.md](MEASUREMENT.md), [evaluation-protocol.md](evaluation-protocol.md#scope) |
| Re-scoring | [PERSISTENCE.md](PERSISTENCE.md#re-evaluating-saved-results) |
| Deployment | [production-readiness.md](production-readiness.md) |

## Decisions and previous work

- [Plan](mvp-implementation-plan.md)
`

  test('lists each routed doc once, without the dated verification log', () => {
    expect(contractDocs(readme)).toEqual([
      'PRODUCT.md',
      'MEASUREMENT.md',
      'evaluation-protocol.md',
      'PERSISTENCE.md'
    ])
  })

  test('fails loudly when the table is missing', () => {
    expect(() => contractDocs('# Guide\n')).toThrow('no contract table')
  })
})

describe('datedHeadings', () => {
  test('finds headings that carry a date', () => {
    expect(
      datedHeadings(
        [
          '# Workflow',
          '## Import selected simulated users',
          '## Nick Bostrom — October 3, 2026',
          '## Initial expansion — September 20–21, 2026',
          '### Directory (2026-09-23)',
          '## Additional September 2026 X evidence',
          'Run on October 3, 2026 in body text.'
        ].join('\n')
      )
    ).toEqual([
      '## Nick Bostrom — October 3, 2026',
      '## Initial expansion — September 20–21, 2026',
      '### Directory (2026-09-23)',
      '## Additional September 2026 X evidence'
    ])
  })

  test('ignores versions and undated headings', () => {
    expect(
      datedHeadings('## Current workflow — algorithm 0.7.4\n## Budgets')
    ).toEqual([])
  })
})
