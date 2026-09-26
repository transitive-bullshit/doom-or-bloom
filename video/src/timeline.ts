import type { Ctx } from './engine/draw'
import type { Fx } from './engine/post'
import { beatAtTime, H, W } from './engine/timing'
import type { S, SceneFn } from './scenes/common'
import { drawHook } from './scenes/hook'
import {
  drawDivide,
  drawStakes,
  drawTakes,
  drawTribal,
  drawTurn,
  drawWeeks
} from './scenes/act1'
import {
  drawDrop,
  drawInterview,
  drawMapScene,
  drawResults,
  drawYouLand
} from './scenes/act2'
import {
  drawBelieve,
  drawClosest,
  drawEnd,
  drawFree,
  drawFuture,
  drawWhy
} from './scenes/act3'

interface Entry {
  from: number
  to: number
  draw: SceneFn
}

// Scenes are keyed to global beat positions (see engine/timing.ts).
const scenes: Entry[] = [
  { from: -999, to: 18, draw: drawHook },
  { from: 18, to: 22, draw: drawStakes },
  { from: 22, to: 26, draw: drawWeeks },
  { from: 26, to: 30, draw: drawDivide },
  { from: 30, to: 38, draw: drawTakes },
  { from: 38, to: 42, draw: drawTribal },
  { from: 42, to: 50, draw: drawTurn },
  { from: 50, to: 54, draw: drawDrop },
  { from: 54, to: 62, draw: drawMapScene },
  { from: 62, to: 74, draw: drawInterview },
  { from: 74, to: 78, draw: drawYouLand },
  { from: 78, to: 82, draw: drawResults },
  { from: 82, to: 86, draw: drawBelieve },
  { from: 86, to: 90, draw: drawWhy },
  { from: 90, to: 94, draw: drawClosest },
  { from: 94, to: 98, draw: drawFree },
  { from: 98, to: 111.4, draw: drawFuture },
  { from: 111.4, to: 999, draw: drawEnd }
]

export function drawFrame(ctx: Ctx, t: number, fx: Fx) {
  const b = beatAtTime(t)
  const s: S = { t, b, fx, W, H }
  for (const sc of scenes) {
    if (b >= sc.from && b < sc.to) {
      ctx.save()
      sc.draw(ctx, s)
      ctx.restore()
    }
  }
}
