// Act 2 · the product (beats 50–82: the drop, the map, the interview, results).
import { face } from '../engine/assets'
import {
  circle,
  fill,
  measure,
  portrait,
  prismAt,
  prismField,
  prismGradient,
  rgba,
  rrect,
  text,
  type Ctx,
  type TextStyle
} from '../engine/draw'
import {
  bezier,
  clamp,
  hit,
  inCubic,
  inOutCubic,
  inOutQuad,
  inQuad,
  lerp,
  outBack,
  outCubic,
  outExpo,
  outQuart,
  rand,
  randRange,
  ramp,
  shake
} from '../engine/ease'
import { planeMVP, type PlanePose } from '../engine/mat4'
import { C } from '../engine/theme'
import { MAP, mapPositions } from '../data/layout'
import { personas } from '../data/personas'
import {
  closest,
  dimensions,
  followUps,
  rootQuestion,
  sampleAnswer,
  tour,
  you
} from '../data/story'
import { kickAt } from '../data/envelope'
import {
  applyCamera,
  hexToRgb01,
  overlayLayer,
  type Camera,
  type S
} from './common'
import {
  cursor,
  drawMap,
  eclipse,
  namePill,
  softGlow,
  wordmark,
  wrap
} from './brand'

const LOGO = { x: 960, y: 395, r: 150 }

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

// ── C1 · the drop: the dot becomes the Eclipse; the Eclipse becomes the map ──
export function drawDrop(ctx: Ctx, s: S) {
  const b = s.b
  fill(ctx, C.paper, s.W, s.H)
  const m = ramp(b, 53.35, 54, inOutCubic)
  const wout = ramp(b, 52.95, 53.45, inOutCubic)
  const sh = shake(b, 50, 22, 0.4)
  ctx.save()
  applyCamera(ctx, s, {
    x: 960,
    y: 540,
    zoom: 1 + 0.03 * hit(b, 50, 0.6),
    ox: sh.x,
    oy: sh.y,
    rot: sh.r
  })

  // Soft Prism glow blooming behind the logo.
  const glowA = ramp(b, 50, 50.6, outCubic) * (1 - m)
  softGlow(ctx, LOGO.x - 120, LOGO.y + 40, 620, C.peach, 0.5 * glowA)
  softGlow(ctx, LOGO.x + 140, LOGO.y + 20, 560, C.mint, 0.45 * glowA)
  softGlow(ctx, LOGO.x, LOGO.y + 120, 520, C.lime, 0.35 * glowA)

  // Shockwave rings.
  for (let i = 0; i < 3; i++) {
    const at = 50 + i * 0.12
    const p = ramp(b, at, at + 1.1, outQuart)
    if (p <= 0 || p >= 1) continue
    ctx.save()
    ctx.globalAlpha = (1 - p) * 0.9
    ctx.lineWidth = lerp(26, 1, p)
    ctx.strokeStyle = i === 1 ? C.lime : i === 2 ? C.mint : C.coral
    ctx.beginPath()
    ctx.arc(LOGO.x, LOGO.y, lerp(40, 1300, p), 0, Math.PI * 2)
    ctx.stroke()
    ctx.restore()
  }
  // Confetti burst of Prism dots.
  for (let i = 0; i < 46; i++) {
    const p = ramp(b, 50, 51.4, outQuart)
    if (p <= 0 || p >= 1) continue
    const ang = randRange(i * 1.9, 0, Math.PI * 2)
    const dist = randRange(i * 4.1, 220, 900) * p
    const x = LOGO.x + Math.cos(ang) * dist * 1.4
    const y = LOGO.y + Math.sin(ang) * dist + p * p * 120
    circle(
      ctx,
      x,
      y,
      randRange(i * 7.3, 5, 14) * (1 - p * 0.7),
      prismAt(rand(i * 3.7))
    )
  }

  // The Eclipse assembles: coral disc, mint half opens like a door, lens opens like an eye.
  const pop = ramp(b, 50, 50.35, outBack(2.2))
  const pulse =
    1 + 0.045 * (hit(b, 52, 0.4) + hit(b, 53, 0.35) + hit(b, 53.25, 0.3) * 0.6)
  const r = LOGO.r * pop * pulse
  const lx = lerp(LOGO.x, MAP.x + MAP.w / 2, m)
  const ly = lerp(LOGO.y, MAP.y + MAP.h / 2, m)
  if (m < 1) {
    // Morph: the circle stretches into the map's rounded rectangle.
    const w = lerp(r * 2, MAP.w, m)
    const h = lerp(r * 2, MAP.h, m)
    const rad = lerp(r, 14, m)
    if (m > 0) {
      prismField(ctx, lx - w / 2, ly - h / 2, w, h, rad, {
        alpha: ramp(m, 0, 0.35)
      })
    }
    const lr = r * lerp(1, 0.9, m)
    eclipse(ctx, lx, ly, lr, {
      mint: ramp(b, 50.12, 50.45, outExpo),
      lens: ramp(b, 50.35, 50.8, outBack(2.4)),
      alpha: 1 - ramp(m, 0.05, 0.5),
      lensColor: C.paper
    })
  } else {
    prismField(ctx, MAP.x, MAP.y, MAP.w, MAP.h, 14)
  }

  // Wordmark and tagline.
  ctx.save()
  ctx.globalAlpha = 1 - wout
  ctx.translate(0, wout * 140)
  wordmark(ctx, 960, 710, 150, C.ink, {
    align: 'center',
    reveal: ramp(b, 50.45, 51.3)
  })
  const tag: TextStyle = {
    size: 58,
    weight: 500,
    tracking: -0.02,
    color: C.muted
  }
  const tw = measure(ctx, 'Map your AI worldview', tag)
  rise(ctx, b, 52, 'Map your AI worldview', 960 - tw / 2, 818, tag, 0.4)
  ctx.restore()
  ctx.restore()

  const fx = s.fx
  fx.bg = hexToRgb01(C.paper)
  fx.flash = 0.9 * (1 - ramp(b, 50, 50.3, outCubic))
  fx.flashColor = [1, 0.98, 0.95]
  fx.bloom = 0.05
  fx.vignette = 0.12
  fx.ca = 0.4 + 12 * hit(b, 50, 0.35)
  fx.samples = b < 50.6 ? 24 : m > 0 && m < 1 ? 20 : 10
}

