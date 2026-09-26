// Act 3 · the payoff and the CTA (beats 82–114, then the final lockup).
import { face } from '../engine/assets'
import {
  circle,
  fill,
  measure,
  portrait,
  prismField,
  prismGradient,
  rgba,
  rrect,
  text,
  type Ctx,
  type TextStyle
} from '../engine/draw'
import {
  clamp,
  hit,
  inCubic,
  inOutCubic,
  inOutQuart,
  inQuad,
  lerp,
  outBack,
  outCubic,
  outExpo,
  outQuart,
  ramp,
  shake
} from '../engine/ease'
import {
  chain,
  lookAt,
  perspective,
  planeMVP,
  project,
  type M4
} from '../engine/mat4'
import { C } from '../engine/theme'
import { mapPositions, type MapGeom } from '../data/layout'
import { personas } from '../data/personas'
import { closest, you } from '../data/story'
import { kickAt, levelAt } from '../data/envelope'
import { applyCamera, hexToRgb01, type S } from './common'
import { eclipse, softGlow, wordmark } from './brand'

const rise = (
  ctx: Ctx,
  b: number,
  at: number,
  str: string,
  x: number,
  y: number,
  st: TextStyle,
  dur = 0.32
) => {
  if (b < at - 0.02) return
  const p = ramp(b, at - 0.02, at + dur, outExpo)
  ctx.save()
  ctx.beginPath()
  ctx.rect(x - st.size * 2, y - st.size * 1.05, 99999, st.size * 1.4)
  ctx.clip()
  text(ctx, str, x, y + (1 - p) * st.size * 1.1, st)
  ctx.restore()
}

/** A slam: the word lands on its beat from slightly larger, with a blur-friendly scale. */
const slam = (
  ctx: Ctx,
  b: number,
  at: number,
  str: string,
  x: number,
  y: number,
  st: TextStyle
) => {
  if (b < at) return 0
  const p = ramp(b, at, at + 0.22, outExpo)
  const w = measure(ctx, str, st)
  ctx.save()
  ctx.translate(x + w / 2, y - st.size * 0.35)
  const k = lerp(1.45, 1, p)
  ctx.scale(k, k)
  text(ctx, str, -w / 2, st.size * 0.35, { ...st, alpha: clamp(p * 3) })
  ctx.restore()
  return w
}

/** Full-bleed living Prism gradient. */
const livingGradient = (ctx: Ctx, s: S, t: number) => {
  const k = kickAt(s.t)
  const a = ((110 + Math.sin(t * 0.7) * 14) * Math.PI) / 180
  const dx = Math.sin(a)
  const dy = -Math.cos(a)
  const len = Math.abs(s.W * dx) + Math.abs(s.H * dy)
  const cx = s.W / 2 + Math.sin(t * 0.5) * 120
  const cy = s.H / 2
  ctx.fillStyle = prismGradient(
    ctx,
    cx - (dx * len) / 2,
    cy - (dy * len) / 2,
    cx + (dx * len) / 2,
    cy + (dy * len) / 2
  )
  ctx.fillRect(0, 0, s.W, s.H)
  softGlow(
    ctx,
    500 + Math.sin(t * 0.9) * 260,
    380 + Math.cos(t * 0.7) * 160,
    700 + 60 * k,
    C.coral,
    0.4 + 0.2 * k
  )
  softGlow(
    ctx,
    1450 + Math.cos(t * 0.8) * 240,
    700 + Math.sin(t * 0.6) * 140,
    760 + 60 * k,
    C.mint,
    0.4 + 0.2 * k
  )
  softGlow(ctx, 1000 + Math.sin(t * 0.5 + 2) * 300, 520, 620, C.lime, 0.35)
  const veil = ctx.createLinearGradient(0, s.H, 0, 0)
  veil.addColorStop(0, 'rgba(188,177,255,0.55)')
  veil.addColorStop(1, 'rgba(188,177,255,0)')
  ctx.fillStyle = veil
  ctx.fillRect(0, 0, s.W, s.H)
}

