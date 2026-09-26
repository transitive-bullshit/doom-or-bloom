// 0.00–2.20 s · "One, two, three, hit it!"
// A type composition in a larger world; the camera slams, whips and dives.
import { circle, fill, measure, text, type Ctx } from '../engine/draw'
import {
  clamp,
  hit,
  inExpo,
  inOutCubic,
  inOutSine,
  inQuart,
  lerp,
  outBack,
  outCubic,
  outExpo,
  outQuart,
  ramp,
  shake
} from '../engine/ease'
import { C, FONT } from '../engine/theme'
import { applyCamera, type S } from './common'

const BIG = 300
const OR = 250

/** Custom question mark so its dot can leave the glyph. Origin: baseline-left. */
export const questionHook = (
  ctx: Ctx,
  x: number,
  y: number,
  k: number,
  color: string
) => {
  ctx.save()
  ctx.translate(x, y)
  ctx.scale(k, k)
  ctx.beginPath()
  ctx.moveTo(22, -152)
  ctx.bezierCurveTo(22, -204, 58, -222, 84, -222)
  ctx.bezierCurveTo(120, -222, 146, -198, 146, -162)
  ctx.bezierCurveTo(146, -124, 116, -108, 98, -95)
  ctx.bezierCurveTo(82, -84, 76, -74, 76, -54)
  ctx.lineWidth = 47
  ctx.lineCap = 'round'
  ctx.lineJoin = 'round'
  ctx.strokeStyle = color
  ctx.stroke()
  ctx.restore()
}
/** Dot position relative to the question mark origin, in glyph units. */
export const QDOT = { x: 76, y: -12, r: 27 }

const layout = (ctx: Ctx) => {
  const wD = measure(ctx, 'DOOM', { size: BIG, weight: 900, tracking: -0.045 })
  const wB = measure(ctx, 'BLOOM', { size: BIG, weight: 900, tracking: -0.045 })
  const wO = measure(ctx, 'or', {
    family: 'serif',
    italic: true,
    size: OR,
    weight: 400
  })
  const qW = 176
  const doom = { x: 205, y: 400, w: wD }
  const or = { x: 960 - wO / 2 + 40, y: 612, w: wO }
  const bloom = { x: 1745 - (wB + qW), y: 925, w: wB }
  const q = { x: bloom.x + wB + 18, y: 925 }
  return {
    doom,
    or,
    bloom,
    q,
    dot: { x: q.x + QDOT.x, y: q.y + QDOT.y },
    cDoom: { x: doom.x + wD / 2, y: doom.y - 108 },
    cOr: { x: or.x + wO / 2, y: or.y - 62 },
    cBloom: { x: bloom.x + (wB + qW) / 2 - 60, y: bloom.y - 108 }
  }
}

const WIDE = { x: 975, y: 560, zoom: 0.93 }