// ── C2–C3 · the map: faces fly in, then a hover tour ────────────────────────
const tourCam = (b: number) => {
  const pos = mapPositions()
  const at = (slug: string) => pos.find((p) => p.slug === slug)!
  const stops = tour.map((slug, i) => ({ ...at(slug), k: 58 + i }))
  const wide = { x: 960, y: 540, zoom: 1 }
  if (b < 57.5)
    return { cam: wide, cur: null as null | { x: number; y: number }, stop: -1 }
  let cam = { ...wide }
  let cur = { x: 1500, y: 980 }
  let stop = -1
  for (let i = 0; i < stops.length; i++) {
    const st = stops[i]!
    const prevCam =
      i === 0 ? wide : { x: stops[i - 1]!.x, y: stops[i - 1]!.y, zoom: 1.85 }
    const prevCur =
      i === 0
        ? { x: 1500, y: 980 }
        : { x: stops[i - 1]!.x + 16, y: stops[i - 1]!.y + 20 }
    const pc = ramp(b, st.k - 0.5, st.k + 0.08, inOutCubic)
    const pu = ramp(b, st.k - 0.45, st.k - 0.06, inOutQuad)
    if (b >= st.k - 0.5) {
      cam = {
        x: lerp(prevCam.x, st.x, pc),
        y: lerp(prevCam.y, st.y + 30, pc),
        zoom: lerp(prevCam.zoom, 1.85, pc)
      }
      cur = {
        x: lerp(prevCur.x, st.x + 16, pu),
        y: lerp(prevCur.y, st.y + 20, pu)
      }
      if (b >= st.k) stop = i
    }
  }
  const out = ramp(b, 61.45, 62, inOutCubic)
  cam = {
    x: lerp(cam.x, 960, out),
    y: lerp(cam.y, 540, out),
    zoom: lerp(cam.zoom, 1, out)
  }
  return { cam, cur: out < 0.5 ? cur : null, stop: out > 0.3 ? -1 : stop }
}