// ── D1 · "Know what you believe" ───────────────────────────────────────────
export function drawBelieve(ctx: Ctx, s: S) {
  const b = s.b
  livingGradient(ctx, s, b * 0.9)
  const sh = shake(b, 84, 12, 0.3)
  const sh2 = shake(b, 85, 8, 0.3)
  ctx.save()
  applyCamera(ctx, s, {
    x: 960,
    y: 540,
    zoom: 1 + ramp(b, 82, 86) * 0.05,
    ox: sh.x + sh2.x,
    oy: sh.y + sh2.y
  })
  const st: TextStyle = {
    size: 236,
    weight: 900,
    tracking: -0.055,
    wordSpacing: 0.1,
    color: C.ink
  }
  const x0 = 140
  let x = x0
  for (const [at, w] of [
    [82, 'Know'],
    [82.5, 'what']
  ] as [number, string][]) {
    slam(ctx, b, at, w, x, 500, st)
    x += measure(ctx, w + ' ', st)
  }
  x = x0
  for (const [at, w] of [
    [83, 'you'],
    [83.5, 'believe']
  ] as [number, string][]) {
    slam(ctx, b, at, w, x, 760, st)
    x += measure(ctx, w + ' ', st)
  }
  // Marker underline sweeps under "you believe"
  const u = ramp(b, 84.1, 84.75, inOutCubic)
  if (u > 0) {
    const w = measure(ctx, 'you believe', st)
    ctx.save()
    ctx.strokeStyle = C.ink
    ctx.lineWidth = 16
    ctx.lineCap = 'round'
    ctx.beginPath()
    const n = 40
    for (let i = 0; i <= n * u; i++) {
      const t = i / n
      const px = x0 + 10 + t * (w - 40)
      const py = 820 + Math.sin(t * Math.PI * 3.2) * 9 + t * 8
      if (i === 0) ctx.moveTo(px, py)
      else ctx.lineTo(px, py)
    }
    ctx.stroke()
    ctx.restore()
  }
  ctx.restore()
  const fx = s.fx
  fx.bg = hexToRgb01(C.lime)
  fx.flash = 0.95 * (1 - ramp(b, 82, 82.35, outCubic))
  fx.flashColor = [1, 0.99, 0.96]
  fx.bloom = 0.06
  fx.vignette = 0.16
  fx.ca = 0.6 + 10 * hit(b, 82, 0.35) + 4 * (hit(b, 83, 0.3) + hit(b, 84, 0.3))
  fx.samples = 16
}

// ── D2 · "And why." ─────────────────────────────────────────────────────────
export function drawWhy(ctx: Ctx, s: S) {
  const b = s.b
  fill(ctx, C.ink, s.W, s.H)
  const dive = ramp(b, 89.35, 90, inCubic)
  const push = ramp(b, 86, 89.4, outCubic)
  const sh = shake(b, 88, 14, 0.3)
  // Exit: dive into the period of "why." and flash to the next scene's cream.
  const serif: TextStyle = {
    family: 'serif',
    italic: true,
    size: 640,
    weight: 400
  }
  const ww = measure(ctx, 'why.', serif)
  const wWhy = measure(ctx, 'why', serif)
  const wx = 960 - ww / 2 + 60
  const wy = 830
  const dot = { x: wx + wWhy + (ww - wWhy) * 0.42, y: wy - serif.size * 0.052 }
  // Keep the period on screen: animate its screen position, derive the camera.
  const z0 = 1 + push * 0.06
  const zoom = lerp(z0, 30, dive * dive)
  const m = ramp(b, 89.35, 89.85, outCubic)
  const sx = lerp(960 + (dot.x - 960) * z0, 960, m)
  const sy = lerp(540 + (dot.y - 540) * z0, 540, m)
  const cxw = dot.x - (sx - 960) / zoom
  const cyw = dot.y - (sy - 540) / zoom
  ctx.save()
  applyCamera(ctx, s, { x: cxw, y: cyw, zoom, ox: sh.x, oy: sh.y })
  softGlow(ctx, 960, 620, 900, C.violet, 0.14)
  slam(ctx, b, 86, 'And', 300, 360, {
    size: 120,
    weight: 700,
    tracking: -0.04,
    color: C.paper
  })
  if (b >= 86.5) {
    const p = ramp(b, 86.5, 86.85, outExpo)
    const k = lerp(1.25, 1, p) * (1 + 0.035 * hit(b, 88, 0.35))
    ctx.save()
    ctx.translate(960, 600)
    ctx.scale(k, k)
    ctx.translate(-960, -600)
    text(ctx, 'why.', wx, wy, {
      ...serif,
      color: prismGradient(ctx, wx, 0, wx + ww, 0),
      alpha: clamp(p * 2)
    })
    ctx.restore()
  }
  ctx.restore()
  const fx = s.fx
  fx.bg = hexToRgb01(C.ink)
  fx.bloom = 0.34
  fx.bloomThreshold = 0.6
  fx.vignette = 0.38
  fx.ca = 0.8 + 8 * hit(b, 86.5, 0.35) + 5 * hit(b, 88, 0.3)
  fx.samples = dive > 0 ? 40 : 12
  fx.zoomBlur = dive * 0.2
  fx.flash = ramp(b, 89.8, 90, inCubic)
  fx.flashColor = [0.984, 0.98, 0.965]
}

