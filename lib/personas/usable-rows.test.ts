import { expect, it } from 'vitest'
import { z } from 'zod'
import { expectDiagnostics } from '@/tests/helpers/diagnostics'
import { usableRows } from './usable-rows'

const version = z.object({ slug: z.string(), version: z.literal('v2') })
const read = {
  read: 'test_catalog',
  persona: (row: { slug: string }) => row.slug
}

it('reports and leaves out rows from an unknown schema version', () => {
  expectDiagnostics({
    event: 'persona_row_skipped',
    severity: 'error',
    read: 'test_catalog',
    persona: 'newer',
    error: { type: 'ZodError', code: 'validation_failed' }
  })
  const rows = [
    { slug: 'current', version: 'v2' },
    { slug: 'newer', version: 'v3' },
    { slug: 'also-current', version: 'v2' }
  ]
  expect(usableRows(rows, (row) => version.parse(row), read)).toEqual([
    { slug: 'current', version: 'v2' },
    { slug: 'also-current', version: 'v2' }
  ])
})

it('fails the read when no row parses', () => {
  expectDiagnostics({
    event: 'persona_row_skipped',
    severity: 'error',
    read: 'test_catalog',
    count: 2
  })
  const rows = [
    { slug: 'newer', version: 'v3' },
    { slug: 'newest', version: 'v4' }
  ]
  expect(() => usableRows(rows, (row) => version.parse(row), read)).toThrow(
    'Every persona row failed to parse in test_catalog'
  )
})

it('keeps an empty catalog empty', () => {
  expect(usableRows([], (row) => version.parse(row), read)).toEqual([])
})