export function drawMapScene(ctx: Ctx, s: S) {
  const b = s.b
  fill(ctx, C.paper, s.W, s.H)
  const { cam, cur, stop } = tourCam(b)
  const camera: Camera = { ...cam }
  ctx.save()
  applyCamera(ctx, s, camera)
  // Heading, like the landing page.
  const head: TextStyle = {
    size: 64,
    weight: 700,
    tracking: -0.035,
    color: C.ink
  }
  const hw = measure(ctx, 'How will AI change our future?', head)
  ctx.save()
  ctx.globalAlpha = 1 - ramp(b, 57.4, 57.8) + ramp(b, 61.6, 62)
  rise(
    ctx,
    b,
    54.25,
    'How will AI change our future?',
    960 - hw / 2,
    168,
    head,
    0.4
  )
  ctx.restore()

  // The field breathes with the bass line.
  const kick = kickAt(s.t)
  softGlow(
    ctx,
    MAP.x + MAP.w * 0.3,
    MAP.y + MAP.h * 0.5,
    700,
    C.peach,
    0.1 + 0.18 * kick
  )
  softGlow(
    ctx,
    MAP.x + MAP.w * 0.75,
    MAP.y + MAP.h * 0.45,
    700,
    C.mint,
    0.1 + 0.18 * kick
  )
  drawMap(ctx, { b, arrive: () => 0, labels: ramp(b, 54, 54.6) })
  // Faces fly in on curved paths, doom to bloom, and land with a spring.
  const pos = mapPositions()
  const cx = MAP.x + MAP.w / 2
  const cy = MAP.y + MAP.h / 2
  const hiSlug = stop >= 0 ? tour[stop]! : null
  const order = [...pos].sort(
    (a, b2) => Number(a.slug === hiSlug) - Number(b2.slug === hiSlug)
  )
  for (const p of order) {
    const at = 54 + p.i * 0.042
    const t = ramp(b, at, at + 0.62)
    if (t <= 0) continue
    const e = outCubic(t)
    const dx = p.x - cx
    const dy = p.y - cy
    const len = Math.hypot(dx, dy) || 1
    const ang = Math.atan2(dy, dx) + randRange(p.i * 2.3, -0.5, 0.5)
    const sx = cx + Math.cos(ang) * 1500
    const sy = cy + Math.sin(ang) * 1100
    const ctrlX = (sx + p.x) / 2 - (dy / len) * 260
    const ctrlY = (sy + p.y) / 2 + (dx / len) * 260
    const x = bezier(e, sx, ctrlX, ctrlX, p.x)
    const y = bezier(e, sy, ctrlY, ctrlY, p.y)
    const land =
      t >= 1
        ? 1 +
          0.18 * Math.exp(-(b - at - 0.62) * 8) * Math.cos((b - at - 0.62) * 30)
        : lerp(2.2, 1, e)
    const isHi = p.slug === hiSlug
    const dimA = hiSlug ? (isHi ? 1 : 0.28) : 1
    const hs = isHi
      ? 1 +
        0.3 *
          ramp(
            b,
            tour.indexOf(hiSlug!) + 58,
            tour.indexOf(hiSlug!) + 58.2,
            outBack(2)
          )
      : 1
    const bob = t >= 1 ? -4 * kick * (0.5 + 0.5 * Math.sin(p.i * 1.7)) : 0
    portrait(ctx, face(p.slug), x, y + bob, MAP.d, {
      scale: land * hs,
      shadow: 16,
      ring: 3.5,
      alpha: dimA
    })
  }
  // Name pill for the hovered face.
  if (stop >= 0) {
    const p = pos.find((q) => q.slug === tour[stop])!
    const name = personas.find((q) => q.slug === p.slug)!.name
    namePill(
      ctx,
      name,
      p.x,
      p.y + MAP.d * 0.95,
      ramp(b, 58 + stop, 58 + stop + 0.25)
    )
  }
  if (cur)
    cursor(
      ctx,
      cur.x,
      cur.y,
      (1 / camera.zoom) * 1.25,
      hit(b, stop >= 0 ? 58 + stop : -9, 0.2)
    )
  ctx.restore()

  // Honest footnote.
  text(
    ctx,
    'Simulated from public writing & interviews · not endorsements',
    960,
    1030,
    {
      family: 'mono',
      size: 19,
      weight: 500,
      color: C.muted,
      align: 'center',
      alpha: ramp(b, 55, 55.6) * (1 - ramp(b, 57.4, 57.8))
    }
  )

  const fx = s.fx
  fx.bg = hexToRgb01(C.paper)
  fx.bloom = 0.04
  fx.vignette = 0.12
  fx.ca = 0.4 + 3 * hit(b, 60, 0.3)
  fx.samples = b < 56.8 ? 24 : 16
}

// ── C4–C6 · the interview, as a floating card in perspective ───────────────
const CARD_W = 1000
const CARD_H = 900
const PAD = 70
let cardCanvas: HTMLCanvasElement | null = null
let cardVersion = 0

