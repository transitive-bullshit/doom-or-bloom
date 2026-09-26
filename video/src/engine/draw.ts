import { C, FONT, PRISM } from './theme'

export type Ctx = CanvasRenderingContext2D
export type Family = keyof typeof FONT

export interface TextStyle {
  family?: Family
  size: number
  weight?: number
  italic?: boolean
  /** Letter spacing in em. */
  tracking?: number
  /** Extra word spacing in em (display sans defaults to a little extra). */
  wordSpacing?: number
  color?: string | CanvasGradient | CanvasPattern
  align?: CanvasTextAlign
  baseline?: CanvasTextBaseline
  alpha?: number
}

export const fontString = (s: TextStyle) =>
  `${s.italic ? 'italic ' : ''}${s.weight ?? 700} ${s.size}px ${FONT[s.family ?? 'sans']}`

export const applyText = (ctx: Ctx, s: TextStyle) => {
  ctx.font = fontString(s)
  ctx.letterSpacing = `${(s.tracking ?? 0) * s.size}px`
  const ws = s.wordSpacing ?? ((s.family ?? 'sans') === 'sans' ? 0.08 : 0)
  ctx.wordSpacing = `${ws * s.size}px`
  ctx.textAlign = s.align ?? 'left'
  ctx.textBaseline = s.baseline ?? 'alphabetic'
  ctx.fontKerning = 'normal'
  if (s.color) ctx.fillStyle = s.color
}

/** Advance width, excluding the trailing letter spacing. */
export const measure = (ctx: Ctx, str: string, s: TextStyle) => {
  ctx.save()
  applyText(ctx, { ...s, align: 'left' })
  const w =
    ctx.measureText(str).width - (str.length ? (s.tracking ?? 0) * s.size : 0)
  ctx.restore()
  return w
}

export const text = (
  ctx: Ctx,
  str: string,
  x: number,
  y: number,
  s: TextStyle
) => {
  if ((s.alpha ?? 1) <= 0.001) return
  ctx.save()
  applyText(ctx, { ...s, align: 'left' })
  const w =
    ctx.measureText(str).width - (str.length ? (s.tracking ?? 0) * s.size : 0)
  const align = s.align ?? 'left'
  const dx =
    align === 'center' ? -w / 2 : align === 'right' || align === 'end' ? -w : 0
  ctx.globalAlpha *= s.alpha ?? 1
  ctx.fillText(str, x + dx, y)
  ctx.restore()
  return w
}

export interface Glyph {
  ch: string
  x: number
  w: number
  i: number
}

/** Per-glyph left offsets (kerning and tracking included). */
export const glyphs = (ctx: Ctx, str: string, s: TextStyle) => {
  ctx.save()
  applyText(ctx, { ...s, align: 'left' })
  const out: Glyph[] = []
  const chars = Array.from(str)
  let prefix = ''
  for (let i = 0; i < chars.length; i++) {
    const x = prefix ? ctx.measureText(prefix).width : 0
    prefix += chars[i]
    const w = ctx.measureText(chars[i]!).width - (s.tracking ?? 0) * s.size
    out.push({ ch: chars[i]!, x, w, i })
  }
  const width =
    ctx.measureText(str).width - (chars.length ? (s.tracking ?? 0) * s.size : 0)
  ctx.restore()
  return { glyphs: out, width }
}

export interface Run {
  text: string
  style: TextStyle
}

/** Lay out mixed-style runs on one baseline. Returns run x offsets and width. */
export const layoutRuns = (ctx: Ctx, runs: Run[], gap = 0) => {
  let x = 0
  const placed = runs.map((r) => {
    const w = measure(ctx, r.text, r.style)
    const out = { ...r, x, w }
    x += w + gap
    return out
  })
  return { runs: placed, width: x - gap }
}

export const prismGradient = (
  ctx: Ctx,
  x0: number,
  y0: number,
  x1: number,
  y1: number,
  stops = PRISM
) => {
  const g = ctx.createLinearGradient(x0, y0, x1, y1)
  for (const [o, c] of stops) g.addColorStop(o, c)
  return g
}

/** The app's Prism field: a 110° CSS gradient under a violet veil. */
export const prismField = (
  ctx: Ctx,
  x: number,
  y: number,
  w: number,
  h: number,
  r = 8,
  opts: { angle?: number; veil?: number; alpha?: number; shift?: number } = {}
) => {
  const a = ((opts.angle ?? 110) * Math.PI) / 180
  const dx = Math.sin(a)
  const dy = -Math.cos(a)
  const len = Math.abs(w * dx) + Math.abs(h * dy)
  const cx = x + w / 2 + (opts.shift ?? 0) * w
  const cy = y + h / 2
  ctx.save()
  ctx.globalAlpha *= opts.alpha ?? 1
  ctx.beginPath()
  ctx.roundRect(x, y, w, h, r)
  ctx.clip()
  ctx.fillStyle = prismGradient(
    ctx,
    cx - (dx * len) / 2,
    cy - (dy * len) / 2,
    cx + (dx * len) / 2,
    cy + (dy * len) / 2
  )
  ctx.fillRect(x, y, w, h)
  const veil = ctx.createLinearGradient(0, y + h, 0, y)
  veil.addColorStop(0, `rgba(188, 177, 255, ${opts.veil ?? 0.5})`)
  veil.addColorStop(1, 'rgba(188, 177, 255, 0)')
  ctx.fillStyle = veil
  ctx.fillRect(x, y, w, h)
  ctx.restore()
}