// ── D3 · "Find who thinks like you" — cards flip in, in true perspective ──
const CARD = { w: 470, h: 540, pad: 60 }
const cardCanvases = new Map<string, HTMLCanvasElement>()

const personCard = (slug: string, rank: number) => {
  let c = cardCanvases.get(slug)
  if (c) return c
  c = document.createElement('canvas')
  c.width = CARD.w + CARD.pad * 2
  c.height = CARD.h + CARD.pad * 2
  const x = c.getContext('2d')!
  x.translate(CARD.pad, CARD.pad)
  x.shadowBlur = 50
  x.shadowColor = 'rgba(25,30,20,0.25)'
  x.shadowOffsetY = 24
  rrect(x, 0, 0, CARD.w, CARD.h, 44, '#ffffff')
  x.shadowColor = 'transparent'
  rrect(x, 0, 0, CARD.w, CARD.h, 44, undefined, 'rgba(37,57,43,0.14)', 2.5)
  portrait(x, face(slug), 60 + 105, 60 + 105, 210, { ring: 0, shadow: 0 })
  text(x, String(rank), CARD.w - 60, 140, {
    size: 76,
    weight: 400,
    color: '#77776e',
    align: 'right'
  })
  const name = personas.find((p) => p.slug === slug)!.name
  text(x, name, 60, CARD.h - 70, {
    size: 50,
    weight: 600,
    tracking: -0.025,
    color: C.ink
  })
  text(x, 'Simulated worldview', 62, CARD.h - 130, {
    family: 'mono',
    size: 20,
    weight: 500,
    color: '#8f8c82'
  })
  cardCanvases.set(slug, c)
  return c
}

export function drawClosest(ctx: Ctx, s: S) {
  const b = s.b
  fill(ctx, C.paper, s.W, s.H)
  softGlow(ctx, 960, 640, 900, C.peach, 0.25)
  softGlow(ctx, 1400, 500, 600, C.mint, 0.22)
  const st: TextStyle = {
    size: 96,
    weight: 800,
    tracking: -0.045,
    color: C.ink
  }
  const serif: TextStyle = {
    family: 'serif',
    italic: true,
    size: 112,
    weight: 400,
    color: C.ink
  }
  const w1 = measure(ctx, 'Find who thinks like ', st)
  const w2 = measure(ctx, 'you', serif)
  const x0 = 960 - (w1 + w2) / 2
  rise(ctx, b, 90, 'Find who thinks like', x0, 200, st)
  rise(ctx, b, 90.25, 'you', x0 + w1, 200, serif)
  closest.forEach((slug, i) => {
    const at = 90.5 + i * 0.25
    const p = ramp(b, at, at + 0.55, outBack(1.4))
    if (b < at) return
    const float = Math.sin(b * 1.4 + i * 2) * 8
    s.fx.topPlanes.push({
      canvas: personCard(slug, i + 1),
      version: 1,
      mvp: planeMVP(
        s.W,
        s.H,
        {
          cx: 960 + (i - 1) * 610,
          cy: 612 + float + (1 - p) * 60,
          s: 1.16,
          w: CARD.w + CARD.pad * 2,
          h: CARD.h + CARD.pad * 2,
          ry: lerp(-1.5, 0, p) + Math.sin(b * 0.9 + i) * 0.05,
          rx: lerp(0.3, 0, p) + 0.03,
          rz: lerp(0.12, 0, p)
        },
        30
      ),
      alpha: clamp(ramp(b, at, at + 0.2) * 1)
    })
  })
  text(
    ctx,
    'Your closest simulated worldviews across capabilities, risks, upside, control and policy',
    960,
    990,
    {
      size: 28,
      weight: 500,
      color: C.muted,
      align: 'center',
      alpha: ramp(b, 92, 92.5)
    }
  )
  const fx = s.fx
  fx.bg = hexToRgb01(C.paper)
  fx.bloom = 0.04
  fx.vignette = 0.12
  fx.flash = 1 - ramp(b, 90, 90.3, outCubic)
  fx.flashColor = [0.984, 0.98, 0.965]
  fx.samples = b < 91.6 ? 24 : 8
}

