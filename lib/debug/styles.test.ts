import { readFileSync } from 'node:fs'
import { loadBindings } from 'next/dist/build/swc/index.js'
import { expect, test } from 'vitest'

test('global CSS compiles through Next with color fallbacks enabled', async () => {
  const bindings = await loadBindings()
  // Turbopack's compiler panics when an OKLCH shadow requires a color fallback
  // alongside a currentColor shadow. Exercise the real stylesheet and compiler.
  const result = await bindings.css.lightning.transform({
    filename: 'globals.css',
    code: readFileSync(new URL('../../app/globals.css', import.meta.url)),
    targets: { chrome: 80 << 16, safari: 13 << 16 },
    minify: false
  })
  expect(result.code.length).toBeGreaterThan(0)
})
