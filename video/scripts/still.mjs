// Usage: node scripts/still.mjs [--samples N] [--prefix name] <frame|12.5s|b18.25> ...
import { chromium } from 'playwright-core'
import { mkdir, writeFile } from 'node:fs/promises'
import { chromeArgs, startServer } from './server.mjs'

const args = process.argv.slice(2)
let samples
let prefix = 'f'
const specs = []
for (let i = 0; i < args.length; i++) {
  if (args[i] === '--samples') samples = Number(args[++i])
  else if (args[i] === '--prefix') prefix = args[++i]
  else specs.push(args[i])
}
const FPS = 60
const toFrame = (s) => {
  if (s.endsWith('s')) return Math.round(parseFloat(s) * FPS)
  if (s.startsWith('b'))
    return Math.round(
      (parseFloat(s.slice(1)) * 0.48 + 37.558 - 44.0 - 0.012) * FPS
    )
  return Number(s)
}
const { url, close } = await startServer()
const browser = await chromium.launch({ headless: true, args: chromeArgs })
const page = await browser.newPage({
  viewport: { width: 1920, height: 1080 },
  deviceScaleFactor: 1
})
page.on('console', (m) => {
  if (m.type() === 'error' || m.type() === 'warning')
    console.log('[page]', m.text())
})
page.on('pageerror', (e) => console.log('[pageerror]', e.message))
await page.goto(url)
await page.evaluate(() => window.__ready)
await mkdir('out/stills', { recursive: true })
for (const s of specs) {
  const f = toFrame(s)
  const ms = await page.evaluate(
    ([f, n]) => window.renderFrame(f, n),
    [f, samples]
  )
  const buf = await page.screenshot({
    type: 'png',
    clip: { x: 0, y: 0, width: 1920, height: 1080 }
  })
  const name = `out/stills/${prefix}${String(f).padStart(4, '0')}.png`
  await writeFile(name, buf)
  console.log(
    `${name}  t=${(f / FPS).toFixed(3)}s  beat=${((f / FPS + 0.012 + 44 - 37.558) / 0.48).toFixed(2)}  ${ms.toFixed(0)}ms`
  )
}
await browser.close()
close()
