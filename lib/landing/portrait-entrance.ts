export type FlightTarget = {
  x: number
  y: number
  width: number
  height: number
}

export type PortraitFlight = {
  keyframes: Keyframe[]
  delay: number
  duration: number
}

// Launches sweep doom to bloom across a fixed window, so fuller maps take no longer.
const staggerWindow = 620
const staggerJitter = 40
const flightDuration = 700
// Portraits start near the viewer: larger, blurred, transparent and beyond the
// chart edge nearest their target, as fractions of the chart size.
const startScale = 2.6
const startScaleSpread = 0.4
const startReach = { x: 0.95, y: 0.85 }
const swirl = 0.14
// Near 1, paths arrive head-on, so the landing overshoot reads as depth.
const landingDirectness = 0.85
const fadeUntil = 0.4
const blur = 3
const blurUntil = 0.5
const tilt = 40
const segments = 16

const fract = (value: number) => value - Math.floor(value)
// Deterministic variation keeps every replay of a layout identical.
const noise = (seed: number) =>
  fract(Math.sin(seed * 127.1 + 311.7) * 43758.5453)
const lerp = (a: number, b: number, t: number) => a + (b - a) * t
const round = (value: number, digits = 2) =>
  Math.round(value * 10 ** digits) / 10 ** digits
const cubic = (t: number, a: number, b: number, c: number, d: number) => {
  const u = 1 - t
  return u * u * u * a + 3 * u * u * t * b + 3 * u * t * t * c + t * t * t * d
}

/**
 * Keyframes are spaced along each path; the easing carries the timing. Its
 * overshoot extrapolates past the last keyframe, so a portrait dips just below
 * full size and flat as it lands, then settles.
 */
export function portraitFlights(
  targets: FlightTarget[],
  width: number,
  height: number
): PortraitFlight[] {
  const cx = width / 2
  const cy = height / 2
  const last = Math.max(1, targets.length - 1)
  return targets.map((target, i) => {
    const dx = target.x - cx
    const dy = target.y - cy
    const distance = Math.hypot(dx, dy) || 1
    const angle = Math.atan2(dy, dx) + noise(i * 2.3 + 1) - 0.5
    const start = {
      x: cx + Math.cos(angle) * width * startReach.x,
      y: cy + Math.sin(angle) * height * startReach.y
    }
    // Every path bows the same way around the center, so arrivals swirl together.
    const bend = {
      x: (start.x + target.x) / 2 - (dy / distance) * width * swirl,
      y: (start.y + target.y) / 2 + (dx / distance) * width * swirl
    }
    const approach = {
      x: lerp(bend.x, target.x, landingDirectness),
      y: lerp(bend.y, target.y, landingDirectness)
    }
    // Tilting a disc toward its heading foreshortens it along that direction.
    // A 2D squash matches at portrait size and interpolates alike everywhere.
    const heading = round(
      (Math.atan2(target.y - approach.y, target.x - approach.x) * 180) / Math.PI
    )
    const depth = startScale + (noise(i * 5.9 + 2) - 0.5) * startScaleSpread
    const keyframes = Array.from({ length: segments + 1 }, (_, k) => {
      const t = k / segments
      const x = cubic(t, start.x, bend.x, approach.x, target.x)
      const y = cubic(t, start.y, bend.y, approach.y, target.y)
      return {
        offset: t,
        opacity: round(Math.min(1, t / fadeUntil), 3),
        transform: `translate(${round(x - target.width / 2)}px, ${round(y - target.height / 2)}px) rotate(${heading}deg) scale(${round(Math.cos((tilt * (1 - t) * Math.PI) / 180), 4)}, 1) rotate(${-heading}deg) scale(${round(lerp(depth, 1, t), 4)})`,
        filter: `blur(${round(blur * Math.max(0, 1 - t / blurUntil))}px)`
      }
    })
    return {
      keyframes,
      delay: Math.max(
        0,
        round(
          staggerWindow * (i / last) +
            (noise(i * 7.1 + 3) - 0.5) * staggerJitter
        )
      ),
      duration: flightDuration
    }
  })
}

/**
 * A lightly underdamped spring launched toward its target, as CSS linear().
 * `velocity` is the initial slope; `damping` sets a few percent of overshoot.
 */
export function springEasing(damping = 0.8, velocity = 5, samples = 40) {
  // e^-5.8 leaves 0.3% of the motion when the curve snaps to 1.
  const decay = 5.8
  const frequency = (decay / damping) * Math.sqrt(1 - damping ** 2)
  const points = Array.from({ length: samples + 1 }, (_, i) => {
    if (i === samples) return 1
    const t = i / samples
    return round(
      1 -
        Math.exp(-decay * t) *
          (Math.cos(frequency * t) +
            ((decay - velocity) / frequency) * Math.sin(frequency * t)),
      4
    )
  })
  return `linear(${points.join(', ')})`
}