export const circle = (
  ctx: Ctx,
  x: number,
  y: number,
  r: number,
  fill: string | CanvasGradient
) => {
  if (r <= 0) return
  ctx.beginPath()
  ctx.arc(x, y, r, 0, Math.PI * 2)
  ctx.fillStyle = fill
  ctx.fill()
}

export const ring = (
  ctx: Ctx,
  x: number,
  y: number,
  r: number,
  width: number,
  stroke: string | CanvasGradient
) => {
  if (r <= 0 || width <= 0) return
  ctx.beginPath()
  ctx.arc(x, y, r, 0, Math.PI * 2)
  ctx.lineWidth = width
  ctx.strokeStyle = stroke
  ctx.stroke()
}

export const rrect = (
  ctx: Ctx,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
  fill?: string | CanvasGradient,
  stroke?: string,
  lineWidth = 1
) => {
  ctx.beginPath()
  ctx.roundRect(x, y, w, h, Math.min(r, w / 2, h / 2))
  if (fill) {
    ctx.fillStyle = fill
    ctx.fill()
  }
  if (stroke) {
    ctx.lineWidth = lineWidth
    ctx.strokeStyle = stroke
    ctx.stroke()
  }
}

export const withShadow = (
  ctx: Ctx,
  blur: number,
  color: string,
  oy = 0,
  fn: () => void
) => {
  ctx.save()
  ctx.shadowBlur = blur
  ctx.shadowColor = color
  ctx.shadowOffsetY = oy
  fn()
  ctx.restore()
}

/** A circular portrait with the app's cream ring and soft shadow. */
export const portrait = (
  ctx: Ctx,
  img: CanvasImageSource,
  x: number,
  y: number,
  d: number,
  o: {
    ring?: number
    ringColor?: string
    shadow?: number
    alpha?: number
    gray?: number
    scale?: number
  } = {}
) => {
  const scale = o.scale ?? 1
  const r = (d / 2) * scale
  if (r <= 0.5 || (o.alpha ?? 1) <= 0.002) return
  const ringW = (o.ring ?? Math.max(2, d * 0.05)) * scale
  ctx.save()
  ctx.globalAlpha *= o.alpha ?? 1
  if (o.shadow) {
    ctx.shadowBlur = o.shadow * scale
    ctx.shadowColor = 'rgba(20, 30, 22, 0.28)'
    ctx.shadowOffsetY = o.shadow * 0.25 * scale
  }
  circle(ctx, x, y, r, o.ringColor ?? C.paper)
  ctx.shadowColor = 'transparent'
  ctx.beginPath()
  ctx.arc(x, y, r - ringW, 0, Math.PI * 2)
  ctx.clip()
  if (o.gray) ctx.filter = `grayscale(${o.gray})`
  ctx.drawImage(
    img,
    x - r + ringW,
    y - r + ringW,
    (r - ringW) * 2,
    (r - ringW) * 2
  )
  ctx.restore()
}

export const fill = (
  ctx: Ctx,
  color: string | CanvasGradient,
  w: number,
  h: number
) => {
  ctx.fillStyle = color
  ctx.fillRect(0, 0, w, h)
}

/** Parse #rrggbb or rgb()/rgba() into [r, g, b] 0–255. */
export const parseColor = (c: string): [number, number, number] => {
  if (c.startsWith('#')) {
    const n = parseInt(c.slice(1), 16)
    return [(n >> 16) & 255, (n >> 8) & 255, n & 255]
  }
  const m = c.match(/[\d.]+/g) ?? ['0', '0', '0']
  return [Number(m[0]), Number(m[1]), Number(m[2])]
}
export const hexRgb = parseColor

const toHex = (v: number[]) =>
  '#' +
  v
    .map((x) =>
      Math.round(Math.min(255, Math.max(0, x)))
        .toString(16)
        .padStart(2, '0')
    )
    .join('')

export const mixHex = (a: string, b: string, t: number) => {
  const x = parseColor(a)
  const y = parseColor(b)
  return toHex([0, 1, 2].map((i) => x[i]! + (y[i]! - x[i]!) * t))
}

export const rgba = (c: string, a: number) => {
  const [r, g, b] = parseColor(c)
  return `rgba(${r}, ${g}, ${b}, ${a})`
}

/** Color at position t along the Prism gradient. */
export const prismAt = (t: number) => {
  const stops = PRISM
  if (t <= 0) return stops[0]![1]
  for (let i = 1; i < stops.length; i++) {
    const [o1, c1] = stops[i]!
    const [o0, c0] = stops[i - 1]!
    if (t <= o1) return mixHex(c0, c1, (t - o0) / (o1 - o0))
  }
  return stops[stops.length - 1]![1]
}
