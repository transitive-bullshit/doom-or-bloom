// Static top and bottom bands for the 9:16 cut (TikTok, Reels, Shorts). The
// 16:9 film sits between them over a blurred copy of itself; scripts/vertical.mjs
// composites it with the layout returned here.
import {
  measure,
  prismGradient,
  rrect,
  text,
  type TextStyle
} from './engine/draw'
import { C } from './engine/theme'
import { eclipse, softGlow } from './scenes/brand'

const VERTICAL = { w: 1080, h: 1920, filmY: 620, filmH: 608 }

export function renderVerticalOverlay() {
  const { w, h, filmY, filmH } = VERTICAL
  const canvas = document.createElement('canvas')
  canvas.width = w
  canvas.height = h
  const ctx = canvas.getContext('2d')!

  // Soft darkening behind each band keeps the type legible over any scene.
  for (const [y, r] of [
    [360, 520],
    [1440, 520]
  ] as [number, number][]) {
    const g = ctx.createRadialGradient(w / 2, y, 0, w / 2, y, r)
    g.addColorStop(0, 'rgba(10, 10, 9, 0.72)')
    g.addColorStop(1, 'rgba(10, 10, 9, 0)')
    ctx.fillStyle = g
    ctx.fillRect(0, y - r, w, r * 2)
  }

  // Top: the Eclipse and the hook question.
  softGlow(ctx, w / 2, 250, 170, C.peach, 0.18)
  eclipse(ctx, w / 2, 250, 44, { lensColor: '#f7f5ef' })
  const head: TextStyle = {
    size: 86,
    weight: 800,
    tracking: -0.04,
    color: C.paper,
    align: 'center'
  }
  text(ctx, 'How will AI change', w / 2, 420, head)
  text(ctx, 'our future?', w / 2, 515, head)

  // Prism hairlines frame the film.
  ctx.fillStyle = prismGradient(ctx, 0, 0, w, 0)
  ctx.fillRect(0, filmY - 4, w, 4)
  ctx.fillRect(0, filmY + filmH, w, 4)

  // Bottom: the call to action.
  text(ctx, 'Map your AI worldview', w / 2, 1352, {
    size: 60,
    weight: 700,
    tracking: -0.03,
    color: C.paper,
    align: 'center'
  })
  const url: TextStyle = {
    size: 50,
    weight: 750,
    tracking: -0.02,
    color: C.ink
  }
  const pw = measure(ctx, 'doom-or-bloom.com', url) + 100
  const ph = 94
  ctx.save()
  ctx.shadowBlur = 36
  ctx.shadowColor = 'rgba(230, 255, 128, 0.3)'
  rrect(
    ctx,
    (w - pw) / 2,
    1408,
    pw,
    ph,
    ph / 2,
    prismGradient(ctx, (w - pw) / 2, 0, (w + pw) / 2, 0)
  )
  ctx.restore()
  text(ctx, 'doom-or-bloom.com', w / 2, 1408 + ph / 2 + 17, {
    ...url,
    align: 'center'
  })
  text(ctx, 'FREE  ·  OPEN SOURCE  ·  NO SIGN-UP', w / 2, 1580, {
    family: 'mono',
    size: 24,
    weight: 500,
    tracking: 0.08,
    color: '#b8b7ad',
    align: 'center'
  })
  return { png: canvas.toDataURL('image/png'), ...VERTICAL }
}
