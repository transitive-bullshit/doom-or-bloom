import { face } from '../engine/assets'
import {
  applyText,
  measure,
  portrait,
  prismField,
  rgba,
  rrect,
  text,
  type Ctx,
  type TextStyle
} from '../engine/draw'
import { clamp, lerp, outBack, outExpo, ramp } from '../engine/ease'
import { C } from '../engine/theme'
import { mapPositions, MAP, type MapGeom } from '../data/layout'

const TAU = Math.PI * 2
const K = 13 / 24

/**
 * The Doom or Bloom "Eclipse" icon (app/icon.svg) as a parametric shape:
 * a coral disc, a mint right crescent, and a cream lens that can open.
 */
export const eclipse = (
  ctx: Ctx,
  cx: number,
  cy: number,
  r: number,
  o: {
    lens?: number
    mint?: number
    rot?: number
    lensColor?: string
    alpha?: number
  } = {}
) => {
  if (r <= 0.5) return
  const lens = o.lens ?? 1
  const mint = o.mint ?? 1
  const k = K * lens
  ctx.save()
  ctx.globalAlpha *= o.alpha ?? 1
  ctx.translate(cx, cy)
  ctx.rotate(o.rot ?? 0)
  ctx.scale(r, r)
  ctx.beginPath()
  ctx.arc(0, 0, 1, 0, TAU)
  ctx.fillStyle = C.coral
  ctx.fill()
  if (mint > 0.001) {
    ctx.save()
    ctx.scale(mint, 1)
    ctx.beginPath()
    ctx.moveTo(0, -1)
    ctx.arc(0, 0, 1, -Math.PI / 2, Math.PI / 2)
    ctx.bezierCurveTo(k, 1 - K, k, -1 + K, 0, -1)
    ctx.fillStyle = C.mint
    ctx.fill()
    ctx.restore()
  }
  if (lens > 0.001) {
    ctx.beginPath()
    ctx.moveTo(0, -1)
    ctx.bezierCurveTo(-k, -1 + K, -k, 1 - K, 0, 1)
    ctx.bezierCurveTo(k, 1 - K, k, -1 + K, 0, -1)
    ctx.fillStyle = o.lensColor ?? '#f7f5ef'
    ctx.fill()
  }
  ctx.restore()
}

/** "Doom or Bloom" wordmark with the serif italic "or"; returns its width. */
export const wordmark = (
  ctx: Ctx,
  x: number,
  y: number,
  size: number,
  color: string,
  o: { align?: 'left' | 'center'; reveal?: number; alpha?: number } = {}
) => {
  const sans: TextStyle = { size, weight: 800, tracking: -0.045, color }
  const serif: TextStyle = {
    family: 'serif',
    italic: true,
    size: size * 1.12,
    weight: 400,
    color
  }
  const w1 = measure(ctx, 'Doom ', sans)
  const w2 = measure(ctx, 'or', serif)
  const gap = size * 0.2
  const w3 = measure(ctx, 'Bloom', sans)
  const total = w1 + w2 + gap + w3
  const x0 = o.align === 'center' ? x - total / 2 : x
  const reveal = o.reveal ?? 1
  const parts: [string, number, TextStyle, number][] = [
    ['Doom', x0, sans, 0],
    ['or', x0 + w1, serif, 1],
    ['Bloom', x0 + w1 + w2 + gap, sans, 2]
  ]
  for (const [str, px, st, i] of parts) {
    const p = clamp(reveal * 3 - i)
    if (p <= 0) continue
    const e = outExpo(p)
    ctx.save()
    ctx.beginPath()
    ctx.rect(px - size, y - size * 1.1, 99999, size * 1.45)
    ctx.clip()
    text(ctx, str, px, y + (1 - e) * size * 1.1, {
      ...st,
      alpha: (o.alpha ?? 1) * clamp(p * 2)
    })
    ctx.restore()
  }
  return total
}

export interface MapOpts {
  geom?: MapGeom
  /** 0..1 progress of each face's arrival (by index in x order). */
  arrive?: (i: number) => number
  dim?: number
  highlight?: string | null
  labels?: number
  names?: boolean
  b: number
}

