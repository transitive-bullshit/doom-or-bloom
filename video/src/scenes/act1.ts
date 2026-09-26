// Act 1 · the problem (beats 18–50, the horns-only phrase).
import { face } from '../engine/assets'
import {
  circle,
  fill,
  glyphs,
  measure,
  mixHex,
  portrait,
  prismAt,
  prismGradient,
  rgba,
  rrect,
  text,
  type Ctx
} from '../engine/draw'
import {
  clamp,
  hit,
  inCubic,
  inOutCubic,
  inOutQuart,
  inQuad,
  lerp,
  noise1,
  outBack,
  outCubic,
  outExpo,
  outQuart,
  rand,
  randRange,
  ramp,
  shake
} from '../engine/ease'
import { C } from '../engine/theme'
import { bloomSide, doomSide, everything, handles, takes } from '../data/story'
import { applyCamera, hexToRgb01, type S } from './common'
import { QDOT, questionHook } from './hook'

/** A word that rises into place from a mask, landing on beat `at`. */
const riseWord = (
  ctx: Ctx,
  b: number,
  at: number,
  str: string,
  x: number,
  y: number,
  style: Parameters<typeof text>[4],
  dur = 0.32
) => {
  if (b < at - 0.02) return 0
  const p = ramp(b, at - 0.02, at + dur, outExpo)
  const size = style.size
  ctx.save()
  ctx.beginPath()
  ctx.rect(x - size, y - size * 1.05, 99999, size * 1.35)
  ctx.clip()
  const w = text(ctx, str, x, y + (1 - p) * size * 1.05, style) ?? 0
  ctx.restore()
  return w
}