const drawCard = (c: Ctx, b: number) => {
  c.setTransform(1, 0, 0, 1, 0, 0)
  c.clearRect(0, 0, CARD_W + PAD * 2, CARD_H + PAD * 2)
  c.save()
  c.translate(PAD, PAD)
  c.shadowBlur = 60
  c.shadowColor = 'rgba(25, 30, 20, 0.28)'
  c.shadowOffsetY = 28
  rrect(c, 0, 0, CARD_W, CARD_H, 36, '#fdfcf9')
  c.shadowColor = 'transparent'
  rrect(c, 0, 0, CARD_W, CARD_H, 36, undefined, 'rgba(37,57,43,0.12)', 2)
  const X = 60
  text(c, 'Map your AI worldview', X, 110, {
    size: 46,
    weight: 800,
    tracking: -0.035,
    color: C.ink
  })
  const phase2 = b >= 70
  if (!phase2) {
    // Root question types in.
    const q = rootQuestion
    const n = Math.floor(q.length * ramp(b, 62.5, 63.9))
    const qst: TextStyle = {
      size: 44,
      weight: 700,
      tracking: -0.025,
      color: C.ink
    }
    const lines = wrap(c, q, CARD_W - 2 * X, qst)
    let shown = n
    lines.forEach((ln, i) => {
      const part = ln.slice(0, Math.max(0, shown))
      shown -= ln.length + 1
      text(c, part, X, 215 + i * 56, qst)
    })
    // Textarea.
    const ty = 350
    const th = 330
    const focus = ramp(b, 64, 64.3)
    rrect(
      c,
      X,
      ty,
      CARD_W - 2 * X,
      th,
      22,
      '#ffffff',
      focus > 0.5 ? 'rgba(14,14,12,0.55)' : '#e4e0d5',
      2.5
    )
    const ast: TextStyle = {
      size: 31,
      weight: 450 as number,
      tracking: -0.01,
      color: C.ink
    }
    const typed = Math.floor(sampleAnswer.length * ramp(b, 66.15, 69.2))
    if (typed === 0) {
      text(
        c,
        'A few sentences is plenty. Using speech-to-text is encouraged.',
        X + 30,
        ty + 56,
        {
          ...ast,
          color: '#9a978c',
          alpha: ramp(b, 63.9, 64.2)
        }
      )
    }
    const alines = wrap(c, sampleAnswer, CARD_W - 2 * X - 60, ast)
    let rem = typed
    let lastX = X + 30
    let lastY = ty + 56
    alines.forEach((ln, i) => {
      if (rem <= 0) return
      const part = ln.slice(0, rem)
      rem -= ln.length + 1
      const y = ty + 56 + i * 44
      text(c, part, X + 30, y, ast)
      lastX = X + 30 + measure(c, part, ast)
      lastY = y
    })
    if (b >= 64 && Math.floor(b * 2) % 2 === 0)
      c.fillRect(lastX + 3, lastY - 30, 3, 38)
    // Buttons.
    text(c, 'View my results', X + 24, 780, {
      size: 30,
      weight: 500,
      color: '#a09d93'
    })
    const press = hit(b, 69.8, 0.25)
    c.save()
    c.translate(CARD_W - X - 105, 768)
    c.scale(1 - press * 0.08, 1 - press * 0.08)
    rrect(c, -105, -38, 210, 76, 20, C.ink)
    text(c, 'Continue', 0, 11, {
      size: 30,
      weight: 600,
      color: C.paper,
      align: 'center'
    })
    c.restore()
    text(
      c,
      'Your answers stay private unless you choose to publish them.',
      X,
      866,
      {
        size: 23,
        weight: 450 as number,
        color: '#8f8c82'
      }
    )
  } else {
    // Follow-ups slide through; evidence readiness climbs.
    const qi = b < 71 ? 0 : b < 72 ? 1 : 2
    const labels = [
      '1 substantive answer · question 2',
      '2 substantive answers · question 3',
      '3 substantive answers · question 4'
    ]
    text(c, labels[qi]!, X, 190, { size: 25, weight: 500, color: '#8f8c82' })
    const qst: TextStyle = {
      size: 46,
      weight: 750 as number,
      tracking: -0.03,
      color: C.ink
    }
    c.save()
    c.beginPath()
    c.rect(X - 10, 215, CARD_W - 2 * X + 20, 250)
    c.clip()
    for (let i = 0; i < followUps.length; i++) {
      const at = 70 + i
      const pin = ramp(b, at, at + 0.38, outQuart)
      const pout = ramp(b, at + 1, at + 1.3, inOutCubic)
      if (pin <= 0 || pout >= 1) continue
      const off = (1 - pin) * 240 - pout * 240
      wrap(c, followUps[i]!, CARD_W - 2 * X, qst).forEach((ln, j) =>
        text(c, ln, X, 270 + j * 58 + off, {
          ...qst,
          alpha: clamp(pin * 1.5) * (1 - pout)
        })
      )
    }
    c.restore()
    rrect(c, X, 480, CARD_W - 2 * X, 150, 22, '#ffffff', '#e4e0d5', 2.5)
    if (Math.floor(b * 2) % 2 === 0) {
      c.fillStyle = C.ink
      c.fillRect(X + 30, 510, 3, 38)
    }
    // Readiness panel.
    const pr =
      lerp(0, 0.38, ramp(b, 70.1, 70.6, outCubic)) +
      0.19 * ramp(b, 71.1, 71.6, outCubic) +
      0.2 * ramp(b, 72.1, 72.6, outCubic)
    rrect(c, X, 668, CARD_W - 2 * X, 178, 26, '#ffffff', '#e4e0d5', 2.5)
    text(c, 'Evidence readiness', X + 34, 730, {
      size: 31,
      weight: 600,
      color: C.ink
    })
    text(c, `${Math.round(pr * 100)}%`, X + 340, 730, {
      family: 'mono',
      size: 30,
      weight: 500,
      color: '#6f6c63'
    })
    const bx = X + 34
    const bw = CARD_W - 2 * X - 68
    rrect(c, bx, 770, bw, 22, 11, '#ecebe6')
    rrect(c, bx, 770, bw * pr, 22, 11, C.ink)
    c.fillStyle = C.ink
    c.fillRect(bx + bw * 0.55, 760, 4, 42)
    const avail = ramp(b, 72.45, 72.7, outBack(2))
    if (avail > 0) {
      c.save()
      c.translate(CARD_W - X - 190, 722)
      c.scale(avail, avail)
      rrect(c, -170, -28, 340, 56, 28, '#efeee8')
      text(c, 'Your results are available', 0, 9, {
        size: 23,
        weight: 500,
        color: C.ink,
        align: 'center'
      })
      c.restore()
    }
    text(
      c,
      'View your results now, or keep answering to refine them.',
      bx,
      832,
      { size: 22, weight: 450 as number, color: '#8f8c82' }
    )
  }
  c.restore()
}

