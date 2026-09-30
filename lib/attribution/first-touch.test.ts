import { describe, expect, it } from 'vitest'
import {
  attributionUrl,
  captureFirstTouch,
  cleanTag,
  earliestFirstTouch,
  firstTouchCookie,
  firstTouchCookieString,
  firstTouchProperties,
  readFirstTouch
} from './first-touch'

const now = new Date('2026-10-01T12:00:00.000Z')
const capture = (href: string, referrer = '') =>
  captureFirstTouch({ url: new URL(href), referrer, now })

describe('captureFirstTouch', () => {
  it('records tags, the external referrer host and a coarse landing', () => {
    expect(
      capture(
        'https://www.doom-or-bloom.com/users/simonw?ref=sim-simonw&utm_medium=DM&x=1',
        'https://t.co/abc?secret=1'
      )
    ).toEqual({
      v: 1,
      ref: 'sim-simonw',
      medium: 'dm',
      referrer: 't.co',
      landing: 'user',
      at: now.toISOString()
    })
  })

  it('treats internal navigation and missing referrers as direct', () => {
    const touch = capture(
      'https://www.doom-or-bloom.com/',
      'https://doom-or-bloom.com/about'
    )
    expect(touch.referrer).toBeUndefined()
    expect(firstTouchProperties(touch).first_touch_channel).toBe('direct')
  })

  it('never keeps a private assessment id or path', () => {
    const touch = capture(
      'https://www.doom-or-bloom.com/assessments/0b8f1f0e-0000-4000-8000-000000000000'
    )
    expect(touch.landing).toBe('assessment')
    expect(JSON.stringify(touch)).not.toContain('0b8f1f0e')
  })
})

describe('cleanTag', () => {
  it('normalizes free text to a short slug', () => {
    expect(cleanTag(' Hacker News ')).toBe('hacker-news')
    expect(cleanTag('--')).toBeUndefined()
    expect(cleanTag('a'.repeat(80))).toHaveLength(64)
  })
})

describe('cookie round trip', () => {
  it('reads back what it writes and ignores malformed values', () => {
    const touch = capture('https://www.doom-or-bloom.com/?ref=hn')
    const cookie = firstTouchCookieString(touch, true).split(';')[0]
    expect(readFirstTouch(`other=1; ${cookie}`)).toEqual(touch)
    expect(readFirstTouch(`${firstTouchCookie}=%7Bbroken`)).toBeNull()
    expect(
      readFirstTouch(
        `${firstTouchCookie}=${encodeURIComponent(JSON.stringify({ ...touch, ref: 'Not A Slug' }))}`
      )
    ).toBeNull()
  })
})

describe('earliestFirstTouch', () => {
  it('keeps the older origin and tolerates missing values', () => {
    const early = capture('https://www.doom-or-bloom.com/?ref=hn')
    const late = { ...early, ref: 'x', at: '2026-10-05T00:00:00.000Z' }
    expect(earliestFirstTouch(late, early)).toEqual(early)
    expect(earliestFirstTouch(null, late)).toEqual(late)
    expect(earliestFirstTouch(null, { junk: true })).toBeNull()
  })
})

describe('attributionUrl', () => {
  it('keeps only normalized UTM tags and maps ref to utm_source', () => {
    expect(
      attributionUrl(
        'https://www.doom-or-bloom.com/users/gwern?ref=LW&token=secret#frag'
      )
    ).toBe('https://www.doom-or-bloom.com/users/gwern?utm_source=lw')
    expect(
      attributionUrl(
        'https://www.doom-or-bloom.com/?utm_source=newsletter&ref=x&utm_campaign=Oct%20Launch'
      )
    ).toBe(
      'https://www.doom-or-bloom.com/?utm_source=newsletter&utm_campaign=oct-launch'
    )
    expect(attributionUrl('https://www.doom-or-bloom.com/about?q=1')).toBe(
      'https://www.doom-or-bloom.com/about'
    )
  })
})
