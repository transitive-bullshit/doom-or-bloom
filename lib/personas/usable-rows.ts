import { reportServerError } from '../server/error-reporting'

/**
 * Parse catalog rows independently. A persona saved by a newer or older schema
 * is reported and left out of the list, but a read with no usable rows fails.
 */
export function usableRows<Row, Parsed>(
  rows: readonly Row[],
  parse: (row: Row) => Parsed,
  context: { read: string; persona: (row: Row) => string | null }
) {
  const parsed: Parsed[] = []
  let failure: unknown
  let failed = false
  for (const row of rows) {
    try {
      parsed.push(parse(row))
    } catch (err) {
      failure ??= err
      failed = true
      reportServerError('persona_row_skipped', err, {
        read: context.read,
        persona: context.persona(row)
      })
    }
  }
  if (failed && !parsed.length)
    throw new Error(`Every persona row failed to parse in ${context.read}`, {
      cause: failure
    })
  return parsed
}
