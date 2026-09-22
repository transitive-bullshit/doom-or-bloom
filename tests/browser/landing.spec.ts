import { personaIdentity } from '../../lib/journeys/persona-identity'
import { expect, test } from '@playwright/test'

test('landing portraits use tooltips and link to results; assessment drafts survive a trip home', async ({
  page
}) => {
  await page.goto('/')
  await expect(
    page.getByRole('heading', { name: 'How will AI change our future?' })
  ).toBeVisible()
  const portrait = page.getByRole('link', {
    name: 'View Eliezer Yudkowsky results'
  })
  await expect(portrait).not.toHaveAttribute('title')
  await portrait.hover()
  await expect(portrait.locator('span')).toHaveText('Eliezer Yudkowsky')
  await expect(portrait.locator('span')).toHaveCSS('opacity', '1')
  await portrait.click()
  await expect(page).toHaveURL(/\/users\/esyudkowsky$/)
  await expect(page.locator('[data-slot=worldview-map]')).toHaveCount(1)
  await expect(
    page.getByText('Eliezer Yudkowsky’s estimated P(doom)', { exact: true })
  ).toBeVisible()
  await expect(
    page.getByText('What his outlook hinges on', { exact: true })
  ).toBeVisible()
  const marker = page.locator('[data-persona-marker="Eliezer Yudkowsky"]')
  await expect(marker.locator('image')).toHaveAttribute(
    'href',
    '/personas/yudkowsky.jpg'
  )
  await expect(page.getByText('Your view', { exact: true })).toHaveCount(0)
  const sources = page.getByRole('region', { name: 'Sources', exact: true })
  await expect(sources.getByRole('heading', { name: 'Sources' })).toBeVisible()
  await expect(sources.getByRole('link').first()).toHaveAttribute(
    'href',
    'https://time.com/6266923/ai-eliezer-yudkowsky-open-letter-not-enough/'
  )
  await expect(
    page.getByRole('region', { name: 'More details' })
  ).toContainText('Human influence')
  await page
    .getByRole('link', { name: 'Map your own worldview' })
    .first()
    .click()
  await expect(page).toHaveURL(/\/assessment$/)
  const answer = page.getByLabel('Your answer', { exact: true })
  await answer.fill('A draft that should survive navigation.')
  await page.getByRole('link', { name: 'Doom or Bloom', exact: true }).click()
  await page.getByRole('link', { name: 'Map your own worldview' }).click()
  await expect(answer).toHaveValue('A draft that should survive navigation.')
  await page.goBack()
  await expect(
    page.getByRole('heading', { name: 'How will AI change our future?' })
  ).toBeVisible()
  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto('/')
  expect(
    await page.evaluate(() => document.documentElement.scrollWidth)
  ).toBeLessThanOrEqual(390)
  await expect(
    page.getByRole('link', { name: 'Map your own worldview' })
  ).toBeInViewport()
})

test('featured portraits stay square and inside their circular frames', async ({
  page
}) => {
  for (const width of [1280, 390]) {
    await page.setViewportSize({ width, height: 900 })
    await page.goto('/')
    const portraits = page.locator('.study-point')
    await expect(portraits.first()).toBeVisible()
    await portraits.evaluateAll(async (elements) => {
      await Promise.all(
        elements.map((element) => element.querySelector('img')!.decode())
      )
    })
    const overflow = await portraits.evaluateAll((elements) =>
      elements.flatMap((element) => {
        const image = element.querySelector('img')!.getBoundingClientRect()
        const frame = element.getBoundingClientRect()
        return Math.abs(image.width - image.height) > 0.5 ||
          image.bottom > frame.bottom ||
          image.right > frame.right
          ? [
              {
                person: element.getAttribute('aria-label'),
                image: [image.width, image.height],
                frame: [frame.width, frame.height]
              }
            ]
          : []
      })
    )
    expect(overflow).toEqual([])
  }
})

