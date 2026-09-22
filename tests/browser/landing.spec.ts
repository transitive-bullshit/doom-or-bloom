import { personaIdentity } from '../../lib/journeys/persona-identity'
import { expect, test } from '@playwright/test'

test('landing portraits use tooltips and link to results; assessment drafts survive a trip home', async ({
  page
}) => {
  await page.goto('/')
  await expect(
    page.getByRole('heading', { name: 'A world of possible futures' })
  ).toBeVisible()
  const portrait = page.getByRole('link', {
    name: 'View Eliezer Yudkowsky results'
  })
  await expect(portrait).not.toHaveAttribute('title')
  await portrait.hover()
  await expect(portrait.locator('span')).toHaveText('Eliezer Yudkowsky')
  await expect(portrait.locator('span')).toHaveCSS('opacity', '1')
  await portrait.click()
  await expect(page).toHaveURL(/\/personas\/esyudkowsky$/)
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
    page.getByRole('heading', { name: 'A world of possible futures' })
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
  await page.goto('/personas/drfeifei')
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
  await page.goto('/personas/tszzl')
  await expect(
    page.getByText('What their outlook hinges on', { exact: true })
  ).toBeVisible()
  expect(errors).toEqual([])
})

test('persona probability uses a dated public statement with its outcome and source', async ({
  page
}) => {
  await page.goto('/personas/noahpinion')
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
    await page.goto(`/personas/${personaIdentity(person.id).slug}`)
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
    page.locator('a.study-point[href="/personas/so8res"]')
  ).toBeVisible()
  await expect(
    page.locator('a.study-point[href="/personas/ryangreenblatt"]')
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
    await page.goto(`/personas/${personaIdentity(person.id).slug}`)
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
        `a.study-point[href="/personas/${personaIdentity(person.id).slug}"]`
      )
    ).toBeVisible()
  }
})

test('persona answer references reopen the transcript and navigate to the exact answer', async ({
  page
}) => {
  await page.goto('/personas/esyudkowsky')
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
