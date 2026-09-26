// Full render: parallel headless workers → lossless-ish segments → final H.264 + AAC.
// Usage: node scripts/render.mjs [--workers 6] [--from 0] [--to FRAMES] [--samples N] [--out out/file.mp4] [--crf 16]
import { chromium } from 'playwright-core'
import { spawn } from 'node:child_process'
import { mkdir, rm, writeFile } from 'node:fs/promises'
import { chromeArgs, startServer } from './server.mjs'

const opt = {
  workers: 6,
  from: 0,
  to: undefined,
  samples: undefined,
  out: 'out/doom-or-bloom-launch.mp4',
  crf: 16
}
const argv = process.argv.slice(2)
for (let i = 0; i < argv.length; i += 2)
  opt[argv[i].replace(/^--/, '')] = isNaN(Number(argv[i + 1]))
    ? argv[i + 1]
    : Number(argv[i + 1])

const run = (cmd, args, stdio = 'inherit') =>
  new Promise((res, rej) => {
    const p = spawn(cmd, args, { stdio })
    p.on('exit', (c) =>
      c === 0 ? res() : rej(new Error(`${cmd} exited ${c}`))
    )
  })

const { url, close } = await startServer()
await rm('out/segments', { recursive: true, force: true })
await mkdir('out/segments', { recursive: true })
const probe = await chromium.launch({ headless: true, args: chromeArgs })
const pp = await probe.newPage()
await pp.goto(url)
const total = await pp.evaluate(() => window.FRAMES)
await probe.close()
const from = opt.from
const to = opt.to ?? total
const n = to - from
const per = Math.ceil(n / opt.workers)
const started = Date.now()
let done = 0
const log = () => {
  const el = (Date.now() - started) / 1000
  const fps = done / el
  process.stdout.write(
    `\r${done}/${n} frames  ${fps.toFixed(1)} fps  ETA ${((n - done) / Math.max(fps, 0.01)).toFixed(0)}s   `
  )
}
const segs = []
await Promise.all(
  Array.from({ length: opt.workers }, async (_, w) => {
    const a = from + w * per
    const b = Math.min(to, a + per)
    if (a >= b) return
    const seg = `out/segments/seg-${String(w).padStart(2, '0')}.mkv`
    segs[w] = seg
    const ff = spawn(
      'ffmpeg',
      [
        '-hide_banner',
        '-loglevel',
        'error',
        '-y',
        '-f',
        'image2pipe',
        '-framerate',
        '60',
        '-c:v',
        'png',
        '-i',
        '-',
        '-c:v',
        'libx264',
        '-preset',
        'veryfast',
        '-qp',
        '0',
        '-pix_fmt',
        'yuv444p',
        seg
      ],
      { stdio: ['pipe', 'inherit', 'inherit'] }
    )
    const ffDone = new Promise((res, rej) =>
      ff.on('exit', (c) => (c === 0 ? res() : rej(new Error('ffmpeg failed'))))
    )
    const browser = await chromium.launch({ headless: true, args: chromeArgs })
    const page = await browser.newPage({
      viewport: { width: 1920, height: 1080 },
      deviceScaleFactor: 1
    })
    page.on('pageerror', (e) => console.log('\n[pageerror]', e.message))
    // Generous timeouts: seven GPU workers start at once.
    page.setDefaultTimeout(180_000)
    await page.goto(url)
    await page.evaluate(() => window.__ready)
    for (let f = a; f < b; f++) {
      await page.evaluate(
        ([f, s]) => window.renderFrame(f, s),
        [f, opt.samples]
      )
      const buf = await page.screenshot({
        type: 'png',
        clip: { x: 0, y: 0, width: 1920, height: 1080 }
      })
      if (!ff.stdin.write(buf))
        await new Promise((r) => ff.stdin.once('drain', r))
      done++
      if (done % 10 === 0) log()
    }
    ff.stdin.end()
    await ffDone
    await browser.close()
  })
)
log()
console.log(
  `\nRendered ${n} frames in ${((Date.now() - started) / 1000).toFixed(0)}s`
)
close()
const list = segs
  .filter(Boolean)
  .map((s) => `file '${s.replace('out/', '')}'`)
  .join('\n')
await writeFile('out/segments.txt', list)
const startSec = (from / 60).toFixed(4)
const durSec = (n / 60).toFixed(4)
await run('ffmpeg', [
  '-hide_banner',
  '-loglevel',
  'error',
  '-y',
  '-f',
  'concat',
  '-safe',
  '0',
  '-i',
  'out/segments.txt',
  '-ss',
  startSec,
  '-t',
  durSec,
  '-i',
  'public/soundtrack.wav',
  '-map',
  '0:v',
  '-map',
  '1:a',
  '-c:v',
  'libx264',
  '-preset',
  'slow',
  '-crf',
  String(opt.crf),
  '-tune',
  'film',
  '-pix_fmt',
  'yuv420p',
  '-profile:v',
  'high',
  '-r',
  '60',
  '-c:a',
  'aac',
  '-b:a',
  '320k',
  '-movflags',
  '+faststart',
  '-shortest',
  opt.out
])
console.log(`Wrote ${opt.out}`)