test('persona framing uses her/their and exports the portrait in the map', async ({
  page
}, testInfo) => {
  const errors: string[] = []
  page.on('pageerror', (error) => errors.push(error.message))
  await page.goto('/users/drfeifei')
  await expect(
    page.getByText('What her outlook hinges on', { exact: true })
  ).toBeVisible()
  const map = page.locator('[data-slot=worldview-map]')
  await expect(map.locator('[data-persona-marker] image')).toHaveAttribute(
    'href',
    '/personas/li.jpg'
  )
  await expect(map.locator('.map-stat')).toHaveCount(0)
  await expect(map.getByRole('heading', { level: 2 })).toHaveCSS(
    'font-size',
    '36px'
  )
  const portrait = map.locator('[data-persona-marker]')
  const summary = (await portrait.getAttribute('aria-label'))!.replace(
    'Fei-Fei Li: ',
    ''
  )
  await expect(map.locator('p').filter({ hasText: summary })).toHaveCount(0)
  await portrait.hover()
  await expect(page.getByRole('tooltip')).toHaveCount(0)
  await expect(portrait).toHaveCSS('cursor', 'auto')
  await expect(portrait).not.toHaveAttribute('tabindex')
  const downloading = page.waitForEvent('download')
  await map.getByRole('button', { name: 'Map image actions' }).click()
  await page.getByRole('menuitem', { name: 'Download PNG' }).click()
  await (await downloading).saveAs(testInfo.outputPath('persona-map.png'))
  await page.goto('/users/tszzl')
  await expect(
    page.getByText('What their outlook hinges on', { exact: true })
  ).toBeVisible()
  expect(errors).toEqual([])
})

test('persona probability uses a dated public statement with its outcome and source', async ({
  page
}) => {
  await page.goto('/users/noahpinion')
  await expect(
    page.getByText('Noah Smith’s stated P(doom)', { exact: true })
  ).toBeVisible()
  await expect(page.getByText('≈10%', { exact: true })).toBeVisible()
  await expect(
    page.getByText(
      'Civilization collapse from AI-enabled bioterrorism; not human extinction',
      { exact: true }
    )
  ).toBeVisible()
  await expect(page.getByText(/Public statement from 2026-08-28/)).toBeVisible()
  await expect(page.getByText(/Separately states 30%/)).toBeVisible()
})

test('new safety researchers have live results, portraits and grounded sources', async ({
  page
}) => {
  for (const person of [
    {
      id: 'superintelligence-stop-advocate',
      name: 'Nate Soares',
      video: 'https://www.youtube.com/watch?v=98syxABbUPk',
      avatar: 'soares'
    },
    {
      id: 'empirical-control-researcher',
      name: 'Ryan Greenblatt',
      video: 'https://www.youtube.com/watch?v=-RXD4bTuFTo',
      avatar: 'greenblatt'
    }
  ]) {
    await page.goto(`/users/${personaIdentity(person.id).slug}`)
    await expect(
      page.getByRole('heading', { level: 1, name: person.name })
    ).toBeVisible()
    await expect(page.locator('[data-persona-marker] image')).toHaveAttribute(
      'href',
      `/personas/${person.avatar}.jpg`
    )
    await expect(
      page
        .getByRole('region', { name: 'Sources', exact: true })
        .locator(`a[href="${person.video}"]`)
    ).toBeVisible()
    await expect(
      page.getByRole('button', { name: /View questions and simulated answers/ })
    ).toHaveAttribute('aria-expanded', 'true')
    await expect(
      page
        .getByRole('region', { name: 'Simulated Assessment', exact: true })
        .locator('article')
        .first()
    ).toBeVisible()
  }
  await expect(page.getByText('35–40%', { exact: true })).toBeVisible()
  await expect(
    page.getByText('AI takeover; not an extinction-only forecast', {
      exact: true
    })
  ).toBeVisible()
  await page.goto('/')
  await expect(
    page.locator('a.study-point[href="/users/so8res"]')
  ).toBeVisible()
  await expect(
    page.locator('a.study-point[href="/users/ryangreenblatt"]')
  ).toBeVisible()
})

