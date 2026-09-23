import { expect, test } from '@playwright/test'
import { readFileSync } from 'node:fs'
import type { JourneySuite } from '../../lib/journeys/schema'
const suite = JSON.parse(
  readFileSync('eval/development/live-persona-journeys.json', 'utf8')
) as JourneySuite

const journey = suite.journeys.find(
  (journey) => journey.personaId === 'anti-doomer'
)!

test('persona page orders results, answers, collapsed debug info, sources and closing CTA', async ({
  page
}) => {
  await page.setViewportSize({ width: 1280, height: 900 })
  await page.goto('/users/jensenhuang')
  const ctas = page.getByRole('link', {
    name: 'Map your own worldview',
    exact: true
  })
  await expect(ctas).toHaveCount(2)
  const header = page.locator('main header')
  await expect(header).toHaveCSS('margin-top', '0px')
  const identity = await header.locator(':scope > div > div').boundingBox()
  const heading = await header.getByRole('heading', { level: 1 }).boundingBox()
  const cta = await ctas.first().boundingBox()
  expect(cta!.x).toBeGreaterThan(heading!.x + heading!.width)
  expect(
    Math.abs(cta!.y + cta!.height / 2 - (identity!.y + identity!.height / 2))
  ).toBeLessThan(2)
  const reasoning = page
    .getByRole('region', {
      name: 'Debug info',
      exact: true
    })
    .first()
  const reasoningToggle = reasoning.getByRole('button', {
    name: 'Debug info',
    exact: true
  })
  await expect(reasoningToggle).toHaveAttribute('aria-expanded', 'false')
  await expect(
    page.getByRole('region', { name: 'Final assessment state', exact: true })
  ).toHaveCount(0)
  const assessment = page.getByRole('region', {
    name: 'Simulated Assessment',
    exact: true
  })
  const assessmentToggle = assessment.getByRole('button', {
    name: /View questions and simulated answers/
  })
  const answers = journey.steps.filter((step) => step.answer !== null)
  await expect(assessmentToggle).toHaveAttribute('aria-expanded', 'true')
  await expect(assessment.locator('article')).toHaveCount(answers.length)
  await assessmentToggle.click()
  await expect(assessmentToggle).toHaveAttribute('aria-expanded', 'false')
  await expect(assessment.locator('article')).toHaveCount(0)
  const positions = await Promise.all(
    [
      page.locator('[data-slot="worldview-map"]'),
      page.getByRole('region', { name: 'More details', exact: true }),
      assessment,
      reasoning,
      page.getByRole('region', { name: 'Sources', exact: true }),
      ctas.last()
    ].map((locator) => locator.boundingBox())
  )
  for (let i = 1; i < positions.length; i++)
    expect(positions[i]!.y).toBeGreaterThan(positions[i - 1]!.y)
  await assessmentToggle.click()
  await expect(assessment.locator('article')).toHaveCount(answers.length)
  for (const [index, answer] of answers.entries()) {
    const article = assessment.locator('article').nth(index)
    await expect(article.getByRole('heading', { level: 3 })).toHaveText(
      answer.prompt.text
    )
    await expect(article).toContainText(answer.answer!)
  }
  await expect(
    assessment.getByRole('button', {
      name: 'Results after this answer',
      exact: true
    })
  ).toHaveCount(0)
  await reasoningToggle.click()
  await expect(
    reasoning.getByRole('region', {
      name: 'Final assessment state',
      exact: true
    })
  ).toBeVisible()
  await expect(
    reasoning.getByRole('region', {
      name: 'Final generated result',
      exact: true
    })
  ).toBeVisible()
  await expect(reasoning).toContainText('completeParticipantEvidence')
  await page.setViewportSize({ width: 390, height: 844 })
  const mobileHeader = await header.boundingBox()
  const mobileCta = await ctas.first().boundingBox()
  const mobileHeading = await header
    .getByRole('heading', { level: 1 })
    .boundingBox()
  expect(mobileCta!.y).toBeGreaterThan(mobileHeading!.y + mobileHeading!.height)
  expect(mobileHeader!.width).toBeLessThan(390)
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth
    )
  ).toBe(true)
})

test('JSON field tooltips anchor to their text on wide screens', async ({
  page
}) => {
  await page.setViewportSize({ width: 1800, height: 1000 })
  await page.goto('/users/jensenhuang')
  await page.getByRole('button', { name: 'Debug info', exact: true }).click()
  const result = page.getByRole('region', {
    name: 'Final generated result',
    exact: true
  })
  const row = result.getByRole('button', {
    name: /(?:Expand|Collapse) .*\.influence$/
  })
  const key = row.locator('[data-json-token=key]')
  await key.hover()
  await expect(page.getByRole('tooltip')).toBeVisible()
  await expect(key).toHaveAttribute('data-state', 'delayed-open')
  const anchor = await key.boundingBox()
  const bounds = await row.boundingBox()
  expect(anchor!.width).toBeLessThan(bounds!.width / 2)
  await page.mouse.move(0, 0)
  await row.focus()
  await expect(page.getByRole('tooltip')).toBeVisible()
  await page.keyboard.press('Escape')
  await expect(page.getByRole('tooltip')).toHaveCount(0)
  await page.keyboard.press('Enter')
  await expect(row).toHaveAttribute('aria-expanded', 'true')
})

test('persona profile labels use the handle and empty milestone timelines are omitted', async ({
  page
}) => {
  await page.goto('/users/tszzl')
  await expect(
    page
      .locator('main header')
      .getByRole('link', { name: '@tszzl', exact: true })
  ).toBeVisible()
  await expect(page.getByText(/milestone timeline$/)).toHaveCount(0)
  await expect(
    page.getByText(/No milestone timing was established/)
  ).toHaveCount(0)
})
