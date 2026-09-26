import { expect, onTestFinished, vi } from 'vitest'

type ExpectedDiagnostic = {
  event: string
  severity: 'error' | 'warn'
  count?: number
  [field: string]: unknown
}

// Opt in within a single (non-concurrent) test. Match structured fields and a
// bounded count; malformed, unrelated and excess output goes to the real console.
export function expectDiagnostics(...expected: ExpectedDiagnostic[]) {
  const remaining = expected.map(({ count = 1, ...fields }) => ({
    fields,
    count,
    seen: 0
  }))
  const logs: string[] = []
  const spies = (['error', 'warn'] as const).map((level) => {
    const original = console[level].bind(console)
    return vi.spyOn(console, level).mockImplementation((...args: unknown[]) => {
      let diagnostic: unknown
      if (args.length === 1 && typeof args[0] === 'string') {
        try {
          diagnostic = JSON.parse(args[0])
        } catch {
          // Plain text is not an expected structured diagnostic.
        }
      }
      const match = remaining.find(
        ({ fields, count, seen }) =>
          fields.severity === level &&
          seen < count &&
          matchesFields(diagnostic, fields)
      )
      if (match) {
        match.seen++
        logs.push(args[0] as string)
      } else {
        original(...args)
      }
    })
  })
  onTestFinished(() => {
    for (const spy of spies) spy.mockRestore()
    for (const { fields, count, seen } of remaining)
      expect(seen, `Expected diagnostic: ${JSON.stringify(fields)}`).toBe(count)
  })
  return logs
}

function matchesFields(actual: unknown, expected: unknown): boolean {
  if (expected === null || typeof expected !== 'object')
    return Object.is(actual, expected)
  if (actual === null || typeof actual !== 'object') return false
  return Object.entries(expected).every(
    ([key, value]) =>
      Object.hasOwn(actual, key) &&
      matchesFields((actual as Record<string, unknown>)[key], value)
  )
}
