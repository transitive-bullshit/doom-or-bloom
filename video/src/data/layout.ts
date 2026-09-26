// Port of lib/landing/portrait-layout.ts: visual-only separation of portraits.
import { personas } from './personas'

const clamp = (v: number, min: number, max: number) =>
  Math.max(min, Math.min(max, v))

export function separatePortraits(
  boxes: { x: number; y: number; width: number; height: number }[],
  width: number,
  height: number,
  passes = 3,
  step = 6
) {
  const positions = boxes.map((box) => ({
    ...box,
    x: clamp(box.x, 0, width),
    y: clamp(box.y, 0, height)
  }))
  for (let pass = 0; pass < passes; pass++) {
    const shifts = positions.map(() => ({ x: 0, y: 0 }))
    for (let i = 0; i < positions.length; i++) {
      const a = positions[i]!
      for (let j = i + 1; j < positions.length; j++) {
        const b = positions[j]!
        const overlapX = Math.max(
          0,
          Math.min(a.x + a.width / 2, b.x + b.width / 2) -
            Math.max(a.x - a.width / 2, b.x - b.width / 2)
        )
        const overlapY = Math.max(
          0,
          Math.min(a.y + a.height / 2, b.y + b.height / 2) -
            Math.max(a.y - a.height / 2, b.y - b.height / 2)
        )
        if (
          overlapX * overlapY <=
          0.25 * Math.min(a.width * a.height, b.width * b.height)
        )
          continue
        const dx = b.x - a.x
        const dy = b.y - a.y
        const distance = Math.hypot(dx, dy)
        const angle = (((i * 31 + j * 17) % 360) * Math.PI) / 180
        const x = distance ? dx / distance : Math.cos(angle)
        const y = distance ? dy / distance : Math.sin(angle)
        shifts[i]!.x -= x * step
        shifts[i]!.y -= y * step
        shifts[j]!.x += x * step
        shifts[j]!.y += y * step
      }
    }
    positions.forEach((position, i) => {
      const shift = shifts[i]!
      const scale = Math.min(1, step / (Math.hypot(shift.x, shift.y) || 1))
      position.x = clamp(position.x + shift.x * scale, 0, width)
      position.y = clamp(position.y + shift.y * scale, 0, height)
    })
  }
  return positions
}

export interface MapGeom {
  x: number
  y: number
  w: number
  h: number
  d: number
}

// The featured map as it appears in the video (screen pixels at zoom 1).
export const MAP: MapGeom = { x: 330, y: 262, w: 1260, h: 600, d: 62 }

const cache = new Map<
  string,
  { slug: string; x: number; y: number; i: number }[]
>()

/** Screen positions of every persona on a map, separated like the site does. */
export function mapPositions(g: MapGeom = MAP) {
  const key = `${g.x},${g.y},${g.w},${g.h},${g.d}`
  const hit = cache.get(key)
  if (hit) return hit
  const sorted = [...personas].sort((a, b) => a.x - b.x)
  const boxes = sorted.map((p) => ({
    x: p.x * g.w,
    y: (1 - p.y) * g.h,
    width: g.d + 6,
    height: g.d + 6
  }))
  const pos = separatePortraits(boxes, g.w, g.h, 6, 7)
  const out = sorted.map((p, i) => ({
    slug: p.slug,
    x: g.x + pos[i]!.x,
    y: g.y + pos[i]!.y,
    i
  }))
  cache.set(key, out)
  return out
}
