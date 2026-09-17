import { expect, test } from '@playwright/test'
import {
  acceptAnswer,
  createAssessment,
  currentPrompt,
  issuePrompt
} from '../../lib/assessment/state'
import { fixtureAnswer } from '../../lib/server/provider'
import type { DebugStage, Question } from '../../lib/assessment/schema'

// All inference is intercepted: this test sends no requests to Jev.
test('debug separates exchanges, folds depth 2+, highlights syntax and uses wide page scrolling', async ({
  page
}, testInfo) => {
  const text =
    'My complete spoken answer about benefits and uncertain risks. '.repeat(30)
  const question: Question = {
    type: 'choice',
    instructions: 'Judge relevance using current.answer.',
    criteria: {
      usable: 'Relevant evidence',
      non_answer: 'No relevant evidence'
    }
  }
  const model = 'jev-1.13.0'
  let requests = 0
  await page.addInitScript(() => {
    Object.defineProperty(navigator, 'clipboard', {
      value: {
        writeText: async (value: string) => {
          ;(window as unknown as { copiedJSON: string }).copiedJSON = value
        }
      }
    })
  })
  await page.route('**/api/assessment', async (route) => {
    requests++
    const input = route.request().postDataJSON()
    const prompt = currentPrompt(input.assessment)
    const answerId = `${prompt.id}:a`
    const stage: DebugStage = {
      name: 'A: interpret',
      state: {
        current: {
          id: answerId,
          prompt: prompt.text,
          answer: input.operation.text
        },
        usableHistory: [],
        clarificationTarget: null
      },
      questions: { disposition: question },
      answers: { disposition: fixtureAnswer(question, 'usable') },
      model,
      elapsedMs: 12,
      inputBytes: 2500,
      outputBytes: 100,
      usage: { input_tokens: 20, output_tokens: 3 },
      attempts: 1,
      requests: [
        {
          attempt: 1,
          model,
          questionIds: ['disposition'],
          elapsedMs: 10,
          status: 200,
          response: {
            model,
            answers: { disposition: fixtureAnswer(question, 'usable') },
            usage: { input_tokens: 20, output_tokens: 3 }
          }
        }
      ]
    }
    let assessment = acceptAnswer(input.assessment, {
      id: answerId,
      promptInstanceId: prompt.id,
      promptText: prompt.text,
      text: input.operation.text,
      substantive: true,
      hasHorizon: false,
      hasConviction: false
    })
    assessment = issuePrompt(assessment, {
      promptId: 'timeline.general',
      text: 'What timing do you expect?',
      family: 'timeline',
      variant: 'original',
      sourceEvidenceIds: []
    })
    assessment.revision++
    await route.fulfill({
      json: {
        assessmentId: assessment.id,
        baseRevision: input.assessment.revision,
        requestId: input.requestId,
        assessment,
        provider: 'live',
        debug: {
          requestId: input.requestId,
          baseRevision: input.assessment.revision,
          stages: [stage],
          decisions: [
            {
              action: 'prompt issued',
              detail: { id: 'timeline.general', deterministic: false }
            }
          ],
          elapsedMs: 14
        }
      }
    })
  })
  await page.setViewportSize({ width: 1440, height: 960 })
  await page.emulateMedia({ colorScheme: 'light', reducedMotion: 'reduce' })
  await page.goto('/')
  await page.getByLabel('Your answer', { exact: true }).fill(text)
  await page.getByRole('button', { name: /^Continue/ }).click()
  await expect(page.getByLabel('Your answer', { exact: true })).toHaveValue('')
  await page
    .getByRole('button', { name: 'Jev / assessment debugging details' })
    .click()
  await expect(
    page.getByRole('heading', { name: 'Validated Jev response' })
  ).toBeVisible()
  await expect(
    page.getByRole('heading', { name: 'Local control-flow decisions' })
  ).toBeVisible()
  const request = page.getByRole('region', {
    name: 'A: interpret request 1',
    exact: true
  })
  const response = page.getByRole('region', {
    name: 'A: interpret response 1',
    exact: true
  })
  await expect(
    request.getByRole('button', { name: 'Collapse $', exact: true })
  ).toHaveAttribute('aria-expanded', 'true')
  await expect(
    request.getByRole('button', { name: 'Collapse $.state', exact: true })
  ).toHaveAttribute('aria-expanded', 'true')
  const current = request.getByRole('button', {
    name: 'Expand $.state.current',
    exact: true
  })
  await expect(current).toHaveAttribute('aria-expanded', 'false')
  await expect(request.locator('[data-json-depth="3"]')).toHaveCount(0)
  const bodyWidth = (await page
    .getByLabel('Your answer', { exact: true })
    .boundingBox())!.width
  const debugWidth = (await page
    .locator('[data-slot="debug-content"]')
    .boundingBox())!.width
  expect(debugWidth).toBeGreaterThan(bodyWidth + 500)
  await page.screenshot({
    path: testInfo.outputPath('debug-desktop.png'),
    fullPage: true
  })
  await current.focus()
  await page.keyboard.press('Enter')
  const answer = request.getByRole('button', {
    name: 'Expand $.state.current.answer',
    exact: true
  })
  await expect(answer).toHaveAttribute('aria-expanded', 'false')
  await answer.click()
  await expect(
    request
      .locator('[data-json-token="string"]')
      .filter({ hasText: text })
      .first()
  ).toBeVisible()
  await request.getByRole('button', { name: 'Copy JSON' }).click()
  const copied = await page.evaluate(
    () => (window as unknown as { copiedJSON: string }).copiedJSON
  )
  const original = createAssessment('unused')
  expect(JSON.parse(copied)).toMatchObject({
    model,
    state: {
      current: { prompt: original.prompts[0]!.text, answer: text.trim() }
    },
    questions: { disposition: question }
  })
  await request.getByRole('button', { name: 'Reset folds' }).click()
  await expect(current).toHaveAttribute('aria-expanded', 'false')
  await expect(request.locator('[data-json-depth="3"]')).toHaveCount(0)
  const keyColor = await response
    .locator('[data-json-token="key"]')
    .first()
    .evaluate((element) => getComputedStyle(element).color)
  const stringColor = await response
    .locator('[data-json-token="string"]')
    .first()
    .evaluate((element) => getComputedStyle(element).color)
  expect(keyColor).not.toBe(stringColor)
  await page.getByRole('button', { name: 'Toggle light or dark theme' }).click()
  await expect(page.locator('html')).toHaveClass(/dark/)
  const darkKey = await response
    .locator('[data-json-token="key"]')
    .first()
    .evaluate((element) => getComputedStyle(element).color)
  expect(darkKey).not.toBe(keyColor)
  await page.setViewportSize({ width: 390, height: 844 })
  await page.screenshot({
    path: testInfo.outputPath('debug-mobile-dark.png'),
    fullPage: true
  })
  const scrolling = await page.evaluate(() => ({
    width: document.documentElement.scrollWidth,
    viewport: window.innerWidth,
    nested: [...document.querySelectorAll('main *')].some(
      (element) =>
        ['auto', 'scroll'].includes(getComputedStyle(element).overflowY) &&
        element.scrollHeight > element.clientHeight + 1
    )
  }))
  expect(scrolling.width).toBeLessThanOrEqual(scrolling.viewport + 1)
  expect(scrolling.nested).toBe(false)
  expect(requests).toBe(1)
  await page.reload()
  await page
    .getByRole('button', { name: 'Jev / assessment debugging details' })
    .click()
  await expect(
    page.getByText(/No transient request\/response trace is available/)
  ).toBeVisible()
  expect(requests).toBe(1)
})
