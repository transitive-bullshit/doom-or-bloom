// 9:16 cut for TikTok, Reels and Shorts: the 16:9 film between branded bands,
// over a blurred copy of itself. Usage: node scripts/vertical.mjs [in.mp4] [out.mp4] [audio.wav]
import { chromium } from 'playwright-core'
import { spawn } from 'node:child_process'
import { writeFile } from 'node:fs/promises'
import { chromeArgs, startServer } from './server.mjs'

const [
  input = 'out/doom-or-bloom-launch.mp4',
  output = 'out/doom-or-bloom-launch-vertical.mp4',
  audio
] = process.argv.slice(2)
const overlay = 'out/vertical-overlay.png'

const { url, close } = await startServer()
const browser = await chromium.launch({ headless: true, args: chromeArgs })
const page = await browser.newPage()
await page.goto(url)
await page.evaluate(() => window.__ready)
const { png, w, h, filmY, filmH, frames, fps } = await page.evaluate(() => ({
  ...window.renderVerticalOverlay(),
  frames: window.FRAMES,
  fps: window.FPS
}))
await writeFile(overlay, Buffer.from(png.split(',')[1], 'base64'))
await browser.close()
close()

// The film sits between the bands; the background is blurred at quarter
// resolution, then scaled back up.
const graph = [
  '[0:v]split=2[a][b]',
  `[a]scale=-2:${h / 4},crop=${w / 4}:${h / 4},gblur=sigma=9:steps=2,scale=${w}:${h}:flags=bicubic,eq=brightness=-0.34:contrast=0.92:saturation=1.45[bg]`,
  `[b]scale=${w}:${filmH}:flags=lanczos[fg]`,
  `[bg][fg]overlay=0:${filmY}[base]`,
  '[base][1:v]overlay=0:0:format=auto,format=yuv420p[out]'
].join(';')
const args = [
  '-hide_banner',
  '-loglevel',
  'error',
  '-y',
  '-i',
  input,
  '-loop',
  '1',
  '-framerate',
  String(fps),
  '-i',
  overlay
]
if (audio) args.push('-i', audio)
args.push(
  '-filter_complex',
  graph,
  '-map',
  '[out]',
  '-map',
  audio ? '2:a' : '0:a',
  '-c:v',
  'libx264',
  '-preset',
  'slow',
  '-crf',
  '17',
  '-tune',
  'film',
  '-profile:v',
  'high',
  '-r',
  String(fps),
  '-c:a',
  'aac',
  '-b:a',
  '320k',
  '-movflags',
  '+faststart',
  '-t',
  String(frames / fps),
  output
)
await new Promise((res, rej) =>
  spawn('ffmpeg', args, { stdio: 'inherit' }).on('exit', (c) =>
    c === 0 ? res() : rej(new Error(`ffmpeg exited ${c}`))
  )
)
console.log(`Wrote ${output}`)