/** The featured map: Prism field, crosshair, axis labels and portraits. */
export const drawMap = (ctx: Ctx, o: MapOpts) => {
  const g = o.geom ?? MAP
  prismField(ctx, g.x, g.y, g.w, g.h, 14)
  ctx.save()
  ctx.strokeStyle = C.grid
  ctx.lineWidth = 1.5
  ctx.beginPath()
  ctx.moveTo(g.x, g.y + g.h / 2)
  ctx.lineTo(g.x + g.w, g.y + g.h / 2)
  ctx.moveTo(g.x + g.w / 2, g.y)
  ctx.lineTo(g.x + g.w / 2, g.y + g.h)
  ctx.stroke()
  ctx.strokeStyle = C.border
  ctx.beginPath()
  ctx.roundRect(g.x, g.y, g.w, g.h, 14)
  ctx.stroke()
  ctx.restore()
  const la = o.labels ?? 1
  if (la > 0) {
    text(ctx, 'Doom', g.x - 36, g.y + g.h / 2 + 12, {
      size: 34,
      weight: 600,
      color: C.ink,
      align: 'right',
      alpha: la
    })
    text(ctx, 'Bloom', g.x + g.w + 36, g.y + g.h / 2 + 12, {
      size: 34,
      weight: 600,
      color: C.ink,
      alpha: la
    })
    text(ctx, 'Civilizational change', g.x + g.w / 2, g.y - 26, {
      size: 22,
      weight: 500,
      color: C.muted,
      align: 'center',
      tracking: 0.01,
      alpha: la
    })
    text(ctx, 'Incremental change', g.x + g.w / 2, g.y + g.h + 44, {
      size: 22,
      weight: 500,
      color: C.muted,
      align: 'center',
      tracking: 0.01,
      alpha: la
    })
  }
  const pos = mapPositions(g)
  const items = pos.map((p) => ({ ...p, hi: p.slug === o.highlight }))
  items.sort((a, b) => Number(a.hi) - Number(b.hi))
  for (const p of items) {
    const a = o.arrive ? o.arrive(p.i) : 1
    if (a <= 0) continue
    const fade = o.highlight
      ? p.hi
        ? 1
        : 1 - (o.dim ?? 0.72)
      : 1 - (o.dim ?? 0)
    const s = p.hi ? 1.28 : 1
    portrait(ctx, face(p.slug), p.x, p.y, g.d, {
      scale: a * s,
      shadow: 16,
      ring: 3.5,
      alpha: clamp(a * 3) * fade
    })
  }
}

/** A name pill like the map's hover label. */
export const namePill = (
  ctx: Ctx,
  str: string,
  x: number,
  y: number,
  p: number,
  dark = false
) => {
  if (p <= 0) return
  const st: TextStyle = {
    size: 28,
    weight: 650 as number,
    tracking: -0.01,
    color: dark ? C.paper : C.ink
  }
  const w = measure(ctx, str, st) + 36
  const e = outBack(1.8)(clamp(p))
  ctx.save()
  ctx.translate(x, y)
  ctx.scale(lerp(0.7, 1, e), lerp(0.7, 1, e))
  ctx.globalAlpha *= clamp(p * 2)
  ctx.shadowBlur = 18
  ctx.shadowColor = 'rgba(20,30,22,0.25)'
  ctx.shadowOffsetY = 6
  rrect(ctx, -w / 2, -24, w, 48, 12, dark ? C.ink : C.paper)
  ctx.shadowColor = 'transparent'
  text(ctx, str, 0, 10, { ...st, align: 'center' })
  ctx.restore()
}

/** Classic arrow cursor. */
export const cursor = (ctx: Ctx, x: number, y: number, s = 1, press = 0) => {
  ctx.save()
  ctx.translate(x, y)
  const k = s * (1 - press * 0.12)
  ctx.scale(k, k)
  ctx.shadowBlur = 10
  ctx.shadowColor = 'rgba(0,0,0,0.3)'
  ctx.shadowOffsetY = 3
  ctx.beginPath()
  ctx.moveTo(0, 0)
  ctx.lineTo(0, 34)
  ctx.lineTo(8.5, 26)
  ctx.lineTo(14, 39)
  ctx.lineTo(19.5, 36.5)
  ctx.lineTo(14, 24)
  ctx.lineTo(25, 24)
  ctx.closePath()
  ctx.fillStyle = '#ffffff'
  ctx.fill()
  ctx.shadowColor = 'transparent'
  ctx.lineWidth = 2.2
  ctx.strokeStyle = C.ink
  ctx.lineJoin = 'round'
  ctx.stroke()
  ctx.restore()
}

/** Greedy word wrap. */
export const wrap = (ctx: Ctx, str: string, maxW: number, st: TextStyle) => {
  ctx.save()
  applyText(ctx, st)
  const words = str.split(' ')
  const lines: string[] = []
  let line = ''
  for (const w of words) {
    const test = line ? `${line} ${w}` : w
    if (ctx.measureText(test).width > maxW && line) {
      lines.push(line)
      line = w
    } else line = test
  }
  if (line) lines.push(line)
  ctx.restore()
  return lines
}

export const softGlow = (
  ctx: Ctx,
  x: number,
  y: number,
  r: number,
  color: string,
  a: number
) => {
  if (a <= 0) return
  const g = ctx.createRadialGradient(x, y, 0, x, y, r)
  g.addColorStop(0, rgba(color, a))
  g.addColorStop(1, rgba(color, 0))
  ctx.fillStyle = g
  ctx.fillRect(x - r, y - r, r * 2, r * 2)
}

export { face, ramp }