// ── D4 · "Free / Open source / Private by default / No sign-up" ──────────────
export function drawFree(ctx: Ctx, s: S) {
  const b = s.b
  fill(ctx, C.ink, s.W, s.H)
  const lines: [number, string, string][] = [
    [94, 'Free', C.lime],
    [95, 'Open source', C.mint],
    [96, 'Private by default', C.peach],
    [97, 'No sign-up', C.violet]
  ]
  const st: TextStyle = {
    size: 150,
    weight: 900,
    tracking: -0.05,
    wordSpacing: 0.12,
    color: C.paper
  }
  const sh = lines.reduce(
    (acc, [at]) => {
      const k = shake(b, at, 10, 0.25)
      return { x: acc.x + k.x, y: acc.y + k.y }
    },
    { x: 0, y: 0 }
  )
  ctx.save()
  ctx.translate(sh.x, sh.y)
  const maxW = Math.max(...lines.map(([, str]) => measure(ctx, str, st)))
  const bx = (s.W - maxW) / 2 + 40
  lines.forEach(([at, str, col], i) => {
    if (b < at) return
    const p = ramp(b, at, at + 0.28, outExpo)
    const y = 300 + i * 175
    const x = bx + (1 - p) * 420
    circle(ctx, bx - 80, y - 52, 22 * outBack(2.5)(clamp(p * 1.4)), col)
    text(ctx, str, x, y, {
      ...st,
      color:
        i === lines.findIndex(([a]) => b >= a && b < a + 1) ? col : C.paper,
      alpha: clamp(p * 2)
    })
  })
  ctx.restore()
  const fx = s.fx
  fx.bg = hexToRgb01(C.ink)
  fx.bloom = 0.22
  fx.bloomThreshold = 0.72
  fx.vignette = 0.36
  fx.ca = 0.8 + lines.reduce((acc, [at]) => acc + 7 * hit(b, at, 0.25), 0)
  fx.samples = 20
}

// ── D5–D8 · the map as a world: "The future is being decided right now" ──
const FLOOR = { w: 1300, h: 620 }
const FLOOR_GEOM: MapGeom = { x: 0, y: 0, w: FLOOR.w, h: FLOOR.h, d: 58 }
let floorCanvas: HTMLCanvasElement | null = null
const floorTexture = () => {
  if (floorCanvas) return floorCanvas
  const k = 2
  floorCanvas = document.createElement('canvas')
  floorCanvas.width = FLOOR.w * k
  floorCanvas.height = FLOOR.h * k
  const c = floorCanvas.getContext('2d')!
  c.scale(k, k)
  prismField(c, 0, 0, FLOOR.w, FLOOR.h, 16)
  c.strokeStyle = 'rgba(37,57,43,0.12)'
  c.lineWidth = 1.2
  for (let i = 1; i < 10; i++) {
    c.beginPath()
    c.moveTo((FLOOR.w * i) / 10, 0)
    c.lineTo((FLOOR.w * i) / 10, FLOOR.h)
    c.moveTo(0, (FLOOR.h * i) / 10)
    c.lineTo(FLOOR.w, (FLOOR.h * i) / 10)
    c.stroke()
  }
  c.strokeStyle = 'rgba(37,57,43,0.35)'
  c.lineWidth = 2.5
  c.beginPath()
  c.moveTo(0, FLOOR.h / 2)
  c.lineTo(FLOOR.w, FLOOR.h / 2)
  c.moveTo(FLOOR.w / 2, 0)
  c.lineTo(FLOOR.w / 2, FLOOR.h)
  c.stroke()
  const lab: TextStyle = {
    size: 64,
    weight: 900,
    tracking: -0.03,
    color: 'rgba(14,14,12,0.28)'
  }
  text(c, 'DOOM', 36, FLOOR.h / 2 - 22, lab)
  text(c, 'BLOOM', FLOOR.w - 36, FLOOR.h / 2 - 22, { ...lab, align: 'right' })
  text(c, 'CIVILIZATIONAL CHANGE', FLOOR.w / 2 + 26, 58, {
    ...lab,
    size: 30,
    tracking: 0.04
  })
  text(c, 'INCREMENTAL CHANGE', FLOOR.w / 2 + 26, FLOOR.h - 30, {
    ...lab,
    size: 30,
    tracking: 0.04
  })
  return floorCanvas
}

const FOV = (34 * Math.PI) / 180

