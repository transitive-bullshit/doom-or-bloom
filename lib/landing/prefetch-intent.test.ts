import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { createPrefetchIntent, nearbyPortraits } from './prefetch-intent'

describe('map prefetch intent', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })
  afterEach(() => {
    vi.useRealTimers()
  })

  it('caps eligibility at three distinct profiles and replaces only distant candidates', () => {
    const intent = createPrefetchIntent()
    intent.select(['alice', 'alice', 'bob', 'carol', 'dave'])
    vi.advanceTimersByTime(150)
    expect(
      ['alice', 'bob', 'carol', 'dave'].filter((key) => intent.isActive(key))
    ).toEqual(['alice', 'bob', 'carol'])
    intent.select(['bob', 'carol', 'dave'])
    expect(intent.isActive('alice')).toBe(false)
    expect(intent.isActive('bob')).toBe(true)
    expect(intent.isActive('carol')).toBe(true)
    vi.runAllTimers()
    expect(intent.isActive('dave')).toBe(true)
    intent.clear()
    expect(
      ['alice', 'bob', 'carol', 'dave'].some((key) => intent.isActive(key))
    ).toBe(false)
  })

  it('ignores a passing pointer and cancels a candidate on leave', () => {
    const intent = createPrefetchIntent()
    const changed = vi.fn<() => void>()
    intent.subscribe(changed)
    intent.select(['alice'])
    vi.advanceTimersByTime(40)
    intent.select(['bob'])
    vi.advanceTimersByTime(40)
    intent.select([])
    vi.runAllTimers()
    expect(changed).not.toHaveBeenCalled()
    expect(intent.isActive('alice')).toBe(false)
    expect(intent.isActive('bob')).toBe(false)
  })

  it('warms a stable nearby target without postponing on every pointer event', () => {
    const intent = createPrefetchIntent()
    intent.select(['alice'])
    for (let i = 0; i < 10; i++) {
      vi.advanceTimersByTime(15)
      intent.select(['alice'])
    }
    expect(intent.isActive('alice')).toBe(true)
    intent.select([])
    expect(intent.isActive('alice')).toBe(false)
  })

  it('replaces queued work and rate limits a sweep over different portraits', () => {
    const intent = createPrefetchIntent()
    intent.select(['alice'], 'hover')
    vi.advanceTimersByTime(100)
    expect(intent.isActive('alice')).toBe(true)
    intent.select(['bob'], 'hover')
    expect(intent.isActive('alice')).toBe(false)
    vi.advanceTimersByTime(100)
    expect(intent.isActive('bob')).toBe(false)
    intent.select(['carol'], 'hover')
    vi.advanceTimersByTime(160)
    expect(intent.isActive('carol')).toBe(true)
    expect(intent.isActive('bob')).toBe(false)
  })

  it('prioritizes keyboard/touch intent and cleans up pending work', () => {
    const intent = createPrefetchIntent()
    intent.select(['alice'])
    intent.select(['alice'], 'explicit')
    expect(intent.isActive('alice')).toBe(true)
    intent.select(['bob'], 'explicit')
    expect(intent.isActive('alice')).toBe(false)
    expect(intent.isActive('bob')).toBe(true)
    intent.select(['carol'])
    intent.clear()
    vi.runAllTimers()
    expect(intent.isActive('carol')).toBe(false)
  })

  it('notifies only when eligibility changes and supports unsubscription', () => {
    const intent = createPrefetchIntent()
    const changed = vi.fn<() => void>()
    const unsubscribe = intent.subscribe(changed)
    intent.select(['alice'], 'explicit')
    intent.select(['alice'], 'explicit')
    expect(changed).toHaveBeenCalledTimes(1)
    unsubscribe()
    intent.clear()
    expect(changed).toHaveBeenCalledTimes(1)
  })

  it('ranks nearby laid-out portraits and none outside the proximity radius', () => {
    const points = [
      { key: 'alice', x: 100, y: 100, radius: 20 },
      { key: 'bob', x: 200, y: 100, radius: 20 }
    ]
    expect(nearbyPortraits(points, 145, 100)).toEqual(['alice', 'bob'])
    expect(nearbyPortraits(points, 165, 100)).toEqual(['bob', 'alice'])
    expect(nearbyPortraits(points, 150, 200)).toEqual([])
    expect(nearbyPortraits([], 100, 100)).toEqual([])
  })
})
