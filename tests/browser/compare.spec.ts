import type { BrowserContext, Page } from '@playwright/test'
import { expect, test, skipSelfPlacement } from './fixtures'

const buckets = /^(Very aligned|Mostly aligned|Some distance|Worlds apart)$/

// Fixture judgments place the map after one answer; this does not test live semantics.
async function answerAndReveal(page: Page) {
  await expect(page).toHaveURL(/\/assessments\/[a-f0-9-]+$/)
  await page
    .getByLabel('Your answer', { exact: true })
    .fill('I expect useful tools and serious risks, depending on oversight.')
  await page.getByRole('button', { name: /^Continue/ }).click()
  await page.getByRole('button', { name: 'View my results' }).click()
  await skipSelfPlacement(page)
}

async function cleanup(context: BrowserContext, baseURL: string) {
  const response = await context.request.get(`${baseURL}/api/assessments`)
  if (!response.ok()) return
  const items = (await response.json()) as { id: string }[]
  for (const item of items)
    await context.request.delete(`${baseURL}/api/assessments/${item.id}`, {
      headers: { origin: baseURL }
    })
}

test('a thought leader’s page starts a comparison drawn on the result map', async ({
  page
}) => {
  await page.goto('/users/karpathy')
  const name = (await page
    .getByRole('heading', { level: 1 })
    .textContent())!.trim()
  const cta = page
    .locator('[data-slot="card"]')
    .filter({ hasText: `Where do you land vs ${name}?` })
    .getByRole('link', { name: 'Map my worldview' })
  await expect(cta).toHaveAttribute(
    'href',
    '/assessments?start=1&compare=persona%3Akarpathy'
  )
  await cta.click()
  await answerAndReveal(page)

  const comparison = page.getByRole('region', { name: `You vs ${name}` })
  await expect(comparison).toBeVisible()
  await expect(comparison.locator('[data-slot="card-title"]')).toHaveText(
    buckets
  )
  await expect(comparison).toContainText('simulated from public sources')
  await expect(
    comparison.getByRole('link', { name: `See ${name}’s result` })
  ).toHaveAttribute('href', '/users/karpathy')
  // The thought leader's point joins the participant's on the same map.
  const marker = page.locator('[data-slot="worldview-map-other"]')
  await expect(marker).toHaveCount(1)
  await expect(marker).toHaveAttribute('aria-label', `${name}’s position`)
  await expect(marker.locator('image')).toHaveCount(1)
  // Reloading keeps the comparison for this result.
  await page.reload()
  await expect(comparison).toBeVisible()
})

test('a friend’s card-only link leads to a comparison, sent back as their own link', async ({
  page,
  browser,
  baseURL
}) => {
  // The sharer names their link and copies it.
  await page.goto('/assessment')
  await page
    .getByRole('link', { name: 'Map your own worldview', exact: true })
    .last()
    .click()
  await answerAndReveal(page)
  await page.context().grantPermissions(['clipboard-read', 'clipboard-write'])
  const bar = page.getByRole('region', { name: 'Share your result' })
  await bar.getByLabel('Name on your link').fill('Sam')
  await bar.getByRole('button', { name: 'Copy link' }).click()
  await expect(page.getByText('Link copied.', { exact: true })).toBeVisible()
  await expect(
    bar.getByText('Anyone with your link sees only your card')
  ).toBeVisible()
  const shared = new URL(
    await page.evaluate(() => navigator.clipboard.readText())
  )
  expect(shared.pathname).toMatch(/^\/s\/[A-Za-z0-9_-]{16}$/)
  expect(shared.searchParams.get('ref')).toBe('share-copy-link')

  // The recipient sees only the card, then compares.
  const friend = await browser.newContext({ baseURL })
  try {
    await friend.addInitScript(() => {
      // Desktop browsers without Web Share copy the link instead.
      Object.defineProperty(navigator, 'share', { value: undefined })
    })
    await friend.grantPermissions(['clipboard-read', 'clipboard-write'])
    const recipient = await friend.newPage()
    // Every language renders the card page with its own messages.
    const missing: string[] = []
    recipient.on('console', (message) => {
      if (message.text().includes('MISSING_MESSAGE'))
        missing.push(message.text())
    })
    await recipient.goto(`/es${shared.pathname}`)
    await expect(
      recipient.getByRole('heading', {
        level: 1,
        name: 'Sam mapeó su visión de la IA'
      })
    ).toBeVisible()
    await expect(
      recipient.getByRole('link', { name: 'Comparar ahora' }).first()
    ).toHaveAttribute(
      'href',
      `/es/assessments?start=1&compare=${shared.pathname.slice(3)}`
    )
    expect(missing).toEqual([])
    await recipient.goto(`${shared.pathname}?ref=share-x`)
    await expect(
      recipient.getByRole('heading', {
        level: 1,
        name: 'Sam mapped their AI worldview'
      })
    ).toBeVisible()
    // The sharer's answers never reach the page.
    await expect(
      recipient.getByText('useful tools and serious risks')
    ).toHaveCount(0)
    await recipient
      .getByRole('region', { name: 'Where do you land?' })
      .getByRole('link', { name: 'Compare now' })
      .click()
    await answerAndReveal(recipient)
    const comparison = recipient.getByRole('region', { name: 'You vs Sam' })
    await expect(comparison.locator('[data-slot="card-title"]')).toHaveText(
      buckets
    )
    await expect(comparison).toContainText('Compared in your browser')
    await expect(comparison.getByText('Sam', { exact: true })).toBeVisible()
    const marker = recipient.locator('[data-slot="worldview-map-other"]')
    await expect(marker).toHaveAttribute('aria-label', 'Sam’s position')

    await comparison
      .getByRole('button', { name: 'Send them your result' })
      .click()
    await expect(recipient.getByText('Link copied. Send it back')).toBeVisible()
    const back = new URL(
      await recipient.evaluate(() => navigator.clipboard.readText())
    )
    expect(back.pathname).toMatch(/^\/s\/[A-Za-z0-9_-]{16}$/)
    expect(back.pathname).not.toBe(shared.pathname)
    expect(back.searchParams.get('ref')).toBe('compare')

    // A returning visitor compares an existing result from the library.
    await recipient.goto(shared.pathname)
    await recipient
      .getByRole('region', { name: 'Where do you land?' })
      .getByRole('link', { name: 'Compare now' })
      .click()
    await expect(recipient).toHaveURL(/\/assessments\?compare=/)
    await recipient
      .getByRole('button', { name: 'Compare with my latest result' })
      .click()
    await expect(comparison).toBeVisible()

    // Once the sharer stops sharing, the comparison says so.
    await bar.getByRole('button', { name: 'Stop sharing link' }).click()
    await expect(page.getByText('Sharing stopped')).toBeVisible()
    await recipient.reload()
    await expect(
      recipient.getByText('This comparison link was turned off')
    ).toBeVisible()
    await expect(comparison).toHaveCount(0)
  } finally {
    await cleanup(friend, baseURL!)
    await friend.close()
  }
})