/** Camera over the map-world for a beat position. */
export const worldCam = (s: S, b: number) => {
  const youX = you.x * FLOOR.w - FLOOR.w / 2
  const youZ = (1 - you.y) * FLOOR.h - FLOOR.h / 2
  // Orbit, dip toward "you", then rise to a top-down view.
  const az =
    lerp(-0.42, 0.12, ramp(b, 98, 110, inOutCubic)) *
    (1 - ramp(b, 110, 111.4, inOutCubic))
  const swoop =
    ramp(b, 105.5, 108, inOutCubic) * (1 - ramp(b, 109.6, 111, inOutCubic))
  const up = ramp(b, 109.8, 111.4, inOutQuart)
  const elev = lerp(lerp(0.52, 0.4, ramp(b, 98, 106, inOutCubic)), 0.34, swoop)
  const el = lerp(elev, Math.PI / 2 - 0.004, up)
  const dist =
    lerp(lerp(1500, 1180, ramp(b, 98, 105.5, inOutCubic)), 760, swoop) *
    lerp(1, 1.9, up)
  const tx = lerp(0, youX, swoop)
  const tz = lerp(0, youZ, swoop)
  const ty = lerp(lerp(190, 70, swoop), 0, up)
  const eye: [number, number, number] = [
    tx + dist * Math.cos(el) * Math.sin(az),
    ty + dist * Math.sin(el),
    tz + dist * Math.cos(el) * Math.cos(az)
  ]
  const upv: [number, number, number] = [
    Math.sin(az) * -up,
    1 - up,
    Math.cos(az) * -up
  ]
  const V = lookAt(eye, [tx, ty, tz], upv)
  const P = perspective(FOV, s.W / s.H, 10, 30000)
  return chain(P, V)
}

/** Floor model: unit quad → map rectangle on the y = 0 plane (top of texture = far). */
const floorModel = (): M4 => {
  const m = new Float32Array(16)
  m[0] = FLOOR.w
  m[6] = -FLOOR.h
  m[9] = 1
  m[12] = -FLOOR.w / 2
  m[14] = FLOOR.h / 2
  m[15] = 1
  return m
}

const worldOf = (px: number, py: number) => ({
  x: px - FLOOR.w / 2,
  z: py - FLOOR.h / 2
})

