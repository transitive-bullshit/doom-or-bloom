import { expect, test } from '@playwright/test'
import type { Page } from '@playwright/test'
import { storageKey } from '../../lib/persistence/storage'

test('unavailable debug storage reports failure without losing assessment progress', async ({
  page
}) => {
  await page.addInitScript(() => {
    Object.defineProperty(window, 'indexedDB', {
      value: {
        open: () => {
          throw new DOMException(
            'Debug storage unavailable',
            'QuotaExceededError'
          )
        }
      }
    })
  })
  await page.goto('/')
  await page
    .getByLabel('Your answer', { exact: true })
    .fill('AI could improve medicine, with uncertain risks.')
  await page.getByRole('button', { name: /^Continue/ }).click()
  await expect(page.getByLabel('Your answer', { exact: true })).toHaveValue('')
  await page
    .getByRole('button', { name: 'Jev / assessment debugging details' })
    .click()
  await expect(
    page.getByText(
      'Debug details could not be saved in this browser. Your assessment progress is still saved separately.',
      { exact: true }
    )
  ).toBeVisible()
  await page.reload()
  await expect(
    page.getByRole('article', { name: 'Question 1 and replies' })
  ).toContainText('AI could improve medicine, with uncertain risks.')
  await expect(page.getByLabel('Your answer', { exact: true })).toHaveValue('')
})

async function savedOperationCount(page: Page, assessmentId?: string) {
  return page.evaluate(
    async ({ key, assessmentId }) => {
      const id =
        assessmentId ?? JSON.parse(localStorage.getItem(key)!).assessment.id
      return new Promise<number>((resolve, reject) => {
        const open = indexedDB.open('doom-or-bloom:debug:v1', 1)
        open.onsuccess = () => {
          const db = open.result
          const get = db
            .transaction('sessions', 'readonly')
            .objectStore('sessions')
            .get(id)
          get.onsuccess = () => {
            db.close()
            resolve(get.result?.operations.length ?? 0)
          }
          get.onerror = () => {
            db.close()
            reject(get.error)
          }
        }
        open.onerror = () => reject(open.error)
      })
    },
    { key: storageKey, assessmentId }
  )
}
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
        ...(input.debug
          ? {
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
          : {})
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
  const requestBox = (await request.boundingBox())!,
    responseBox = (await response.boundingBox())!
  expect(responseBox.x).toBeGreaterThan(requestBox.x + requestBox.width)
  const firstOperation = await page
    .getByLabel('Recorded operation', { exact: true })
    .inputValue()
  await expect.poll(() => savedOperationCount(page)).toBe(1)
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
  const mobileRequest = (await request.boundingBox())!,
    mobileResponse = (await response.boundingBox())!
  expect(mobileResponse.y).toBeGreaterThan(mobileRequest.y)
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
    page.getByRole('heading', { name: 'Validated Jev response' })
  ).toBeVisible()
  await expect(
    page.getByLabel('Recorded operation', { exact: true })
  ).toHaveValue(firstOperation)
  expect(requests).toBe(1)
  await page
    .getByLabel('Your answer', { exact: true })
    .fill('My second answer about timing.')
  await page.getByRole('button', { name: /^Continue/ }).click()
  await expect.poll(() => savedOperationCount(page)).toBe(2)
  await page.reload()
  await page
    .getByRole('button', { name: 'Jev / assessment debugging details' })
    .click()
  const history = page.getByLabel('Recorded operation', { exact: true })
  await expect(history.locator('option')).toHaveCount(2)
  await history.selectOption(firstOperation)
  await request.getByRole('button', { name: 'Copy JSON' }).click()
  expect(
    JSON.parse(
      await page.evaluate(
        () => (window as unknown as { copiedJSON: string }).copiedJSON
      )
    ).state.current.answer
  ).toBe(text.trim())
  await page.getByRole('button', { name: 'Debug on', exact: true }).click()
  await page
    .getByLabel('Your answer', { exact: true })
    .fill('Third answer with debugging disabled.')
  await page.getByRole('button', { name: /^Continue/ }).click()
  await expect(page.getByLabel('Your answer', { exact: true })).toHaveValue('')
  expect(await savedOperationCount(page)).toBe(2)
  const assessmentId = await page.evaluate(
    (key) => JSON.parse(localStorage.getItem(key)!).assessment.id,
    storageKey
  )
  await page.getByRole('button', { name: 'Debug off', exact: true }).click()
  await page.getByRole('button', { name: 'Restart', exact: true }).click()
  await page
    .getByRole('button', { name: 'Restart & clear', exact: true })
    .click()
  await expect.poll(() => savedOperationCount(page, assessmentId)).toBe(0)
  expect(requests).toBe(3)
})