test('new worldview writers have live journeys and source-grounded persona pages', async ({
  page
}) => {
  const people = [
    {
      id: 'alignment-philosopher',
      name: 'Joe Carlsmith',
      avatar: 'carlsmith',
      source:
        'https://joecarlsmith.com/2026/03/19/on-restraining-ai-development-for-the-sake-of-safety/'
    },
    {
      id: 'rationalist-safety-advocate',
      name: 'Scott Alexander',
      avatar: 'alexander',
      source: 'https://www.astralcodexten.com/p/my-ai-opinions'
    },
    {
      id: 'takeoff-forecaster',
      name: 'Daniel Kokotajlo',
      avatar: 'kokotajlo',
      source: 'https://ai-2040.com'
    },
    {
      id: 'institutional-growth-optimist',
      name: 'Tyler Cowen',
      avatar: 'cowen',
      source: 'https://tylercowen.com/human-life-in-a-post-agi-world-talk/'
    }
  ]
  for (const person of people) {
    await page.goto(`/users/${personaIdentity(person.id).slug}`)
    await expect(
      page.getByRole('heading', { level: 1, name: person.name })
    ).toBeVisible()
    await expect(page.locator('[data-persona-marker] image')).toHaveAttribute(
      'href',
      `/personas/${person.avatar}.jpg`
    )
    await expect(
      page
        .getByRole('region', { name: 'Sources', exact: true })
        .locator(`a[href="${person.source}"]`)
    ).toBeVisible()
    await expect(
      page.getByRole('button', { name: /View questions and simulated answers/ })
    ).toHaveAttribute('aria-expanded', 'true')
    await expect(
      page
        .getByRole('region', { name: 'Simulated Assessment', exact: true })
        .locator('article')
        .first()
    ).toBeVisible()
    if (person.avatar === 'alexander') {
      await expect(
        page.getByText('Scott Alexander’s stated P(doom)', { exact: true })
      ).toBeVisible()
      await expect(page.getByText('20%', { exact: true })).toBeVisible()
    }
  }
  await page.goto('/')
  for (const person of people) {
    await expect(
      page.locator(
        `a.study-point[href="/users/${personaIdentity(person.id).slug}"]`
      )
    ).toBeVisible()
  }
})

test('persona answer references reopen the transcript and navigate to the exact answer', async ({
  page
}) => {
  await page.goto('/users/esyudkowsky')
  const disclosure = page.getByRole('button', {
    name: /View questions and simulated answers/
  })
  await expect(disclosure).toHaveAttribute('aria-expanded', 'true')
  await disclosure.click()
  const link = page.getByRole('link', { name: /^Answer \d+$/ }).first()
  const hash = (await link.getAttribute('href'))!
  await expect(link).toHaveCSS('text-decoration-line', 'none')
  await link.click()
  await expect(disclosure).toHaveAttribute('aria-expanded', 'true')
  await expect(page).toHaveURL(new RegExp(`${hash}$`))
  await expect(page.locator(hash)).toBeFocused()
  await expect(page.locator(hash)).toBeInViewport()
  await disclosure.click()
  await link.focus()
  await page.keyboard.press('Enter')
  await expect(disclosure).toHaveAttribute('aria-expanded', 'true')
  await expect(page.locator(hash)).toBeFocused()
  await page.reload()
  await expect(page.locator(hash)).toBeFocused()
})