export function drawFuture(ctx: Ctx, s: S) {
  const b = s.b
  const PV = worldCam(s, b)
  const f = s.H / 2 / Math.tan(FOV / 2)
  s.fx.bg = [0.043, 0.043, 0.037]
  s.fx.planes.push({
    canvas: floorTexture(),
    version: 1,
    mvp: chain(PV, floorModel()),
    alpha: 0.25 + 0.75 * ramp(b, 98, 98.18)
  })

  // Ground glow drawn behind everything else on the 2D layer is not possible
  // (the floor is a plane below it), so glows sit above, faintly, as light.
  const pos = mapPositions(FLOOR_GEOM)
  const kick = kickAt(s.t)
  const H0 = 74
  const items = pos.map((p) => {
    const w = worldOf(p.x, p.y)
    const top = project(PV, s.W, s.H, w.x, H0, w.z)
    const base = project(PV, s.W, s.H, w.x, 0, w.z)
    return { p, top, base, depth: top.w }
  })
  items.sort((a, b2) => b2.depth - a.depth)
  const rise2 = (i: number) =>
    ramp(
      b,
      98 + (i % 11) * 0.04 + Math.floor(i / 11) * 0.06,
      98.9 + (i % 11) * 0.04,
      outBack(1.6)
    )
  for (const it of items) {
    if (it.depth <= 0) continue
    const sc = f / it.depth
    const r = rise2(it.p.i)
    // Shadow and stem.
    ctx.save()
    ctx.globalAlpha = 0.35 * r
    ctx.fillStyle = '#000'
    ctx.beginPath()
    ctx.ellipse(it.base.x, it.base.y, 26 * sc, 9 * sc, 0, 0, Math.PI * 2)
    ctx.fill()
    ctx.restore()
    const ty =
      lerp(it.base.y, it.top.y, r) -
      kick * 5 * sc * (0.5 + 0.5 * Math.sin(it.p.i * 2.1))
    ctx.save()
    ctx.strokeStyle = rgba(C.paper, 0.55 * r)
    ctx.lineWidth = Math.max(1, 2.2 * sc)
    ctx.beginPath()
    ctx.moveTo(it.base.x, it.base.y)
    ctx.lineTo(it.top.x, ty)
    ctx.stroke()
    ctx.restore()
    const hi = closest.includes(it.p.slug) ? ramp(b, 107.4, 108) : 0
    portrait(ctx, face(it.p.slug), it.top.x, ty, 58 * sc * (1 + hi * 0.3), {
      ring: 3 * sc,
      ringColor: hi > 0.5 ? C.lime : C.paper,
      shadow: 10 * sc,
      alpha: clamp(r * 2)
    })
  }

  // You: a glowing dot drops onto the floor and ripples.
  const youW = worldOf(you.x * FLOOR.w, (1 - you.y) * FLOOR.h)
  const drop = ramp(b, 106.25, 106.9, inQuad)
  if (drop > 0) {
    const h = lerp(900, 26, drop)
    const pt = project(PV, s.W, s.H, youW.x, h, youW.z)
    const sc = f / pt.w
    for (let k = 0; k < 3; k++) {
      const rp = ramp(b, 106.9 + k * 0.2, 108.2 + k * 0.2, outCubic)
      if (rp <= 0 || rp >= 1) continue
      ctx.save()
      ctx.globalAlpha = (1 - rp) * 0.9
      ctx.strokeStyle = k === 1 ? C.lime : C.paper
      ctx.lineWidth = 3
      ctx.beginPath()
      for (let a = 0; a <= 48; a++) {
        const ang = (a / 48) * Math.PI * 2
        const rr = 30 + rp * 260
        const q = project(
          PV,
          s.W,
          s.H,
          youW.x + Math.cos(ang) * rr,
          0,
          youW.z + Math.sin(ang) * rr
        )
        if (a === 0) ctx.moveTo(q.x, q.y)
        else ctx.lineTo(q.x, q.y)
      }
      ctx.stroke()
      ctx.restore()
    }
    softGlow(ctx, pt.x, pt.y, 160 * sc, C.lime, 0.45)
    softGlow(ctx, pt.x, pt.y, 70 * sc, C.paper, 0.8)
    circle(ctx, pt.x, pt.y, 34 * sc, C.paper)
    circle(ctx, pt.x, pt.y, 22 * sc, C.ink)
    circle(ctx, pt.x, pt.y, 12 * sc, C.paper)
    // "You" label.
    const la = ramp(b, 106.95, 107.3, outBack(2))
    if (la > 0) {
      ctx.save()
      ctx.translate(pt.x, pt.y - 76 * sc)
      ctx.scale(la, la)
      const lw = measure(ctx, 'You', { size: 34, weight: 750 as number }) + 40
      rrect(ctx, -lw / 2, -27, lw, 54, 27, C.paper)
      text(ctx, 'You', 0, 12, {
        size: 34,
        weight: 750 as number,
        color: C.ink,
        align: 'center'
      })
      ctx.restore()
    }
    // Lines of kinship to the closest worldviews.
    const lk = ramp(b, 107.4, 108)
    if (lk > 0)
      closest.forEach((slug) => {
        const it = items.find((q) => q.p.slug === slug)!
        ctx.save()
        ctx.strokeStyle = rgba(C.lime, 0.8 * lk)
        ctx.lineWidth = 2.5
        ctx.setLineDash([3, 8])
        ctx.beginPath()
        ctx.moveTo(pt.x, pt.y)
        ctx.lineTo(lerp(pt.x, it.top.x, lk), lerp(pt.y, it.top.y, lk))
        ctx.stroke()
        ctx.restore()
      })
  }

  // Copy in the sky above the map, over a darkening sky gradient.
  const fadeAll = 1 - ramp(b, 109.7, 110.3)
  const sky = ctx.createLinearGradient(0, 0, 0, 620)
  sky.addColorStop(0, 'rgba(11,11,9,0.85)')
  sky.addColorStop(1, 'rgba(11,11,9,0)')
  ctx.fillStyle = sky
  ctx.globalAlpha = fadeAll
  ctx.fillRect(0, 0, s.W, 620)
  ctx.globalAlpha = 1
  ctx.save()
  ctx.globalAlpha = fadeAll * (1 - ramp(b, 105.6, 106))
  const st: TextStyle = {
    size: 104,
    weight: 800,
    tracking: -0.045,
    color: C.paper
  }
  rise(ctx, b, 98.25, 'The future is', 120, 200, st)
  rise(ctx, b, 99, 'being decided', 120, 318, st)
  if (b >= 102) {
    const p = ramp(b, 102, 102.3, outExpo)
    const k =
      lerp(1.35, 1, p) *
      (1 + 0.04 * (hit(b, 103, 0.3) + hit(b, 104, 0.3) + hit(b, 105, 0.3)))
    ctx.save()
    ctx.translate(120, 470)
    ctx.scale(k, k)
    const g = prismGradient(ctx, 0, 0, 760, 0)
    text(ctx, 'right now', 0, 0, {
      size: 170,
      weight: 900,
      tracking: -0.05,
      color: g,
      alpha: clamp(p * 2)
    })
    ctx.restore()
  }
  ctx.restore()
  if (b >= 106) {
    ctx.save()
    ctx.globalAlpha = fadeAll
    const a: TextStyle = {
      size: 112,
      weight: 800,
      tracking: -0.045,
      color: C.paper
    }
    const sr: TextStyle = {
      family: 'serif',
      italic: true,
      size: 136,
      weight: 400,
      color: prismGradient(ctx, 700, 0, 1000, 0)
    }
    const w1 = measure(ctx, 'So where do ', a)
    const w2 = measure(ctx, 'you', sr)
    const w3 = measure(ctx, ' land?', a)
    const x0 = 960 - (w1 + w2 + w3) / 2
    rise(ctx, b, 106, 'So where do', x0, 190, a)
    rise(ctx, b, 106.5, 'you', x0 + w1, 190, sr)
    rise(ctx, b, 107, 'land?', x0 + w1 + w2 + measure(ctx, ' ', a), 190, a)
    ctx.restore()
  }

  const fx = s.fx
  fx.bloom = 0.28
  fx.bloomThreshold = 0.62
  fx.vignette = 0.42
  fx.ca = 0.9 + 6 * hit(b, 102, 0.3) + 6 * hit(b, 106.9, 0.3)
  fx.samples = b > 109.7 ? 24 : 14
}