const captions: [number, string[], string][] = [
  [
    62,
    ['Just answer', 'simple', 'questions'],
    'No quizzes, no multiple choice'
  ],
  [66, ['In your', 'own words'], 'Type it, or just talk'],
  [70, ['It adapts', 'to you'], 'A few questions, a few minutes']
]

const chips: [number, string, string][] = [
  [70.25, 'timelines · this decade', C.lime],
  [70.6, 'control · uncertain', C.coral],
  [71.25, 'benefits · large', C.mint],
  [71.6, 'institutions · too slow', C.peach],
  [72.25, 'p(catastrophe) · low', C.violet]
]

export function drawInterview(ctx: Ctx, s: S) {
  const b = s.b
  fill(ctx, C.paper, s.W, s.H)
  // Subtle Prism wash behind the card.
  softGlow(ctx, 1320, 560, 760, C.peach, 0.28)
  softGlow(ctx, 1500, 380, 520, C.mint, 0.25)
  // Caption column.
  for (const [at, lines, sub] of captions) {
    const out = ramp(b, at + 3.75, at + 4, inOutCubic)
    if (b < at - 0.05 || out >= 1) continue
    ctx.save()
    ctx.globalAlpha = 1 - out
    ctx.translate(-out * 60, 0)
    // Fit the column beside the card, capped at the caption size.
    const base: TextStyle = {
      size: 112,
      weight: 800,
      tracking: -0.045,
      color: C.ink
    }
    const widest = Math.max(...lines.map((l) => measure(ctx, l, base)))
    const st: TextStyle = { ...base, size: 112 * Math.min(1, 590 / widest) }
    const lh = st.size * 1.07
    const y0 = 470 - ((lines.length - 2) * lh) / 2
    lines.forEach((l, i) =>
      rise(ctx, b, at + i * 0.25, l, 130, y0 + i * lh, st)
    )
    rise(ctx, b, at + 0.6, sub, 134, y0 + (lines.length - 1) * lh + 85, {
      size: 34,
      weight: 500,
      tracking: -0.01,
      color: C.muted
    })
    ctx.restore()
  }
  // The card, rendered offscreen and composited as a perspective plane.
  if (!cardCanvas) {
    cardCanvas = document.createElement('canvas')
    cardCanvas.width = CARD_W + PAD * 2
    cardCanvas.height = CARD_H + PAD * 2
  }
  drawCard(cardCanvas.getContext('2d')!, b)
  cardVersion++
  const enter = ramp(b, 62, 62.7, outQuart)
  const exit = ramp(b, 73.4, 74, inCubic)
  const pose: PlanePose = {
    cx: 1265 + exit * 900,
    cy: lerp(1500, 548, enter) - exit * 80,
    w: (CARD_W + PAD * 2) * 0.97,
    h: (CARD_H + PAD * 2) * 0.97,
    ry: lerp(0.42, 0.2, enter) - 0.06 * ramp(b, 62.7, 73.4) + exit * 0.5,
    rx: lerp(-0.55, 0.05, enter) + 0.02 * Math.sin(b * 0.8),
    rz: lerp(0.08, -0.012, enter)
  }
  s.fx.topPlanes.push({
    canvas: cardCanvas,
    version: cardVersion,
    mvp: planeMVP(s.W, s.H, pose, 28),
    alpha: 1
  })

  // Judgment chips and the pointer float above the card on an overlay layer.
  const ov = overlayLayer(s)
  const o = ov.ctx
  for (const [at, label, col] of chips) {
    const p = ramp(b, at, at + 0.35, outBack(1.8))
    if (p <= 0) continue
    const i = chips.findIndex((c) => c[0] === at)
    const x = 134 + (1 - p) * -40
    const y = 770 + i * 60
    const w = measure(o, label, { family: 'mono', size: 24, weight: 500 }) + 70
    o.save()
    o.translate(x, y)
    o.scale(p, p)
    o.globalAlpha = clamp(p * 2) * (1 - ramp(b, 73.3, 73.8))
    o.shadowBlur = 22
    o.shadowColor = 'rgba(20,30,22,0.22)'
    o.shadowOffsetY = 7
    rrect(o, 0, -29, w, 58, 29, '#ffffff')
    o.shadowColor = 'transparent'
    circle(o, 30, 0, 10, col)
    text(o, label, 50, 8, {
      family: 'mono',
      size: 24,
      weight: 500,
      color: C.ink
    })
    o.restore()
  }
  if (b >= 69.2 && b < 70.15) {
    const p = ramp(b, 69.2, 69.75, inOutCubic)
    cursor(o, lerp(1780, 1612, p), lerp(1040, 868, p), 1.4, hit(b, 69.8, 0.2))
  }
  ov.commit()

  const fx = s.fx
  fx.bg = hexToRgb01(C.paper)
  fx.bloom = 0.04
  fx.vignette = 0.12
  fx.samples = b < 62.8 || b > 73.3 ? 24 : 8
}

