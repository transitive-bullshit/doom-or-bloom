import { expect, test } from '@playwright/test'
import { readFile } from 'node:fs/promises'
import { randomUUID } from 'node:crypto'
import path from 'node:path'

test('local question and corpus inspectors expose relationships and append versioned project feedback', async ({
  page,
  request,
  baseURL
}, testInfo) => {
  const errors: string[] = []
  page.on('pageerror', (error) => errors.push(error.message))
  let inferenceRequests = 0
  await page.route('**/api/assessment', (route) => {
    inferenceRequests++
    return route.abort()
  })
  await page.setViewportSize({ width: 1440, height: 960 })
  await page.goto('/questions')
  await expect(page.getByRole('heading', { level: 1 })).toHaveText(
    'Built-in questions'
  )
  await expect(
    page.getByRole('group', { name: 'Authored question relationships' })
  ).toBeVisible()
  await expect(page.getByText(/38 catalog entries/)).toBeVisible()
  for (const id of [
    'grounding.source',
    'tension.general',
    'control.failuremode',
    'crux.test'
  ]) {
    await page.getByLabel('Search questions or metadata').fill(id)
    await expect(page.getByText('0 matches', { exact: true })).toBeVisible()
  }
  await page
    .getByLabel('Search questions or metadata')
    .fill('grounding.general')
  const entry = page.getByRole('link', {
    name: /^grounding\.general grounding/
  })
  await expect(entry).not.toContainText('Retired')
  await entry.click()
  const details = page.getByRole('region', {
    name: 'Question details grounding.general'
  })
  await expect(details).toBeVisible()
  await expect(details).toContainText('Permitted previous families')
  const runId = randomUUID()
  const questionNote = `Question review ${runId}: check that this elicits an observation behind a concrete belief.`
  const questionFeedback = page.getByRole('region', {
    name: 'Feedback for grounding.general',
    exact: true
  })
  await questionFeedback.getByRole('textbox').fill(questionNote)
  await questionFeedback
    .getByRole('button', { name: 'Save feedback', exact: true })
    .click()
  await expect(questionFeedback.getByRole('status')).toHaveText(
    'Saved to content/feedback/questions.json'
  )
  const questionFile = JSON.parse(
    await readFile(
      path.join(process.cwd(), 'content/feedback/questions.json'),
      'utf8'
    )
  )
  const saved = questionFile.entries.find(
    (note: { text: string }) => note.text === questionNote
  )
  expect(saved).toMatchObject({
    resourceId: 'grounding.general',
    contentVersion: '0.4.0-draft'
  })
  expect(saved.assetHash).toMatch(/^[0-9a-f]{64}$/)
  expect(
    questionFile.entries.some((note: { id: string }) => note.id !== saved.id)
  ).toBe(true)
  await page.reload()
  await expect(page.getByText(/38 catalog entries/)).toBeVisible()
  for (const id of [
    'grounding.source',
    'tension.general',
    'control.failuremode',
    'crux.test'
  ]) {
    await page.getByLabel('Search questions or metadata').fill(id)
    await expect(page.getByText('0 matches', { exact: true })).toBeVisible()
  }
  await page
    .getByLabel('Search questions or metadata')
    .fill('grounding.general')
  await entry.click()
  await questionFeedback
    .getByRole('button', { name: /Saved feedback for this entry/ })
    .click()
  await expect(
    questionFeedback.getByText(questionNote, { exact: true })
  ).toBeVisible()
  await page.screenshot({
    path: testInfo.outputPath('questions-desktop.png'),
    fullPage: true
  })
  await page.goto('/corpus')
  await expect(page.getByRole('heading', { level: 1 })).toHaveText(
    'Built-in corpus'
  )
  await expect(
    page.getByRole('group', { name: 'Authored corpus relationships' })
  ).toBeVisible()
  await page
    .getByLabel('Search titles, IDs, topics, dates or snapshot text')
    .fill('event.openai-hugging-face-2026')
  const corpusEntry = page
    .getByRole('link')
    .filter({ hasText: 'Inspect & give feedback' })
    .filter({ hasText: 'event.openai-hugging-face-2026' })
    .first()
  await corpusEntry.click()
  const corpusFeedback = page.getByRole('region', { name: /Feedback for / })
  const corpusNote = `Corpus review ${runId}: make the evidence versus interpretation boundary prominent.`
  await corpusFeedback.getByRole('textbox').fill(corpusNote)
  await corpusFeedback
    .getByRole('button', { name: 'Save feedback', exact: true })
    .click()
  await expect(corpusFeedback.getByRole('status')).toHaveText(
    'Saved to content/feedback/corpus.json'
  )
  const corpusFile = JSON.parse(
    await readFile(
      path.join(process.cwd(), 'content/feedback/corpus.json'),
      'utf8'
    )
  )
  expect(
    corpusFile.entries.some(
      (note: { text: string }) => note.text === corpusNote
    )
  ).toBe(true)
  await page.reload()
  await page
    .getByLabel('Search titles, IDs, topics, dates or snapshot text')
    .fill('event.openai-hugging-face-2026')
  await corpusEntry.click()
  await corpusFeedback
    .getByRole('button', { name: /Saved feedback for this entry/ })
    .click()
  await expect(
    corpusFeedback.getByText(corpusNote, { exact: true })
  ).toBeVisible()
  await page.setViewportSize({ width: 390, height: 844 })
  await page.screenshot({
    path: testInfo.outputPath('corpus-mobile.png'),
    fullPage: true
  })
  expect(
    await page.evaluate(() => document.documentElement.scrollWidth)
  ).toBeLessThanOrEqual(391)
  expect(
    await page
      .locator('main')
      .evaluate((main) =>
        [...main.querySelectorAll('*')].some(
          (element) =>
            ['auto', 'scroll'].includes(getComputedStyle(element).overflowY) &&
            element.scrollHeight > element.clientHeight + 1
        )
      )
  ).toBe(false)
  const blocked = await request.post('/api/editorial-feedback', {
    headers: { origin: 'https://unrelated.example' },
    data: { kind: 'questions', resourceId: 'root', text: 'must not be saved' }
  })
  expect(blocked.status()).toBe(403)
  const unknown = await request.post('/api/editorial-feedback', {
    headers: { origin: new URL(baseURL!).origin },
    data: {
      kind: 'questions',
      resourceId: '../../outside',
      text: 'must not be saved'
    }
  })
  expect(unknown.status()).toBe(400)
  expect(inferenceRequests).toBe(0)
  expect(errors).toEqual([])
})

