import type { Ctx } from '../engine/draw'
import type { Fx } from '../engine/post'
import { planeMVP } from '../engine/mat4'

export interface S {
  /** Seconds since the start of the video. */
  t: number
  /** Global beat position (fractional). */
  b: number
  fx: Fx
  W: number
  H: number
}

export type SceneFn = (ctx: Ctx, s: S) => void

export interface Camera {
  x: number
  y: number
  zoom: number
  rot?: number
  ox?: number
  oy?: number
}

/** Apply a 2D camera looking at world point (x, y). */
export const applyCamera = (ctx: Ctx, s: S, cam: Camera) => {
  ctx.translate(s.W / 2 + (cam.ox ?? 0), s.H / 2 + (cam.oy ?? 0))
  if (cam.rot) ctx.rotate(cam.rot)
  ctx.scale(cam.zoom, cam.zoom)
  ctx.translate(-cam.x, -cam.y)
}

/** World → screen for a camera (no rotation support needed by callers). */
export const toScreen = (s: S, cam: Camera, x: number, y: number) => {
  const c = Math.cos(cam.rot ?? 0)
  const sn = Math.sin(cam.rot ?? 0)
  const dx = (x - cam.x) * cam.zoom
  const dy = (y - cam.y) * cam.zoom
  return {
    x: s.W / 2 + (cam.ox ?? 0) + dx * c - dy * sn,
    y: s.H / 2 + (cam.oy ?? 0) + dx * sn + dy * c
  }
}

export const hexToRgb01 = (hex: string): [number, number, number] => {
  const n = parseInt(hex.slice(1), 16)
  return [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255]
}

let overlay: HTMLCanvasElement | null = null
let overlayVersion = 0

/** A full-screen 2D layer composited above perspective planes. */
export const overlayLayer = (s: S) => {
  if (!overlay) {
    overlay = document.createElement('canvas')
    overlay.width = s.W
    overlay.height = s.H
  }
  const c = overlay.getContext('2d')!
  c.setTransform(1, 0, 0, 1, 0, 0)
  c.clearRect(0, 0, s.W, s.H)
  return {
    ctx: c,
    commit: () =>
      s.fx.topPlanes.push({
        canvas: overlay!,
        version: ++overlayVersion,
        mvp: planeMVP(
          s.W,
          s.H,
          { cx: s.W / 2, cy: s.H / 2, w: s.W, h: s.H },
          28
        ),
        alpha: 1
      })
  }
}