export function drawHook(ctx: Ctx, s: S) {
  const b = s.b
  const L = layout(ctx)
  fill(ctx, C.ink, s.W, s.H)

  // The "?" dot jumps on "it!" and becomes the dive target.
  const jump = b < 17.5 ? 0 : Math.sin(ramp(b, 17.5, 17.8) * Math.PI) * -40
  const dot = { x: L.dot.x, y: L.dot.y + jump }

  // Camera path: slam onto DOOM, whip to "or", whip to BLOOM, pull wide, dive.
  const whip = inOutCubic
  let cx: number
  let cy: number
  let zoom: number
  if (b < 14) {
    const p = ramp(b, 13.3, 14, inQuart)
    cx = lerp(L.cDoom.x + 120, L.cDoom.x, p)
    cy = lerp(L.cDoom.y - 20, L.cDoom.y, p)
    zoom = lerp(6.5, 1.62, p)
  } else if (b < 15) {
    const p = ramp(b, 14.78, 15, whip)
    const drift = ramp(b, 14, 14.78)
    cx = lerp(L.cDoom.x + drift * 14, L.cOr.x, p)
    cy = lerp(L.cDoom.y, L.cOr.y, p)
    zoom = lerp(1.62 + drift * 0.06, 2.35, p)
  } else if (b < 16) {
    const p = ramp(b, 15.78, 16, whip)
    const drift = ramp(b, 15, 15.78)
    cx = lerp(L.cOr.x - drift * 10, L.cBloom.x, p)
    cy = lerp(L.cOr.y, L.cBloom.y, p)
    zoom = lerp(2.35 + drift * 0.08, 1.5, p)
  } else if (b < 17.5) {
    const p = ramp(b, 16.78, 17, whip)
    const drift = ramp(b, 16, 16.78)
    const push = ramp(b, 17, 17.5)
    cx = lerp(L.cBloom.x + drift * 12, WIDE.x, p)
    cy = lerp(L.cBloom.y, WIDE.y, p)
    zoom = lerp(1.5 + drift * 0.06, WIDE.zoom + push * 0.04, p)
  } else {
    // Linger on the whole question through the band's downbeat, creeping in,
    // then dive into the "?" dot so the cut lands on the horn entry (beat 20).
    const hold = (bb: number) => {
      const c = ramp(bb, 17.5, 19.55, inOutSine)
      return {
        x: lerp(WIDE.x, WIDE.x + 36, c),
        y: lerp(WIDE.y, WIDE.y + 20, c),
        zoom: WIDE.zoom + 0.04 + c * 0.1
      }
    }
    if (b < 19.5) {
      const h = hold(b)
      cx = h.x
      cy = h.y
      zoom = h.zoom
    } else {
      // Keep the dot on screen: animate its screen position, derive the camera.
      const h = hold(19.5)
      zoom = lerp(h.zoom, 72, ramp(b, 19.5, 20, inExpo))
      const s0x = s.W / 2 + (L.dot.x - h.x) * h.zoom
      const s0y = s.H / 2 + (L.dot.y - h.y) * h.zoom
      const m = ramp(b, 19.5, 19.92, outCubic)
      const sx = lerp(s0x, s.W / 2, m)
      const sy = lerp(s0y, s.H / 2, m)
      cx = dot.x - (sx - s.W / 2) / zoom
      cy = dot.y - (sy - s.H / 2) / zoom
    }
  }
  const sh = [14, 15, 16, 17].reduce(
    (acc, at) => {
      const k = shake(b, at, at === 14 ? 26 : 12, 0.3)
      return { x: acc.x + k.x, y: acc.y + k.y, r: acc.r + k.r }
    },
    { x: 0, y: 0, r: 0 }
  )

  // Giant outlined numerals drift behind the words at their own parallax.
  const numerals: [number, string][] = [
    [14, '1'],
    [15, '2'],
    [16, '3']
  ]
  for (const [at, n] of numerals) {
    if (b < at || b >= at + 1.05) continue
    const p = ramp(b, at, at + 1, outCubic)
    const a = (1 - ramp(b, at + 0.7, at + 1.02)) * ramp(b, at, at + 0.08)
    ctx.save()
    ctx.globalAlpha = 0.16 * a
    ctx.translate(
      s.W / 2 + (n === '2' ? 330 : n === '3' ? -420 : 380) - p * 60,
      s.H / 2 + 330
    )
    ctx.scale(1 + p * 0.08, 1 + p * 0.08)
    ctx.font = `900 1150px ${FONT.sans}`
    ctx.textAlign = 'center'
    ctx.lineWidth = 3
    ctx.strokeStyle = n === '1' ? C.coral : n === '2' ? C.paper : C.mint
    ctx.strokeText(n, 0, 0)
    ctx.restore()
  }

  ctx.save()
  applyCamera(ctx, s, { x: cx, y: cy, zoom, rot: sh.r, ox: sh.x, oy: sh.y })

  const down = 1 + 0.045 * hit(b, 18, 0.45)
  const pop = (at: number) => (1 + 0.07 * hit(b, at, 0.35)) * down
  const scaled = (c: { x: number; y: number }, k: number, fn: () => void) => {
    ctx.save()
    ctx.translate(c.x, c.y)
    ctx.scale(k, k)
    ctx.translate(-c.x, -c.y)
    fn()
    ctx.restore()
  }
  scaled(L.cDoom, pop(14), () =>
    text(ctx, 'DOOM', L.doom.x, L.doom.y, {
      size: BIG,
      weight: 900,
      tracking: -0.045,
      color: C.coral
    })
  )
  if (b >= 14.8)
    scaled(L.cOr, pop(15), () =>
      text(ctx, 'or', L.or.x, L.or.y, {
        family: 'serif',
        italic: true,
        size: OR,
        weight: 400,
        color: C.paper,
        alpha: b >= 15 ? 1 : ramp(b, 14.8, 15)
      })
    )
  if (b >= 15.8)
    scaled(L.cBloom, pop(16), () =>
      text(ctx, 'BLOOM', L.bloom.x, L.bloom.y, {
        size: BIG,
        weight: 900,
        tracking: -0.045,
        color: C.mint,
        alpha: b >= 16 ? 1 : ramp(b, 15.8, 16)
      })
    )

  // "?" slams in on "hit".
  if (b >= 17) {
    const p = ramp(b, 17, 17.18, outExpo)
    scaled({ x: L.q.x + 80, y: L.q.y - 110 }, lerp(1.9, 1, p), () => {
      ctx.globalAlpha = clamp(p * 3)
      questionHook(ctx, L.q.x, L.q.y, 1, C.paper)
    })
    const squash = 1 + 0.25 * hit(b, 17.5, 0.2)
    const dp = ramp(b, 17, 17.14, outBack(2.2))
    const beat = 1 + 0.35 * hit(b, 18, 0.3) + 0.2 * hit(b, 19, 0.3)
    for (const at of [18, 18.14]) {
      const rp = ramp(b, at, at + 1.3, outQuart)
      if (rp <= 0 || rp >= 1) continue
      ctx.save()
      ctx.globalAlpha = (1 - rp) * 0.55
      ctx.lineWidth = lerp(10, 1.5, rp)
      ctx.strokeStyle = at === 18 ? C.paper : C.mint
      ctx.beginPath()
      ctx.arc(dot.x, dot.y, lerp(QDOT.r * 1.4, 1100, rp), 0, Math.PI * 2)
      ctx.stroke()
      ctx.restore()
    }
    ctx.save()
    ctx.translate(dot.x, dot.y)
    ctx.scale(dp * squash * beat, (dp / squash) * beat)
    circle(ctx, 0, 0, QDOT.r, C.paper)
    ctx.restore()
  }
  ctx.restore()

  // Slate counter: 01 · 02 · 03 · GO, a small rhythmic detail.
  let label = ''
  for (const [at, l] of [
    [14, '01'],
    [15, '02'],
    [16, '03'],
    [17, 'GO']
  ] as [number, string][])
    if (b >= at) label = l
  if (label && b < 19.5) {
    text(ctx, label, 96, 112, {
      family: 'mono',
      size: 26,
      weight: 500,
      color: C.paper,
      alpha: 0.6
    })
    text(ctx, 'DOOM-OR-BLOOM.COM', s.W - 96, 112, {
      family: 'mono',
      size: 20,
      weight: 500,
      color: C.paper,
      align: 'right',
      alpha: 0.38
    })
  }

  // Post: impacts, whip blur, and the zoom into the dot.
  const fx = s.fx
  fx.bg = [0.055, 0.055, 0.047]
  fx.bloom = (0.2 + 0.22 * hit(b, 18, 0.5)) * (1 - ramp(b, 19.7, 19.95))
  fx.bloomThreshold = 0.7
  fx.vignette = 0.32 * (1 - ramp(b, 19.75, 19.98))
  fx.ca =
    0.8 +
    14 * hit(b, 14, 0.3) +
    7 * (hit(b, 15, 0.25) + hit(b, 16, 0.25) + hit(b, 17, 0.25)) +
    9 * hit(b, 18, 0.35)
  const whipping =
    (b > 14.76 && b < 15.03) ||
    (b > 15.76 && b < 16.03) ||
    (b > 16.76 && b < 17.03)
  fx.samples =
    whipping || b > 19.5
      ? 56
      : (b > 13.8 && b < 14.03) || (b > 17.45 && b < 17.85)
        ? 40
        : 12
  if (b > 19.55) {
    fx.zoomBlur = Math.sin(ramp(b, 19.6, 20) * Math.PI) * 0.16
    fx.zoomCenter = [0.5, 0.5]
  }
}