// ── D8 → END · the map folds back into the logo; the final lockup slams ────
export function drawEnd(ctx: Ctx, s: S) {
  const b = s.b
  fill(ctx, C.ink, s.W, s.H)
  const sh = shake(b, 114, 20, 0.4)
  ctx.save()
  ctx.translate(sh.x, sh.y)
  // Where the top-down map sits on screen when the 3D shot hands over.
  const PV = worldCam(s, 111.4)
  const tl = project(PV, s.W, s.H, -FLOOR.w / 2, 0, -FLOOR.h / 2)
  const br = project(PV, s.W, s.H, FLOOR.w / 2, 0, FLOOR.h / 2)
  const r0 = {
    x: Math.min(tl.x, br.x),
    y: Math.min(tl.y, br.y),
    w: Math.abs(br.x - tl.x),
    h: Math.abs(br.y - tl.y)
  }
  const m = ramp(b, 111.4, 112.6, inOutCubic)
  const slamT = 114
  const settle = ramp(b, slamT, slamT + 0.5, outBack(1.8))
  const final = { x: 960, y: 300, r: 146 }
  // Riser: the coin spins faster and faster, then lands on the downbeat.
  const spinPhase = b < slamT ? Math.pow(ramp(b, 112.3, slamT), 2.2) * 26 : 0
  const cy = lerp(r0.y + r0.h / 2, 520, m)
  const cx = lerp(r0.x + r0.w / 2, 960, m)
  const gather = ramp(b, 113, slamT, inCubic)
  const baseR = lerp(Math.min(r0.w, r0.h) / 2, 150, m) * (1 - gather * 0.35)
  const lx = b < slamT ? cx : lerp(960, final.x, settle)
  const ly =
    b < slamT ? cy : lerp(520, final.y, ramp(b, slamT, slamT + 0.45, outCubic))
  const lr = b < slamT ? baseR : final.r * lerp(0.6, 1, settle)

  // Glow behind the logo, breathing on the hold.
  const glow =
    b < slamT
      ? 0.12 + gather * 0.2 + 0.1 * kickAt(s.t)
      : (0.42 + 0.22 * levelAt(s.t)) * (1 - 0.1 * Math.sin((b - slamT) * 2))
  softGlow(ctx, lx - lr * 2.2, ly + lr * 0.2, lr * 4.2, C.coral, glow * 0.34)
  softGlow(ctx, lx + lr * 2.2, ly + lr * 0.2, lr * 4.2, C.mint, glow * 0.3)
  softGlow(ctx, lx, ly + lr * 3.4, lr * 5.5, C.violet, glow * 0.16)

  if (m < 1) {
    // The map rectangle collapses into a disc; faces fall into it.
    const w = lerp(r0.w, baseR * 2, m)
    const h = lerp(r0.h, baseR * 2, m)
    prismField(ctx, cx - w / 2, cy - h / 2, w, h, lerp(12, baseR, m), {
      alpha: 1 - ramp(m, 0.5, 1)
    })
    const pos = mapPositions(FLOOR_GEOM)
    for (const p of pos) {
      const px = r0.x + (p.x / FLOOR.w) * r0.w
      const py = r0.y + (p.y / FLOOR.h) * r0.h
      const k = ramp(m, 0, 0.8, inCubic)
      portrait(
        ctx,
        face(p.slug),
        lerp(px, cx, k),
        lerp(py, cy, k),
        58 * (r0.w / FLOOR.w) * (1 - k * 0.8),
        {
          ring: 2,
          alpha: 1 - k
        }
      )
    }
  }
  // The Eclipse, as a coin flipping between doom and bloom.
  const coin = Math.cos(spinPhase * Math.PI)
  const showBack = coin < 0
  ctx.save()
  ctx.translate(lx, ly)
  ctx.scale(Math.max(0.02, Math.abs(coin)), 1)
  if (showBack) ctx.scale(-1, 1)
  eclipse(ctx, 0, 0, lr, {
    alpha: ramp(m, 0.45, 0.9) || (b >= slamT ? 1 : 0),
    lensColor: '#f7f5ef'
  })
  ctx.restore()

  // Converging rings on the dropout.
  if (gather > 0 && b < slamT) {
    for (let i = 0; i < 3; i++) {
      ctx.save()
      ctx.globalAlpha = gather * 0.7
      ctx.strokeStyle = [C.coral, C.lime, C.mint][i]!
      ctx.lineWidth = 3
      ctx.beginPath()
      ctx.arc(lx, ly, lerp(900 - i * 150, lr * 1.25, gather), 0, Math.PI * 2)
      ctx.stroke()
      ctx.restore()
    }
  }
  // Shockwave on the slam.
  for (let i = 0; i < 2; i++) {
    const p = ramp(b, slamT + i * 0.1, slamT + 1.2 + i * 0.1, outQuart)
    if (p <= 0 || p >= 1) continue
    ctx.save()
    ctx.globalAlpha = (1 - p) * 0.8
    ctx.lineWidth = lerp(20, 1, p)
    ctx.strokeStyle = i ? C.mint : C.coral
    ctx.beginPath()
    ctx.arc(final.x, final.y, lerp(60, 1300, p), 0, Math.PI * 2)
    ctx.stroke()
    ctx.restore()
  }

  // The lockup.
  if (b >= slamT) {
    wordmark(ctx, 960, 620, 150, C.paper, {
      align: 'center',
      reveal: ramp(b, slamT + 0.05, slamT + 0.55)
    })
    const tag: TextStyle = {
      size: 54,
      weight: 500,
      tracking: -0.02,
      color: '#b8b7ad'
    }
    const tw = measure(ctx, 'Map your AI worldview', tag)
    rise(
      ctx,
      b,
      slamT + 0.3,
      'Map your AI worldview',
      960 - tw / 2,
      712,
      tag,
      0.4
    )
    // URL pill in the Prism gradient, with a light sweep.
    const pp = ramp(b, slamT + 0.5, slamT + 0.9, outBack(1.8))
    if (pp > 0) {
      const url: TextStyle = {
        size: 52,
        weight: 750 as number,
        tracking: -0.02,
        color: C.ink
      }
      const uw = measure(ctx, 'doom-or-bloom.com', url)
      const pw = uw + 110
      const ph = 100
      ctx.save()
      ctx.translate(960, 836)
      ctx.scale(pp, pp)
      ctx.shadowBlur = 40
      ctx.shadowColor = rgba(C.lime, 0.35)
      rrect(
        ctx,
        -pw / 2,
        -ph / 2,
        pw,
        ph,
        ph / 2,
        prismGradient(ctx, -pw / 2, 0, pw / 2, 0)
      )
      ctx.shadowColor = 'transparent'
      const sweep = ramp(b, slamT + 1.4, slamT + 2.6, inOutCubic)
      if (sweep > 0 && sweep < 1) {
        ctx.save()
        ctx.beginPath()
        ctx.roundRect(-pw / 2, -ph / 2, pw, ph, ph / 2)
        ctx.clip()
        const sx = lerp(-pw, pw, sweep)
        const g = ctx.createLinearGradient(sx - 120, 0, sx + 120, 0)
        g.addColorStop(0, 'rgba(255,255,255,0)')
        g.addColorStop(0.5, 'rgba(255,255,255,0.65)')
        g.addColorStop(1, 'rgba(255,255,255,0)')
        ctx.fillStyle = g
        ctx.fillRect(-pw / 2, -ph / 2, pw, ph)
        ctx.restore()
      }
      text(ctx, 'doom-or-bloom.com', 0, 18, { ...url, align: 'center' })
      ctx.restore()
    }
    text(ctx, 'FREE  ·  OPEN SOURCE  ·  NO SIGN-UP', 960, 960, {
      family: 'mono',
      size: 22,
      weight: 500,
      tracking: 0.08,
      color: '#8d8c84',
      align: 'center',
      alpha: ramp(b, slamT + 0.8, slamT + 1.3)
    })
  }

  ctx.restore()

  const fx = s.fx
  fx.bg = hexToRgb01(C.ink)
  fx.bloom = b >= slamT ? lerp(0.3, 0.12, ramp(b, slamT, slamT + 1.2)) : 0.22
  fx.bloomThreshold =
    b >= slamT ? lerp(0.62, 0.86, ramp(b, slamT, slamT + 1.2)) : 0.62
  fx.vignette = 0.42
  fx.ca = 0.8 + gather * 5 + 12 * hit(b, slamT, 0.4)
  fx.flash = 0.85 * hit(b, slamT, 0.25)
  fx.flashColor = [1, 0.99, 0.96]
  fx.samples = b < slamT + 0.8 ? 32 : 8
}
