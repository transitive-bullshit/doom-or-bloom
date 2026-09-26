export const clamp = (v: number, min = 0, max = 1) =>
  Math.min(max, Math.max(min, v))
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t
export const invLerp = (a: number, b: number, v: number) => (v - a) / (b - a)
export const smoothstep = (a: number, b: number, v: number) => {
  const t = clamp((v - a) / (b - a))
  return t * t * (3 - 2 * t)
}

export type Ease = (t: number) => number

export const linear: Ease = (t) => t
export const outQuad: Ease = (t) => 1 - (1 - t) * (1 - t)
export const inQuad: Ease = (t) => t * t
export const inOutQuad: Ease = (t) =>
  t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2
export const outCubic: Ease = (t) => 1 - Math.pow(1 - t, 3)
export const inCubic: Ease = (t) => t * t * t
export const inOutCubic: Ease = (t) =>
  t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2
export const outQuart: Ease = (t) => 1 - Math.pow(1 - t, 4)
export const inQuart: Ease = (t) => t * t * t * t
export const inOutQuart: Ease = (t) =>
  t < 0.5 ? 8 * t * t * t * t : 1 - Math.pow(-2 * t + 2, 4) / 2
export const outQuint: Ease = (t) => 1 - Math.pow(1 - t, 5)
export const inOutQuint: Ease = (t) =>
  t < 0.5 ? 16 * t * t * t * t * t : 1 - Math.pow(-2 * t + 2, 5) / 2
export const outExpo: Ease = (t) => (t >= 1 ? 1 : 1 - Math.pow(2, -10 * t))
export const inExpo: Ease = (t) => (t <= 0 ? 0 : Math.pow(2, 10 * t - 10))
export const inOutExpo: Ease = (t) =>
  t <= 0
    ? 0
    : t >= 1
      ? 1
      : t < 0.5
        ? Math.pow(2, 20 * t - 10) / 2
        : (2 - Math.pow(2, -20 * t + 10)) / 2
export const outBack =
  (s = 1.70158): Ease =>
  (t) =>
    1 + (s + 1) * Math.pow(t - 1, 3) + s * Math.pow(t - 1, 2)
export const inBack =
  (s = 1.70158): Ease =>
  (t) =>
    (s + 1) * t * t * t - s * t * t
export const inOutSine: Ease = (t) => -(Math.cos(Math.PI * t) - 1) / 2
export const outSine: Ease = (t) => Math.sin((t * Math.PI) / 2)

/** Underdamped spring settle, 0 → 1 with overshoot. `t` in beats. */
export const spring =
  (freq = 2.2, damping = 5): Ease =>
  (t) => {
    if (t <= 0) return 0
    return 1 - Math.exp(-damping * t) * Math.cos(freq * Math.PI * 2 * t)
  }

/** Eased 0 → 1 progress of `x` between `a` and `b`. */
export const ramp = (x: number, a: number, b: number, ease: Ease = linear) =>
  ease(clamp((x - a) / (b - a)))

/** Piecewise keyframes [[x, y], ...] with one ease for every segment. */
export const keys = (
  x: number,
  frames: [number, number][],
  ease: Ease = inOutCubic
) => {
  if (x <= frames[0]![0]) return frames[0]![1]
  for (let i = 1; i < frames.length; i++) {
    const [x1, y1] = frames[i]!
    const [x0, y0] = frames[i - 1]!
    if (x <= x1) return lerp(y0, y1, ease((x - x0) / (x1 - x0)))
  }
  return frames[frames.length - 1]![1]
}

/** Impulse that fires at `at` and decays over roughly `len` beats. */
export const hit = (x: number, at: number, len = 0.5) =>
  x < at ? 0 : Math.exp(-((x - at) / len) * 3)

/** Deterministic hash in [0, 1). */
export const rand = (seed: number) => {
  const s = Math.sin(seed * 127.1 + 311.7) * 43758.5453123
  return s - Math.floor(s)
}
export const randRange = (seed: number, a: number, b: number) =>
  a + (b - a) * rand(seed)

/** Smooth value noise in [-1, 1]. */
export const noise1 = (x: number, seed = 0) => {
  const i = Math.floor(x)
  const f = x - i
  const u = f * f * (3 - 2 * f)
  const a = rand(i + seed * 101.3) * 2 - 1
  const b = rand(i + 1 + seed * 101.3) * 2 - 1
  return a + (b - a) * u
}

/** Handheld-style shake for an impact at `at`. */
export const shake = (x: number, at: number, amp = 18, len = 0.35) => {
  const k = hit(x, at, len)
  if (k < 0.002) return { x: 0, y: 0, r: 0 }
  const t = (x - at) * 36
  return {
    x: noise1(t, 1) * amp * k,
    y: noise1(t, 2) * amp * k,
    r: noise1(t, 3) * amp * 0.0012 * k
  }
}

/** Cubic bezier point. */
export const bezier = (
  t: number,
  p0: number,
  p1: number,
  p2: number,
  p3: number
) => {
  const u = 1 - t
  return (
    u * u * u * p0 + 3 * u * u * t * p1 + 3 * u * t * t * p2 + t * t * t * p3
  )
}
