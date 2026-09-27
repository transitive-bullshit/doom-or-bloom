import { expect, it } from 'vitest'
import { portraitFlights, springEasing } from './portrait-entrance'

const targets = (count: number) =>
  Array.from({ length: count }, (_, i) => ({
    x: 40 + ((i * 37) % 600),
    y: 20 + ((i * 53) % 340),
    width: 40,
    height: 40
  }))

it('lands every portrait flat, sharp and exactly on its laid-out position', () => {
  const layout = targets(12)
  portraitFlights(layout, 680, 380).forEach((flight, i) => {
    const last = flight.keyframes.at(-1)!
    expect(last.offset).toBe(1)
    expect(last.opacity).toBe(1)
    expect(last.filter).toBe('blur(0px)')
    expect(last.transform).toMatch(
      new RegExp(
        `^translate\\(${layout[i]!.x - 20}px, ${layout[i]!.y - 20}px\\) rotate\\([-\\d.]+deg\\) scale\\(1, 1\\) rotate\\([-\\d.]+deg\\) scale\\(1\\)$`
      )
    )
  })
})

it('starts each portrait transparent, enlarged and outside the chart', () => {
  for (const flight of portraitFlights(targets(20), 680, 380)) {
    const first = flight.keyframes[0]!
    const [, x, y] = String(first.transform).match(
      /translate\((-?[\d.]+)px, (-?[\d.]+)px\)/
    )!
    const center = { x: Number(x) + 20, y: Number(y) + 20 }
    expect(first.opacity).toBe(0)
    expect(
      Number(String(first.transform).match(/scale\(([\d.]+)\)/)![1])
    ).toBeGreaterThan(2)
    expect(
      center.x < 0 || center.x > 680 || center.y < 0 || center.y > 380
    ).toBe(true)
  }
})

it('sweeps doom to bloom within the same window for any map size', () => {
  for (const count of [44, 150]) {
    const flights = portraitFlights(targets(count), 680, 380)
    const ends = flights.map(({ delay, duration }) => delay + duration)
    expect(flights[0]!.delay).toBeLessThan(30)
    expect(flights.at(-1)!.delay).toBeGreaterThan(590)
    expect(Math.max(...ends)).toBeLessThanOrEqual(1350)
    // Neighbours may trade places, never whole stretches of the sweep.
    for (let i = 10; i < count; i++)
      expect(flights[i]!.delay).toBeGreaterThan(flights[i - 10]!.delay)
  }
})

it('replays identically for the same layout', () => {
  expect(portraitFlights(targets(8), 680, 380)).toEqual(
    portraitFlights(targets(8), 680, 380)
  )
})

it('springs from 0 to exactly 1 with a small overshoot', () => {
  const points = springEasing()
    .slice('linear('.length, -1)
    .split(', ')
    .map(Number)
  expect(points[0]).toBe(0)
  expect(points.at(-1)).toBe(1)
  expect(Math.max(...points)).toBeGreaterThan(1.01)
  expect(Math.max(...points)).toBeLessThan(1.05)
})