// ── C7 · your dot lands ─────────────────────────────────────────────────────
export function drawYouLand(ctx: Ctx, s: S) {
  const b = s.b
  fill(ctx, C.paper, s.W, s.H)
  const tx = MAP.x + you.x * MAP.w
  const ty = MAP.y + (1 - you.y) * MAP.h
  const push = ramp(b, 74.2, 78, inOutCubic)
  const cam: Camera = {
    x: lerp(960, tx - 20, push * 0.7),
    y: lerp(540, ty + 60, push * 0.7),
    zoom: lerp(1, 1.28, push)
  }
  const sh = shake(b, 74.75, 10, 0.3)
  cam.ox = sh.x
  cam.oy = sh.y
  ctx.save()
  applyCamera(ctx, s, cam)
  const head: TextStyle = {
    size: 64,
    weight: 700,
    tracking: -0.035,
    color: C.ink
  }
  const hw = measure(ctx, 'Your worldview, mapped', head)
  rise(ctx, b, 74, 'Your worldview, mapped', 960 - hw / 2, 168, head, 0.4)
  drawMap(ctx, { b, arrive: () => 0 })
  // Faces, dimmed; the closest ones light up and connect to you.
  const pos = mapPositions()
  for (const p of pos) {
    const ci = closest.indexOf(p.slug)
    const on =
      ci >= 0 ? ramp(b, 76.5 + ci * 0.25, 76.8 + ci * 0.25, outBack(2)) : 0
    portrait(ctx, face(p.slug), p.x, p.y, MAP.d, {
      shadow: 12 + on * 14,
      ring: 3.5,
      ringColor: on > 0.05 ? C.ink : C.paper,
      alpha: 0.3 + 0.7 * clamp(on),
      scale: 1 + 0.42 * on
    })
  }
  // Uncertainty range: dashed box draws itself, hatch fades in.
  const x0 = MAP.x + you.rx[0] * MAP.w
  const x1 = MAP.x + you.rx[1] * MAP.w
  const y0 = MAP.y + (1 - you.ry[1]) * MAP.h
  const y1 = MAP.y + (1 - you.ry[0]) * MAP.h
  const box = ramp(b, 75, 75.9, inOutCubic)
  if (box > 0) {
    ctx.save()
    ctx.globalAlpha = 0.6 * ramp(b, 75.4, 76)
    ctx.beginPath()
    ctx.roundRect(x0, y0, x1 - x0, y1 - y0, 10)
    ctx.clip()
    ctx.strokeStyle = 'rgba(37,57,43,0.18)'
    ctx.lineWidth = 2
    for (let k = -800; k < 1200; k += 16) {
      ctx.beginPath()
      ctx.moveTo(x0 + k, y1)
      ctx.lineTo(x0 + k + (y1 - y0) * 0.7, y0)
      ctx.stroke()
    }
    ctx.restore()
    const per = 2 * (x1 - x0 + (y1 - y0))
    ctx.save()
    ctx.setLineDash([14, 10])
    ctx.lineDashOffset = 0
    ctx.strokeStyle = 'rgba(37,57,43,0.72)'
    ctx.lineWidth = 3.5
    ctx.beginPath()
    ctx.roundRect(x0, y0, x1 - x0, y1 - y0, 10)
    ctx.save()
    ctx.setLineDash([per * box, per])
    ctx.stroke()
    ctx.restore()
    ctx.restore()
  }
  // Lines to the closest worldviews.
  for (let ci = 0; ci < closest.length; ci++) {
    const p = pos.find((q) => q.slug === closest[ci])!
    const l = ramp(b, 76.5 + ci * 0.25, 76.9 + ci * 0.25, outCubic)
    if (l <= 0) continue
    ctx.save()
    ctx.strokeStyle = C.ink
    ctx.lineWidth = 2.5
    ctx.setLineDash([2, 7])
    ctx.lineCap = 'round'
    ctx.beginPath()
    ctx.moveTo(tx, ty)
    ctx.lineTo(lerp(tx, p.x, l), lerp(ty, p.y, l))
    ctx.stroke()
    ctx.restore()
  }
  // The dot drops in from above and lands with a ripple.
  const fall = ramp(b, 74.2, 74.75, inQuad)
  if (fall > 0) {
    const y = lerp(-120, ty, fall)
    for (let k = 0; k < 2; k++) {
      const rp = ramp(b, 74.75 + k * 0.15, 75.6 + k * 0.15, outCubic)
      if (rp > 0 && rp < 1) {
        ctx.save()
        ctx.globalAlpha = (1 - rp) * 0.7
        ctx.strokeStyle = C.ink
        ctx.lineWidth = 3
        ctx.beginPath()
        ctx.ellipse(tx, ty, 26 + rp * 170, 26 + rp * 120, 0, 0, Math.PI * 2)
        ctx.stroke()
        ctx.restore()
      }
    }
    const sq = 1 + 0.35 * hit(b, 74.75, 0.2)
    ctx.save()
    ctx.translate(tx, y)
    ctx.scale(sq, 1 / sq)
    circle(ctx, 0, 0, 44, rgba(C.coral, 0.28))
    circle(ctx, 0, 0, 26, '#ffffff')
    circle(ctx, 0, 0, 18, C.ink)
    ctx.restore()
  }
  namePill(ctx, 'Your view', tx, ty - 78, ramp(b, 76, 76.3), true)
  ctx.restore()

  const fx = s.fx
  fx.bg = hexToRgb01(C.paper)
  fx.bloom = 0.04
  fx.vignette = 0.14
  fx.ca = 0.4 + 5 * hit(b, 74.75, 0.3)
  fx.samples = b < 75 ? 24 : 10
}