// ── B1 · "AI will change everything" → everything blooms ────────────────
export function drawStakes(ctx: Ctx, s: S) {
  const b = s.b
  fill(ctx, C.paper, s.W, s.H)
  const push = ramp(b, 18, 22, outCubic)
  const sh = shake(b, 21, 10, 0.3)
  ctx.save()
  applyCamera(ctx, s, {
    x: 960,
    y: 540,
    zoom: 1.0 + push * 0.06,
    ox: sh.x,
    oy: sh.y
  })

  const size = 170
  const st = { size, weight: 800, tracking: -0.045, color: C.ink }
  const headOut = ramp(b, 20.9, 21.12, inOutCubic)
  const line1W = measure(ctx, 'AI will change', st)
  let x = (s.W - line1W) / 2
  ctx.save()
  ctx.globalAlpha = 1 - headOut
  ctx.translate(0, -headOut * 140)
  for (const [at, w] of [
    [18, 'AI'],
    [18.5, 'will'],
    [19, 'change']
  ] as [number, string][]) {
    const k = 1 + 0.05 * hit(b, at, 0.25)
    ctx.save()
    ctx.translate(x, 470)
    ctx.scale(k, k)
    riseWord(ctx, b, at, w, 0, 0, st)
    ctx.restore()
    x += measure(ctx, w + ' ', st)
  }
  ctx.restore()

  // "everything" in the Prism gradient; it gathers, then bursts into a flower.
  const est = { ...st, size: 200, weight: 900 }
  const everyW = measure(ctx, 'everything', est)
  const ex = (s.W - everyW) / 2
  const ey = 690
  const gatherK = ramp(b, 20.7, 21, inQuad)
  if (b >= 19.98 && b < 21.08) {
    const k =
      (1 + 0.06 * hit(b, 20, 0.3)) *
      (1 + gatherK * 0.1) *
      (1 - ramp(b, 21, 21.08, inQuad) * 0.9)
    ctx.save()
    ctx.translate(s.W / 2, ey - 70)
    ctx.scale(k, k)
    ctx.translate(-s.W / 2, -(ey - 70))
    riseWord(ctx, b, 20, 'everything', ex, ey, {
      ...est,
      color: prismGradient(ctx, ex, 0, ex + everyW, 0)
    })
    ctx.restore()
  }
  if (b >= 21) {
    const cx = s.W / 2
    const cy = 560
    const spin = (b - 21) * 0.1
    const golden = Math.PI * (3 - Math.sqrt(5))
    const n = everything.length
    for (let i = 0; i < n; i++) {
      const word = everything[i]!
      const at = 21 + i * 0.011
      const p = ramp(b, at, at + 0.42, outBack(1.5))
      if (p <= 0) continue
      const ang = i * golden + spin
      const r = (74 + 60 * Math.sqrt(i + 1)) * p
      const px = cx + Math.cos(ang) * r * 1.28
      const py = cy + Math.sin(ang) * r
      const a = ((ang % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2)
      const flip = a > Math.PI / 2 && a < (Math.PI * 3) / 2
      const kind = i % 4
      const sz = 22 + 28 * (i / n)
      const color =
        kind === 1 ? C.ink : mixHex(prismAt(a / (Math.PI * 2)), C.ink, 0.38)
      ctx.save()
      ctx.translate(px, py)
      ctx.rotate(flip ? ang + Math.PI : ang)
      text(ctx, word, 0, 0, {
        family: kind === 2 ? 'mono' : kind === 3 ? 'serif' : 'sans',
        italic: kind === 3,
        size: kind === 3 ? sz * 1.15 : sz,
        weight: kind === 2 ? 500 : kind === 3 ? 400 : 800,
        tracking: kind === 2 ? 0.02 : -0.02,
        color,
        align: flip ? 'right' : 'left',
        baseline: 'middle',
        alpha: clamp(p * 1.5) * (1 - ramp(b, 21.9, 22))
      })
      ctx.restore()
    }
    // …including you.
    const yp = ramp(b, 21.45, 21.75, outBack(2))
    if (yp > 0) {
      ctx.save()
      ctx.translate(cx, cy)
      ctx.scale(yp, yp)
      text(ctx, 'you', 0, 0, {
        family: 'serif',
        italic: true,
        size: 96,
        weight: 400,
        color: C.ink,
        align: 'center',
        baseline: 'middle'
      })
      ctx.restore()
    }
  }
  ctx.restore()

  const fx = s.fx
  fx.bg = hexToRgb01(C.paper)
  fx.bloom = 0.05
  fx.vignette = 0.12
  fx.ca = 0.4 + 6 * hit(b, 21, 0.3)
  fx.samples = b > 20.95 && b < 21.5 ? 24 : 10
}

// ── B2 · "Years happen in weeks" ─────────────────────────────────────────
export function drawWeeks(ctx: Ctx, s: S) {
  const b = s.b
  fill(ctx, C.ink, s.W, s.H)
  const cols = 52
  const rows = 7
  const cell = 24
  const gap = 6
  const gw = cols * (cell + gap) - gap
  const gx = (s.W - gw) / 2
  const gy = 200
  // Four "years" sweep through the grid, each faster than the last.
  const sweeps: [number, number, string][] = [
    [22, 23, '2023'],
    [23, 23.85, '2024'],
    [24, 24.6, '2025'],
    [24.75, 25.15, '2026']
  ]
  let year = ''
  let level = 0
  for (const [a, e, y] of sweeps)
    if (b >= a) {
      year = y
      level = ramp(b, a, e, inOutCubic)
    }
  const done = b >= 25.15
  for (let c = 0; c < cols; c++) {
    for (let r = 0; r < rows; r++) {
      const i = c * rows + r
      const pos = (c + r * 0.35) / (cols + 2.1)
      // The most recent sweep whose front has passed this cell owns its color.
      let owner = -1
      for (let k = 0; k < sweeps.length; k++) {
        const [a, e] = sweeps[k]!
        if (b >= a && pos < ramp(b, a, e, inOutCubic)) owner = k
      }
      const x = gx + c * (cell + gap)
      const y = gy + r * (cell + gap)
      let col = '#23231f'
      if (owner >= 0) {
        const seed = rand(i * 1.7 + owner * 31)
        const t = clamp(c / cols + (owner - 1.5) * 0.08)
        col =
          seed < 0.14
            ? '#34342d'
            : mixHex('#2c2c27', prismAt(t), 0.3 + seed * 0.7)
      }
      const cur =
        sweeps.findIndex(([a]) => b >= a) >= 0
          ? sweeps.filter(([a]) => b >= a).length - 1
          : -1
      const edge = !done && cur >= 0 && Math.abs(pos - level) < 0.025
      rrect(ctx, x, y, cell, cell, 5, edge ? C.paper : col)
    }
  }
  // Year + week counters.
  if (year) {
    const wk = Math.min(52, Math.floor(level * 52) + 1)
    text(ctx, year, gx, gy - 34, {
      family: 'mono',
      size: 30,
      weight: 700,
      color: C.lime
    })
    text(
      ctx,
      `WEEK ${String(done ? 52 : wk).padStart(2, '0')} / 52`,
      gx + gw,
      gy - 34,
      {
        family: 'mono',
        size: 24,
        weight: 500,
        color: C.paper,
        align: 'right',
        alpha: 0.5
      }
    )
  }

  const size = 150
  const st = { size, weight: 800, tracking: -0.045, color: C.paper }
  const line1 = 'Years happen'
  const w1 = measure(ctx, line1 + ' in', st)
  const wWeeks = measure(ctx, 'weeks', {
    family: 'serif',
    italic: true,
    size: size * 1.18,
    weight: 400
  })
  const total = w1 + 34 + wWeeks
  const x0 = (s.W - total) / 2
  const y = 700
  let x = x0
  for (const [at, w] of [
    [22, 'Years'],
    [22.5, 'happen'],
    [23.5, 'in']
  ] as [number, string][]) {
    riseWord(ctx, b, at, w, x, y, st)
    x += measure(ctx, w + ' ', st)
  }
  // "weeks" squeezes in on the accent.
  if (b >= 23.98) {
    const p = ramp(b, 24, 24.35, outExpo)
    ctx.save()
    const k = lerp(1.6, 1, p)
    const sq = 1 + 0.18 * hit(b, 24.75, 0.3)
    ctx.translate(x + 4, y)
    ctx.scale(k / sq, k * (1 + (sq - 1) * 0.3))
    text(ctx, 'weeks', 0, 0, {
      family: 'serif',
      italic: true,
      size: size * 1.18,
      weight: 400,
      color: C.lime,
      alpha: clamp(p * 2)
    })
    ctx.restore()
  }
  text(
    ctx,
    'Every week: new models, new breakthroughs, new headlines',
    s.W / 2,
    860,
    {
      family: 'mono',
      size: 24,
      weight: 500,
      color: C.paper,
      align: 'center',
      alpha: 0.45 * ramp(b, 24.5, 25)
    }
  )

  const fx = s.fx
  fx.bg = hexToRgb01(C.ink)
  fx.bloom = 0.22
  fx.bloomThreshold = 0.62
  fx.vignette = 0.3
  fx.ca = 0.6 + 5 * hit(b, 24, 0.3) + 4 * hit(b, 24.75, 0.25)
  fx.samples = 10
}

// ── B3 · "Some see doom / Some see bloom" ─────────────────────────────────
const panel = (
  ctx: Ctx,
  s: S,
  b: number,
  at: number,
  x: number,
  w: number,
  bg: string,
  word: string,
  slugs: string[]
) => {
  ctx.save()
  ctx.beginPath()
  ctx.rect(x, 0, w, s.H)
  ctx.clip()
  ctx.fillStyle = bg
  ctx.fillRect(x, 0, w, s.H)
  const cx = x + w / 2
  text(ctx, 'Some see', cx, 330, {
    size: 64,
    weight: 700,
    tracking: -0.03,
    color: C.ink,
    align: 'center',
    alpha: ramp(b, at + 0.05, at + 0.3)
  })
  const k = lerp(1.35, 1, ramp(b, at, at + 0.3, outExpo))
  ctx.save()
  ctx.translate(cx, 500)
  ctx.scale(k, k)
  text(ctx, word, 0, 0, {
    size: 210,
    weight: 900,
    tracking: -0.05,
    color: C.ink,
    align: 'center'
  })
  ctx.restore()
  // Faces pop on sixteenth notes.
  const d = 150
  const n = slugs.length
  const spread = Math.min(w - 190, 980)
  for (let i = 0; i < n; i++) {
    const t0 = at + 0.5 + i * 0.25
    const p = ramp(b, t0, t0 + 0.4, outBack(2.4))
    const px = cx - spread / 2 + (spread / (n - 1)) * i
    const arc = Math.pow((i / (n - 1)) * 2 - 1, 2)
    const py = 700 + arc * -60 + 70 + Math.sin(b * 2 + i) * 4
    portrait(ctx, face(slugs[i]!), px, py, d, { scale: p, shadow: 26, ring: 5 })
  }
  ctx.restore()
}

export function drawDivide(ctx: Ctx, s: S) {
  const b = s.b
  fill(ctx, C.ink, s.W, s.H)
  // Coral wipes across the whole frame; mint later pushes it to the left half.
  const wipe = ramp(b, 26, 26.18, outQuart)
  const push = ramp(b, 27.9, 28.12, inOutQuart)
  const leftW = lerp(s.W, s.W / 2, push)
  panel(ctx, s, b, 26, 0, leftW * wipe, C.coral, 'doom', doomSide)
  if (b >= 27.9)
    panel(ctx, s, b, 28, leftW, s.W - leftW, C.mint, 'bloom', bloomSide)
  // Seam between the two camps.
  if (b >= 28) {
    ctx.fillStyle = C.ink
    ctx.fillRect(leftW - 3, 0, 6, s.H * ramp(b, 28.05, 28.4, outExpo))
  }
  const fx = s.fx
  fx.bg = hexToRgb01(C.ink)
  fx.bloom = 0.04
  fx.vignette = 0.2
  fx.ca = 0.5 + 6 * hit(b, 26, 0.25) + 6 * hit(b, 28, 0.25)
  fx.samples = (b > 25.95 && b < 26.25) || (b > 27.85 && b < 28.2) ? 32 : 10
}

// ── B4–B5 · "Everyone has a take" → the noise ────────────────────────────
const takeCard = (
  ctx: Ctx,
  i: number,
  x: number,
  y: number,
  scale: number,
  rot: number,
  alpha: number,
  variant = 0
) => {
  const tk = takes[i % takes.length]!
  const handle = handles[i % handles.length]!
  const tone =
    tk.tone === 'doom' ? C.coral : tk.tone === 'bloom' ? C.mint : C.lime
  // 0 white · 1 ink · 2 tinted by tone
  const bg = variant === 1 ? C.ink2 : variant === 2 ? tone : '#ffffff'
  const fg = variant === 1 ? C.paper : C.ink
  ctx.save()
  ctx.translate(x, y)
  ctx.rotate(rot)
  ctx.scale(scale, scale)
  ctx.globalAlpha *= alpha
  const w = Math.max(
    420,
    measure(ctx, tk.text, { size: 38, weight: 700, tracking: -0.02 }) + 80
  )
  const h = 150
  ctx.shadowBlur = 40
  ctx.shadowColor = 'rgba(0,0,0,0.22)'
  ctx.shadowOffsetY = 14
  rrect(ctx, -w / 2, -h / 2, w, h, 22, bg)
  ctx.shadowColor = 'transparent'
  // Anonymous by design: skeleton bars instead of real-looking @handles.
  circle(ctx, -w / 2 + 50, -h / 2 + 46, 20, variant === 2 ? C.ink : tone)
  const barW = 110 + (handle.length % 5) * 22
  rrect(
    ctx,
    -w / 2 + 82,
    -h / 2 + 38,
    barW,
    16,
    8,
    variant === 1 ? 'rgba(251,250,246,0.22)' : 'rgba(14,14,12,0.14)'
  )
  rrect(
    ctx,
    -w / 2 + 92 + barW,
    -h / 2 + 38,
    54,
    16,
    8,
    variant === 1 ? 'rgba(251,250,246,0.12)' : 'rgba(14,14,12,0.08)'
  )
  text(ctx, tk.text, -w / 2 + 34, h / 2 - 34, {
    size: 38,
    weight: 700,
    tracking: -0.02,
    color: fg
  })
  ctx.restore()
}

export function drawTakes(ctx: Ctx, s: S) {
  const b = s.b
  if (b < 34) {
    fill(ctx, C.paper, s.W, s.H)
    const k = 1 + 0.04 * ramp(b, 30, 34)
    ctx.save()
    applyCamera(ctx, s, { x: 960, y: 540, zoom: k })
    const size = 150
    const st = { size, weight: 800, tracking: -0.045, color: C.ink }
    const line = 'Everyone has a take'
    const w = measure(ctx, line, st)
    let x = (s.W - w) / 2
    for (const [at, word] of [
      [30, 'Everyone'],
      [30.5, 'has'],
      [30.75, 'a'],
      [31, 'take']
    ] as [number, string][]) {
      riseWord(ctx, b, at, word, x, 585, st)
      x += measure(ctx, word + ' ', st)
    }
    // Cards land around the headline on eighth notes, piling up.
    for (let i = 0; i < 16; i++) {
      const at = 31.5 + i * 0.16
      if (b < at) continue
      const p = ramp(b, at, at + 0.22, outBack(1.6))
      const ang = rand(i * 4.4) * Math.PI * 2
      const r = 330 + rand(i * 8.1) * 260
      const px = 960 + Math.cos(ang) * r * 1.45
      const py = 540 + Math.sin(ang) * r * 0.78
      const rot = randRange(i * 2.2, -0.14, 0.14)
      takeCard(ctx, i, px, py, lerp(1.35, 0.92, p), rot, clamp(p * 2))
    }
    ctx.restore()
    const fx = s.fx
    fx.bg = hexToRgb01(C.paper)
    fx.bloom = 0.04
    fx.vignette = 0.14
    fx.samples = 12
    return
  }
  // The noise in depth: fly through a field of takes, accelerating.
  fill(ctx, '#0c0c0a', s.W, s.H)
  const t = b - 34
  const camZ = 1500 * t + 520 * t * t + 300 * Math.pow(Math.max(0, t - 2.3), 3)
  const focal = 950
  const roll = Math.sin(t * 0.9) * 0.05 + ramp(b, 36.5, 38, inCubic) * 0.18
  ctx.save()
  ctx.translate(s.W / 2, s.H / 2)
  ctx.rotate(roll)
  const items: { z: number; draw: () => void }[] = []
  const N = 150
  for (let i = 0; i < N; i++) {
    const z = 300 + i * 115 - camZ
    if (z < 30 || z > 9500) continue
    const ang = rand(i * 3.3) * Math.PI * 2
    const rad = 260 + rand(i * 5.9) * 1250
    const x = Math.cos(ang) * rad * 1.35
    const y = Math.sin(ang) * rad * 0.8
    const sc = focal / z
    const px = x * sc
    const py = y * sc
    const fog = clamp(1 - (z - 1800) / 7500)
    const near = clamp((z - 30) / 240)
    const rot = randRange(i * 2.2, -0.2, 0.2) + t * randRange(i, -0.06, 0.06)
    const v = rand(i * 7.7)
    const variant = v < 0.62 ? 0 : v < 0.8 ? 1 : 2
    items.push({
      z,
      draw: () => takeCard(ctx, i, px, py, sc * 1.05, rot, fog * near, variant)
    })
  }
  items.sort((a, b) => b.z - a.z)
  for (const it of items) it.draw()
  ctx.restore()
  // Pulses of doom/bloom color flood the field on the horn accents.
  const flare =
    hit(b, 36, 0.4) +
    hit(b, 36.5, 0.3) * 0.6 +
    hit(b, 37, 0.3) * 0.5 +
    hit(b, 37.5, 0.3) * 0.7
  if (flare > 0.01) {
    ctx.save()
    ctx.globalCompositeOperation = 'screen'
    const g = ctx.createRadialGradient(960, 540, 50, 960, 540, 1100)
    g.addColorStop(
      0,
      rgba(Math.floor(b * 2) % 2 ? C.mint : C.coral, 0.4 * flare)
    )
    g.addColorStop(1, 'rgba(0,0,0,0)')
    ctx.fillStyle = g
    ctx.fillRect(0, 0, s.W, s.H)
    ctx.restore()
  }
  const fx = s.fx
  fx.bg = [0.047, 0.047, 0.039]
  fx.bloom = 0.22
  fx.bloomThreshold = 0.78
  fx.vignette = 0.45
  fx.ca = 1 + t * 1.5 + 8 * hit(b, 36, 0.3)
  fx.zoomBlur = 0.02 + ramp(b, 36.5, 38, inCubic) * 0.12
  fx.samples = 28
}

// ── B6 · "It's loud / tribal / exhausting" ───────────────────────
export function drawTribal(ctx: Ctx, s: S) {
  const b = s.b
  const size = 250
  const st = {
    size,
    weight: 900,
    tracking: -0.05,
    wordSpacing: 0.16,
    color: C.ink
  }
  if (b < 39) {
    // Loud: the letters vibrate like a blown-out speaker.
    fill(ctx, C.coral, s.W, s.H)
    const line = 'It’s loud'
    const L = glyphs(ctx, line, st)
    const x0 = (s.W - L.width) / 2
    const k = lerp(1.25, 1, ramp(b, 38, 38.2, outExpo))
    ctx.save()
    ctx.translate(s.W / 2, 610)
    ctx.scale(k, k)
    ctx.translate(-s.W / 2, -610)
    for (const g of L.glyphs) {
      const j = 7 + 10 * hit(b, 38, 0.6)
      const dx = noise1(b * 40 + g.i * 3.1, 1) * j
      const dy = noise1(b * 40 + g.i * 5.7, 2) * j
      text(ctx, g.ch, x0 + g.x + dx, 610 + dy, st)
    }
    ctx.restore()
    s.fx.bg = hexToRgb01(C.coral)
  } else if (b < 40) {
    // Tribal: the sentence splits along its middle and the halves pull apart.
    fill(ctx, C.peach, s.W, s.H)
    const line = 'It’s tribal'
    const w = measure(ctx, line, st)
    const x0 = (s.W - w) / 2
    const y = 620
    const split = ramp(b, 39.5, 39.85, inOutQuart) * 110 + 8 * hit(b, 39.5, 0.2)
    const cut = y - size * 0.36
    for (const [clipY, clipH, dir, col] of [
      [0, cut, -1, C.ink],
      [cut, s.H, 1, C.ink]
    ] as [number, number, number, string][]) {
      ctx.save()
      ctx.beginPath()
      ctx.rect(0, clipY, s.W, clipH - clipY)
      ctx.clip()
      text(ctx, line, x0 + dir * split, y, { ...st, color: col })
      ctx.restore()
    }
    if (split > 1) {
      ctx.fillStyle = rgba(C.coral, 1)
      ctx.fillRect(0, cut - 2, s.W / 2 - split * 0.2, 4)
      ctx.fillStyle = rgba(C.mintDeep, 1)
      ctx.fillRect(s.W / 2 + split * 0.2, cut - 2, s.W / 2, 4)
    }
    s.fx.bg = hexToRgb01(C.peach)
  } else {
    // Exhausting: the letters sag, slump and slide off the frame.
    const dim = ramp(b, 41.2, 42, inQuad)
    fill(ctx, mixHex(C.violet, C.ink, dim), s.W, s.H)
    const line = 'It’s exhausting'
    const L = glyphs(ctx, line, { ...st, size: 210 })
    const x0 = (s.W - L.width) / 2
    for (const g of L.glyphs) {
      const delay = rand(g.i * 3.7) * 0.6 + g.i * 0.03
      const p = ramp(b, 40.5 + delay, 41.9 + delay, inCubic)
      const sag = p * p * 900
      const rot = p * randRange(g.i * 7.1, -0.9, 0.9)
      const k = lerp(1.2, 1, ramp(b, 40, 40.2, outExpo))
      ctx.save()
      ctx.translate(s.W / 2 + (x0 + g.x + g.w / 2 - s.W / 2) * k, 610 + sag)
      ctx.rotate(rot)
      ctx.scale(k, k)
      text(ctx, g.ch, -g.w / 2, 0, {
        ...st,
        size: 210,
        color: mixHex(C.ink, C.ink, 0)
      })
      ctx.restore()
    }
    s.fx.bg = hexToRgb01(C.violet)
  }
  const fx = s.fx
  fx.bloom = 0.03
  fx.vignette = 0.18
  fx.ca = 0.6 + 10 * hit(b, 38, 0.3) + 8 * hit(b, 39, 0.3) + 8 * hit(b, 40, 0.3)
  fx.samples = 16
}

// ── B7–B8 · "So what do you actually think? And why?" ─────────────────────
export function drawTurn(ctx: Ctx, s: S) {
  const b = s.b
  fill(ctx, C.ink, s.W, s.H)
  const cx = s.W / 2
  const lineY = 600

  // B7: the question, whose "?" dot is the "you" dot.
  const out = ramp(b, 45.6, 46.1, inOutCubic)
  const small = { size: 92, weight: 700, tracking: -0.035, color: C.paper }
  ctx.save()
  ctx.globalAlpha = 1 - out
  ctx.translate(0, -out * 120)
  const l1 = 'So what do'
  const w1 = measure(ctx, l1, small)
  riseWord(ctx, b, 42.5, 'So what do', cx - w1 / 2, 330, small)
  // "you" in the serif, big.
  if (b >= 43) {
    const p = ramp(b, 43, 43.35, outExpo)
    const k = lerp(1.5, 1, p)
    ctx.save()
    ctx.translate(cx, 560)
    ctx.scale(k, k)
    text(ctx, 'you', 0, 0, {
      family: 'serif',
      italic: true,
      size: 300,
      weight: 400,
      color: prismGradient(ctx, -250, 0, 250, 0),
      align: 'center',
      alpha: clamp(p * 2)
    })
    ctx.restore()
  }
  const l3 = 'actually think'
  const w3 = measure(ctx, l3, small)
  const qx = cx - (w3 + 70) / 2
  riseWord(ctx, b, 44, 'actually think', qx, 760, small)
  ctx.restore()

  // The question mark (scaled glyph) and its dot.
  const qk = 92 / 300
  const qOrigin = { x: qx + w3 + 14, y: 760 }
  const dotHome = { x: qOrigin.x + QDOT.x * qk, y: qOrigin.y + QDOT.y * qk }
  if (b >= 44.25 && b < 46.2) {
    const p = ramp(b, 44.25, 44.45, outExpo)
    ctx.save()
    ctx.globalAlpha = (1 - out) * p
    ctx.translate(0, -out * 120)
    questionHook(ctx, qOrigin.x, qOrigin.y, qk, C.paper)
    ctx.restore()
  }

  // The dot: sits in the "?", then drops to center stage and weighs doom vs bloom.
  const drop = ramp(b, 45.5, 46.2, inOutQuart)
  let dx = lerp(dotHome.x, cx, drop)
  let dy = lerp(dotHome.y - out * 120, lineY, drop)
  // Swings on the beat, faster and faster: doom … bloom … doom …
  const swings: [number, number][] = [
    [46.5, -1],
    [47, 1],
    [47.5, -0.9],
    [48, 0.9],
    [48.5, -0.8],
    [48.75, 0.8],
    [49, -0.7],
    [49.25, 0.7],
    [49.5, -0.5],
    [49.625, 0.5],
    [49.75, 0]
  ]
  let pos = 0
  let prev = 0
  let prevAt = 46.2
  for (const [at, v] of swings) {
    if (b >= prevAt) pos = lerp(prev, v, ramp(b, prevAt, at, inOutCubic))
    if (b >= at) {
      prev = v
      prevAt = at
    }
  }
  const reach = 560
  if (b >= 46.2) dx = cx + pos * reach

  // Axis with DOOM and BLOOM at the ends.
  if (b >= 46) {
    const a = ramp(b, 46, 46.4, outCubic)
    const len = reach * a
    const g = prismGradient(ctx, cx - reach, 0, cx + reach, 0)
    ctx.save()
    ctx.globalAlpha = 0.9
    ctx.fillStyle = g
    ctx.fillRect(cx - len, lineY - 2, len * 2, 4)
    ctx.restore()
    const lean = pos
    const dk = 1 + 0.25 * clamp(-lean) * clamp(-lean)
    const bk = 1 + 0.25 * clamp(lean) * clamp(lean)
    ctx.save()
    ctx.translate(cx - reach - 60, lineY + 26)
    ctx.scale(dk, dk)
    text(ctx, 'DOOM', 0, 0, {
      size: 70,
      weight: 900,
      tracking: -0.03,
      color: C.coral,
      align: 'right',
      alpha: a
    })
    ctx.restore()
    ctx.save()
    ctx.translate(cx + reach + 60, lineY + 26)
    ctx.scale(bk, bk)
    text(ctx, 'BLOOM', 0, 0, {
      size: 70,
      weight: 900,
      tracking: -0.03,
      color: C.mint,
      align: 'left',
      alpha: a
    })
    ctx.restore()
    // "And why?" above the axis.
    const wa = measure(ctx, 'And ', small)
    const ww = measure(ctx, 'why?', {
      family: 'serif',
      italic: true,
      size: 150,
      weight: 400
    })
    const x0 = cx - (wa + ww) / 2
    riseWord(ctx, b, 46.5, 'And', x0, 380, small)
    if (b >= 47) {
      const p = ramp(b, 47, 47.3, outExpo)
      text(ctx, 'why?', x0 + wa, 380, {
        family: 'serif',
        italic: true,
        size: 150,
        weight: 400,
        color: C.paper,
        alpha: p
      })
    }
  }
  // The dot, with a heartbeat pulse and an anticipation squash before the drop.
  const beatPulse = b >= 46.2 ? hit(b, Math.floor(b * 2) / 2, 0.25) : 0
  const gather = ramp(b, 49.75, 50, inCubic)
  const r =
    QDOT.r *
    qk *
    lerp(1, 3.2, drop) *
    (1 + 0.18 * beatPulse) *
    (1 - gather * 0.7)
  if (b >= 44.25) {
    const glow = ctx.createRadialGradient(dx, dy, 0, dx, dy, r * 6)
    glow.addColorStop(0, rgba(C.paper, 0.35 * drop))
    glow.addColorStop(1, 'rgba(0,0,0,0)')
    ctx.fillStyle = glow
    ctx.fillRect(dx - r * 6, dy - r * 6, r * 12, r * 12)
    circle(ctx, dx, dy, r, C.paper)
  }
  if (gather > 0) {
    ctx.save()
    ctx.globalAlpha = gather
    for (let i = 0; i < 3; i++) {
      const rr = lerp(420 - i * 90, r * 1.2, gather)
      ctx.beginPath()
      ctx.arc(dx, dy, Math.max(1, rr), 0, Math.PI * 2)
      ctx.strokeStyle = rgba(i === 0 ? C.coral : i === 1 ? C.lime : C.mint, 0.6)
      ctx.lineWidth = 3
      ctx.stroke()
    }
    ctx.restore()
  }

  const fx = s.fx
  fx.bg = hexToRgb01(C.ink)
  fx.bloom = 0.3
  fx.bloomThreshold = 0.68
  fx.vignette = 0.38
  fx.ca = 0.8 + ramp(b, 49, 50, inCubic) * 6
  fx.samples = b > 46.2 ? 32 : 12
  fx.flash = ramp(b, 49.85, 50, inCubic) * 0.9
  fx.flashColor = [1, 0.98, 0.95]
}
