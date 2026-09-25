import { readFile, writeFile } from 'node:fs/promises'
import { expect, test } from '@playwright/test'

test('build-time public shares serve cached HTML and RSC with the database unavailable', async ({
  request
}) => {
  const manifest = JSON.parse(
    await readFile('.next/prerender-manifest.json', 'utf8')
  )
  const paths = Object.keys(manifest.routes).filter((path) =>
    path.startsWith('/public/assessments/')
  )
  test.skip(
    paths.length === 0,
    'No public participant assessments at build time'
  )
  for (const path of paths) {
    expect(manifest.routes[path].initialRevalidateSeconds).toBe(172800)
    for (const headers of [{}, { RSC: '1' }] as Record<string, string>[]) {
      const response = await request.get(path, { headers })
      expect(response.status(), path).toBe(200)
      expect(response.headers()['x-nextjs-cache'], path).toBe('HIT')
      expect(response.headers()['cache-control'], path).toContain(
        's-maxage=172800'
      )
    }
  }
})

test('every built profile serves initial HTML and RSC without a database', async ({
  request
}) => {
  const manifest = JSON.parse(
    await readFile('.next/prerender-manifest.json', 'utf8')
  )
  const profiles = Object.keys(manifest.routes).filter((path) =>
    path.startsWith('/users/')
  )
  expect(profiles.length).toBeGreaterThan(0)
  for (const path of profiles) {
    const response = await request.get(path)
    expect(response.status(), path).toBe(200)
    expect(response.headers()['x-nextjs-cache'], path).toBe('HIT')
    const html = await response.text()
    expect(html, path).toContain('Simulated Assessment')
    expect(html, path).toContain('id="answer-1"')
    const rsc = await request.get(path, { headers: { RSC: '1' } })
    expect(rsc.status(), path).toBe(200)
    expect(rsc.headers()['content-type'], path).toContain('text/x-component')
    expect(rsc.headers()['x-nextjs-cache'], path).toBe('HIT')
  }
})

test('proximity warms at most three profiles, cancels passing intent, and reuses one on click', async ({
  page
}, testInfo) => {
  // Session personalization remains separate from the static profile.
  await page.route('**/api/auth/get-session*', (route) =>
    route.fulfill({ json: null })
  )
  const requests: string[] = []
  page.on('request', (request) => {
    const url = new URL(request.url())
    if (url.pathname.startsWith('/users/') && request.headers().rsc === '1')
      requests.push(url.pathname)
  })
  await page.goto('/users')
  await expect(page.locator('.study-chart')).toHaveAttribute(
    'data-portraits-ready',
    'true'
  )
  await expect(page.locator('.study-chart')).toHaveAttribute(
    'data-layout-ready',
    'true'
  )
  await page.mouse.move(0, 0)
  // Give viewport-driven prefetching enough time to reveal an accidental flood.
  await page.waitForTimeout(400)
  expect(requests).toEqual([])

  const target = await page.locator('.study-chart').evaluate((chart) => {
    const bounds = chart.getBoundingClientRect()
    const points = Array.from(
      chart.querySelectorAll<HTMLAnchorElement>('.study-portrait'),
      (link) => {
        const rect = link.getBoundingClientRect()
        return {
          href: link.getAttribute('href')!,
          x: rect.left + rect.width / 2,
          y: rect.top + rect.height / 2,
          radius: rect.width / 2
        }
      }
    )
    // Find an empty patch near a portrait; there must be no actual link hover.
    for (const point of points) {
      for (const [dx, dy] of [
        [1, 0],
        [-1, 0],
        [0, 1],
        [0, -1]
      ]) {
        const x = point.x + dx! * (point.radius + 18)
        const y = point.y + dy! * (point.radius + 18)
        if (
          x <= bounds.left ||
          x >= bounds.right ||
          y <= bounds.top ||
          y >= Math.min(bounds.bottom, innerHeight)
        )
          continue
        const node = document.elementFromPoint(x, y)
        if (!node || !chart.contains(node) || node.closest('a')) continue
        const nearest = [...points].sort(
          (a, b) =>
            Math.hypot(a.x - x, a.y - y) -
            a.radius -
            (Math.hypot(b.x - x, b.y - y) - b.radius)
        )[0]!
        return { x, y, href: nearest.href }
      }
    }
    return null
  })
  expect(target).not.toBeNull()
  await page.mouse.move(target!.x, target!.y)
  await page.mouse.move(0, 0)
  await page.waitForTimeout(400)
  expect(requests).toEqual([])

  const warmed = page.waitForResponse(
    (response) =>
      new URL(response.url()).pathname === target!.href &&
      response.request().headers().rsc === '1'
  )
  await page.mouse.move(target!.x, target!.y)
  await (await warmed).finished()
  // Ensure all route segments have settled before checking click-time reuse.
  await page.waitForTimeout(300)
  expect(requests).toContain(target!.href)
  expect(new Set(requests).size).toBeLessThanOrEqual(3)
  await page.mouse.move(0, 0)
  const count = requests.length
  const start = Date.now()
  await page.locator(`.study-portrait[href="${target!.href}"]`).click()
  await expect(page.locator('[data-slot="worldview-map"]')).toBeVisible()
  await expect(page).toHaveURL(new RegExp(`${target!.href}$`))
  expect(requests).toHaveLength(count)
  const evidence = testInfo.outputPath('prefetched-navigation.json')
  await writeFile(
    evidence,
    JSON.stringify({
      href: target!.href,
      clickToVisibleMs: Date.now() - start,
      clickTimeProfileRequests: requests.length - count
    })
  )
  await testInfo.attach('prefetched-navigation.json', {
    path: evidence,
    contentType: 'application/json'
  })
})

test('keyboard focus warms a directory profile without viewport prefetching', async ({
  page
}) => {
  await page.route('**/api/auth/get-session*', (route) =>
    route.fulfill({ json: null })
  )
  await page.goto('/users')
  const link = page.locator('.study-legend a[href="/users/simonw"]')
  const warmed = page.waitForResponse(
    (response) =>
      new URL(response.url()).pathname === '/users/simonw' &&
      response.request().headers().rsc === '1'
  )
  await link.focus()
  await (await warmed).finished()
  // Stay in the focused link's viewport so this exercises pointer priority,
  // independently of the intentional cancellation while scrolling.
  const neighbor = link.locator('xpath=preceding-sibling::a[1]')
  const neighborPath = await neighbor.getAttribute('href')
  const pointerWarm = page.waitForResponse(
    (response) =>
      new URL(response.url()).pathname === neighborPath &&
      response.request().headers().rsc === '1'
  )
  await neighbor.hover()
  await (await pointerWarm).finished()
  await page.keyboard.press('Enter')
  await expect(page).toHaveURL(/\/users\/simonw$/)
  await expect(
    page.getByRole('heading', { level: 1, name: 'Simon Willison' })
  ).toBeVisible()
})

test('data saver suppresses speculative profile requests', async ({ page }) => {
  await page.addInitScript(() => {
    Object.defineProperty(navigator, 'connection', {
      value: Object.assign(new EventTarget(), {
        saveData: true,
        effectiveType: '4g'
      })
    })
  })
  await page.route('**/api/auth/get-session*', (route) =>
    route.fulfill({ json: null })
  )
  const requests: string[] = []
  page.on('request', (request) => {
    if (new URL(request.url()).pathname.startsWith('/users/'))
      requests.push(request.url())
  })
  await page.goto('/users')
  await page.locator('.study-legend a[href="/users/simonw"]').hover()
  await page.waitForTimeout(500)
  expect(requests).toEqual([])
})