test('people legend has contiguous links and fades overflowing full names', async ({
  page
}, testInfo) => {
  await page.goto('/')
  const legend = page.locator('.landing-map-legend')
  await expect(
    legend.getByRole('link', { name: 'Eliezer Yudkowsky', exact: true })
  ).toBeVisible()
  for (const width of [1365, 390]) {
    await page.setViewportSize({ width, height: 960 })
    await expect(legend).toHaveCSS('gap', '0px')
    const links = await legend.locator('a').evaluateAll((links) =>
      links.map((link) => {
        const rect = link.getBoundingClientRect()
        return { x: rect.x, y: rect.y, right: rect.right, bottom: rect.bottom }
      })
    )
    const first = links[0]!
    const nextRow = links.find((link) => link.y > first.y + 1)!
    expect(links[1]!.x).toBeCloseTo(first.right, 1)
    expect(nextRow.y).toBeCloseTo(first.bottom, 1)
    if (width === 390) {
      // Enlarged text exercises real overflow without relying on today's name lengths.
      await page.addStyleTag({
        content: '.landing-map-legend a { font-size: 20px; }'
      })
      const overflowing = legend.locator('[data-truncated=true]').first()
      await expect(overflowing).toBeVisible()
      await expect(overflowing).not.toHaveCSS('mask-image', 'none')
      await expect(overflowing).toHaveCSS('white-space', 'nowrap')
    }
    await legend.screenshot({
      path: testInfo.outputPath(`people-legend-${width}.png`)
    })
  }
})

test('legacy persona URLs redirect to user pages and user pages omit the back link', async ({
  page,
  request
}) => {
  const response = await request.get('/personas/esyudkowsky', {
    maxRedirects: 0
  })
  expect(response.status()).toBe(308)
  expect(response.headers().location).toBe('/users/esyudkowsky')
  await page.goto('/personas/esyudkowsky#answer-1')
  await expect(page).toHaveURL(/\/users\/esyudkowsky#answer-1$/)
  await expect(
    page.getByRole('heading', { level: 1, name: 'Eliezer Yudkowsky' })
  ).toBeVisible()
  await expect(page.getByRole('link', { name: 'Back to the map' })).toHaveCount(
    0
  )
  const sitemap = await request.get('/sitemap.xml')
  expect(await sitemap.text()).toContain('/users/esyudkowsky')
  expect(await sitemap.text()).not.toContain('/personas/')
})

test('primary CTAs share the expanding-arrow treatment and remain navigable', async ({
  page
}, testInfo) => {
  const hydrationErrors: string[] = []
  page.on('console', (message) => {
    if (message.type() === 'error' && /hydrat/i.test(message.text()))
      hydrationErrors.push(message.text())
  })
  await page.goto('/')
  const cta = page.getByRole('link', {
    name: 'Map your own worldview',
    exact: true
  })
  await expect(cta).toHaveAttribute('data-slot', 'primary-cta')
  await expect(cta).toHaveAttribute('data-expanded', 'false')
  const initial = await cta.boundingBox()
  await cta.screenshot({ path: testInfo.outputPath('cta-rest.png') })
  await cta.hover()
  await expect(cta).toHaveAttribute('data-expanded', 'true')
  await expect(cta.locator(':scope > span').last()).toHaveCSS('opacity', '0')
  expect((await cta.boundingBox())!.width).toBeCloseTo(initial!.width, 1)
  await cta.screenshot({ path: testInfo.outputPath('cta-hover.png') })
  await page.mouse.move(0, 0)
  await cta.focus()
  await expect(cta).toHaveAttribute('data-expanded', 'true')
  await page.keyboard.press('Enter')
  await expect(page).toHaveURL(/\/assessment$/)
  await page.emulateMedia({ reducedMotion: 'reduce', colorScheme: 'dark' })
  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto('/users/esyudkowsky')
  const userCtas = page.getByRole('link', {
    name: 'Map your own worldview',
    exact: true
  })
  await expect(userCtas).toHaveCount(2)
  for (const link of await userCtas.all())
    await expect(link).toHaveAttribute('data-slot', 'primary-cta')
  await userCtas
    .first()
    .screenshot({ path: testInfo.outputPath('cta-dark-mobile.png') })
  await userCtas.last().click()
  await expect(page).toHaveURL(/\/assessment$/)
  expect(hydrationErrors).toEqual([])
})