test('failed feedback saves retain the complete draft and drafts survive selecting another question', async ({
  page
}) => {
  await page.goto('/questions')
  const feedback = page.getByRole('region', {
    name: 'Feedback for root',
    exact: true
  })
  const draft =
    'Please ask a specific question.\nMy full dictated feedback stays here.'
  await feedback.getByRole('textbox').fill(draft)
  await page
    .getByRole('link', { name: 'Inspect timeline.general', exact: true })
    .click()
  await page.getByRole('link', { name: 'Inspect root', exact: true }).click()
  await expect(feedback.getByRole('textbox')).toHaveValue(draft)
  await page.route('**/api/editorial-feedback', (route) =>
    route.fulfill({
      status: 500,
      json: { error: 'Feedback could not be saved. Your text is still here.' }
    })
  )
  await feedback
    .getByRole('button', { name: 'Save feedback', exact: true })
    .click()
  await expect(feedback.getByRole('status')).toContainText(
    'Your text is still here'
  )
  await expect(feedback.getByRole('textbox')).toHaveValue(draft)
  await feedback.getByRole('textbox').fill('a'.repeat(20_001))
  await expect(feedback.getByRole('textbox')).toHaveValue('a'.repeat(20_001))
  await expect(
    feedback.getByRole('button', { name: 'Save feedback', exact: true })
  ).toBeDisabled()
})
