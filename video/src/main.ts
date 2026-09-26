import { loadAssets } from './engine/assets'
import { defaultFx, Post } from './engine/post'
import { DURATION, FPS, FRAMES, H, W } from './engine/timing'
import { drawFrame } from './timeline'

// The capture scripts drive rendering through these globals.
const host = window as unknown as {
  __ready: Promise<void>
  renderFrame: (frame: number, samples?: number) => number
  FRAMES: number
  FPS: number
}

const out = document.getElementById('out') as HTMLCanvasElement
out.width = W
out.height = H
const layer = document.createElement('canvas')
layer.width = W
layer.height = H
const ctx = layer.getContext('2d', { alpha: true })!
const post = new Post(out, W, H)

const resetCtx = () => {
  ctx.setTransform(1, 0, 0, 1, 0, 0)
  ctx.globalAlpha = 1
  ctx.globalCompositeOperation = 'source-over'
  ctx.filter = 'none'
  ctx.shadowBlur = 0
  ctx.shadowColor = 'transparent'
  ctx.shadowOffsetX = 0
  ctx.shadowOffsetY = 0
  ctx.setLineDash([])
  ctx.clearRect(0, 0, W, H)
  ctx.imageSmoothingQuality = 'high'
}

/** Render one output frame with sub-frame motion blur. Returns ms taken. */
function renderFrame(frame: number, samplesOverride?: number) {
  const t0 = performance.now()
  const t = frame / FPS
  const fx = defaultFx()
  resetCtx()
  drawFrame(ctx, t, fx)
  const samples = Math.max(
    1,
    Math.min(64, Math.round(samplesOverride ?? fx.samples))
  )
  post.beginFrame()
  if (samples === 1) {
    post.addSubframe(layer, fx, 1)
  } else {
    for (let i = 0; i < samples; i++) {
      const dt = ((i + 0.5) / samples - 0.5) * fx.shutter
      const sub = defaultFx()
      resetCtx()
      drawFrame(ctx, (frame + dt) / FPS, sub)
      post.addSubframe(layer, sub, 1 / samples)
    }
  }
  post.finish(fx, frame)
  return performance.now() - t0
}

host.renderFrame = renderFrame
host.FRAMES = FRAMES
host.FPS = FPS
host.__ready = loadAssets()

// Real-time preview: `index.html?preview` plays with audio and a scrubber.
if (new URLSearchParams(location.search).has('preview')) {
  document.body.classList.add('preview')
  const audio = document.getElementById('audio') as HTMLAudioElement
  const play = document.getElementById('play') as HTMLButtonElement
  const track = document.getElementById('track') as HTMLDivElement
  const fillEl = document.getElementById('fill') as HTMLDivElement
  const clock = document.getElementById('clock') as HTMLSpanElement
  const toggle = () => {
    if (audio.paused) void audio.play()
    else audio.pause()
  }
  play.onclick = toggle
  window.addEventListener('keydown', (e) => {
    if (e.code === 'Space') {
      e.preventDefault()
      toggle()
    }
    if (e.code === 'ArrowLeft')
      audio.currentTime = Math.max(0, audio.currentTime - 1)
    if (e.code === 'ArrowRight')
      audio.currentTime = Math.min(DURATION, audio.currentTime + 1)
  })
  track.onclick = (e) => {
    const r = track.getBoundingClientRect()
    audio.currentTime = ((e.clientX - r.left) / r.width) * DURATION
  }
  void host.__ready.then(() => {
    const loop = () => {
      const t = audio.currentTime
      renderFrame(Math.min(FRAMES - 1, Math.floor(t * FPS)), 1)
      fillEl.style.width = `${(t / DURATION) * 100}%`
      clock.textContent = `${t.toFixed(2)}s`
      play.textContent = audio.paused ? 'Play' : 'Pause'
      requestAnimationFrame(loop)
    }
    loop()
  })
}