// ── C8 · the riser: results fire in, the frame whites out ───────────────────
export function drawResults(ctx: Ctx, s: S) {
  const b = s.b
  fill(ctx, C.ink, s.W, s.H)
  const push = ramp(b, 78, 82, inCubic)
  ctx.save()
  applyCamera(ctx, s, {
    x: 960,
    y: 540,
    zoom: 1 + push * 0.22,
    rot: push * 0.02
  })
  softGlow(ctx, 960, 540, 900, C.violet, 0.12 + push * 0.1 + 0.12 * kickAt(s.t))

  // P(doom)
  const a1 = ramp(b, 78, 78.3, outExpo)
  if (a1 > 0) {
    ctx.save()
    ctx.globalAlpha = a1
    ctx.translate(0, (1 - a1) * 40)
    text(ctx, 'P(DOOM)', 330, 400, {
      family: 'mono',
      size: 28,
      weight: 700,
      color: C.coral,
      tracking: 0.06
    })
    const n = Math.round(12 * ramp(b, 78.05, 78.9, outCubic))
    text(ctx, `${n}%`, 322, 590, {
      size: 230,
      weight: 900,
      tracking: -0.05,
      color: C.paper
    })
    text(ctx, 'inferred from your answers', 330, 650, {
      size: 28,
      weight: 500,
      color: C.mutedDark
    })
    ctx.restore()
  }
  // Worldview fingerprint radar across eight dimensions.
  const a2 = ramp(b, 79, 79.3, outExpo)
  if (a2 > 0) {
    const cx = 1000
    const cy = 545
    const R = 250 * lerp(0.7, 1, a2)
    ctx.save()
    ctx.globalAlpha = a2
    ctx.strokeStyle = 'rgba(251,250,246,0.16)'
    ctx.lineWidth = 1.5
    for (let ring = 1; ring <= 4; ring++) {
      ctx.beginPath()
      for (let i = 0; i <= 8; i++) {
        const ang = (i / 8) * Math.PI * 2 - Math.PI / 2
        const rr = (R * ring) / 4
        const x = cx + Math.cos(ang) * rr
        const y = cy + Math.sin(ang) * rr
        if (i === 0) ctx.moveTo(x, y)
        else ctx.lineTo(x, y)
      }
      ctx.stroke()
    }
    const final = [0.82, 0.7, 0.86, 0.58, 0.45, 0.4, 0.66, 0.74]
    const settle = ramp(b, 79.1, 80.2, outCubic)
    ctx.beginPath()
    for (let i = 0; i <= 8; i++) {
      const k = i % 8
      const wob = 0.25 * Math.sin(b * 9 + k * 1.7) * (1 - settle)
      const v = clamp(final[k]! * settle + (1 - settle) * 0.5 + wob, 0.1, 1)
      const ang = (k / 8) * Math.PI * 2 - Math.PI / 2
      const x = cx + Math.cos(ang) * R * v
      const y = cy + Math.sin(ang) * R * v
      if (i === 0) ctx.moveTo(x, y)
      else ctx.lineTo(x, y)
    }
    ctx.fillStyle = prismGradient(ctx, cx - R, cy - R, cx + R, cy + R)
    ctx.globalAlpha = a2 * 0.85
    ctx.fill()
    ctx.globalAlpha = a2
    ctx.strokeStyle = C.paper
    ctx.lineWidth = 3
    ctx.stroke()
    dimensions.forEach((d, i) => {
      const ang = (i / 8) * Math.PI * 2 - Math.PI / 2
      text(
        ctx,
        d.toUpperCase(),
        cx + Math.cos(ang) * (R + 48),
        cy + Math.sin(ang) * (R + 40) + 8,
        {
          family: 'mono',
          size: 18,
          weight: 500,
          color: C.paper,
          align: 'center',
          alpha: 0.7 * a2
        }
      )
    })
    ctx.restore()
  }
  // Upside, harm, influence bars.
  const bars: [number, string, number, string][] = [
    [80, 'Expected upside', 0.84, C.mint],
    [80.25, 'Expected harm', 0.56, C.coral],
    [80.5, 'Human influence', 0.66, C.violet]
  ]
  bars.forEach(([at, label, v, col], i) => {
    const p = ramp(b, at, at + 0.3, outExpo)
    if (p <= 0) return
    const y = 420 + i * 110
    text(ctx, label, 1370, y, {
      size: 30,
      weight: 600,
      color: C.paper,
      alpha: p
    })
    rrect(ctx, 1370, y + 22, 380, 16, 8, 'rgba(251,250,246,0.12)')
    rrect(
      ctx,
      1370,
      y + 22,
      380 * v * ramp(b, at + 0.05, at + 0.6, outCubic),
      16,
      8,
      col
    )
  })
  ctx.restore()

  const fx = s.fx
  fx.bg = hexToRgb01(C.ink)
  fx.bloom = 0.25
  fx.bloomThreshold = 0.7
  fx.vignette = 0.35
  fx.ca = 1 + push * 8
  fx.zoomBlur = ramp(b, 81.2, 82, inCubic) * 0.2
  fx.flash = ramp(b, 81.45, 82, inCubic)
  fx.flashColor = [1, 0.99, 0.96]
  fx.samples = 14
}
