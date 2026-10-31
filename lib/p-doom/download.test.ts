import { describe, expect, it } from 'vitest'
import { hubCsv } from './download'
import { hubRows } from './hub'
import { curatedPeople } from './curated'

const person = (id: string) => ({
  id,
  slug: id,
  name: id,
  avatar: `/personas/${id}.jpg`
})
const everyone = curatedPeople.map(({ id }) => person(id))

describe('the public P(doom) download', () => {
  it('exports exactly the curated published table in its reading order', () => {
    const csv = hubCsv(everyone)
    const names = csv
      .split('\r\n')
      .slice(1, -1)
      .map((row) => row.split(',')[0])
    expect(names).toEqual(hubRows(everyone).map((row) => `"${row.name}"`))
    expect(hubCsv([]).split('\r\n')).toHaveLength(2)
    expect(hubCsv([person('not-curated')])).not.toContain('not-curated')
    expect(hubCsv([person('concerned-pioneer')], {})).not.toContain(
      'concerned-pioneer'
    )
  })

  it('keeps stated ranges, uncertainty and no-number responses distinct', () => {
    const csv = hubCsv([
      person('concerned-pioneer'),
      person('world-model-optimist'),
      person('control-alarmist')
    ])
    expect(csv).toContain('"world-model-optimist","stated","≈0%"')
    expect(csv).toContain('"concerned-pioneer","stated","10–20%"')
    expect(csv).toContain('"control-alarmist","no_number",""')
    expect(csv).toContain('"Human extinction caused by AI"')
    expect(csv).toContain('"2025-01-10"')
    expect(csv).toContain(
      '"https://www.wbur.org/onpoint/2025/01/10/ai-geoffrey-hinton-physics-nobel-prize"'
    )
    expect(csv).toContain(
      '"https://www.doom-or-bloom.com/p-doom#pdoom-table-title"'
    )
    // The export includes the source's outcome, horizon and conditions, not
    // merely a numeric column that invites averaging incompatible estimates.
    expect(csv).toContain('"outcome","horizon","conditions"')
    expect(csv).toContain('Subjective estimate; explicitly uncertain')
  })

  it('preserves commas, quotes and line breaks inside UTF-8 CSV cells', () => {
    const csv = hubCsv([{ ...person('concerned-pioneer'), name: 'A, "B"' }], {
      'concerned-pioneer': {
        token: '≥10%',
        bounds: [0.1, 0.99],
        title: 'A "talk",\r\npart two',
        url: 'https://example.com/talk',
        publishedAt: '2026-10-30',
        outcome: 'A catastrophe',
        horizon: 'By 2100',
        conditions: 'Conditional on "X", not Y'
      }
    })
    expect(csv).toContain('"A, ""B""","stated","≥10%"')
    expect(csv).toContain('"A ""talk"",\r\npart two"')
    expect(csv).toContain('"Conditional on ""X"", not Y"')
    expect(csv).toContain('"2026-10-30"')
    expect(csv.endsWith('\r\n')).toBe(true)
  })
})
