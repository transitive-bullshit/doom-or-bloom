import { expect, test } from '@playwright/test'
import {
  acceptAnswer,
  createAssessment,
  currentPrompt,
  issuePrompt
} from '../../lib/assessment/state'
import { storageKey } from '../../lib/persistence/storage'

test('the full conversation uses page scrolling, bounded answer disclosure and local resume', async ({
  page
}) => {
  const longAnswer =
    'AI could help medicine, although the time to deploy it matters.\n'.repeat(
      100
    ) + 'This is the complete final sentence of my answer.'
  let state = createAssessment('conversation-browser', 'fixture-v1')
  const root = currentPrompt(state)
  state.interactionHistory = [
    {
      requestId: 'earlier-reply',
      promptInstanceId: root.id,
      text: 'My earlier attempt is still available.',
      disposition: 'needs_clarification'
    }
  ]
  state = acceptAnswer(state, {
    id: `${root.id}:a`,
    promptInstanceId: root.id,
    promptText: root.text,
    text: longAnswer,
    hasHorizon: false,
    hasConviction: false,
    substantive: true
  })
  state = issuePrompt(state, {
    promptId: 'horizon.general',
    text: 'When might these changes arrive?',
    family: 'horizon',
    variant: 'original',
    sourceEvidenceIds: []
  })
  const second = currentPrompt(state)
  state = acceptAnswer(state, {
    id: `${second.id}:a`,
    promptInstanceId: second.id,
    promptText: second.text,
    text: 'Possibly in five years, but I am uncertain.',
    hasHorizon: false,
    hasConviction: false,
    substantive: true
  })
  state = issuePrompt(state, {
    promptId: 'crux.general',
    text: 'What would change your view?',
    family: 'crux',
    variant: 'original',
    sourceEvidenceIds: []
  })
  state.draft = 'My next answer is still a draft.'
  let apiCalls = 0
  await page.route('**/api/**', (route) => {
    apiCalls++
    return route.abort()
  })
  await page.addInitScript(
    ({ key, snapshot }) => {
      if (!localStorage.getItem(key))
        localStorage.setItem(
          key,
          JSON.stringify({ token: 'conversation-token', assessment: snapshot })
        )
    },
    { key: storageKey, snapshot: state }
  )
  await page.goto('/')
  await expect(page.getByRole('heading', { level: 1 })).toHaveText(
    'What would change your view?'
  )
  const firstTurn = page.getByRole('article', {
    name: 'Question 1 and replies',
    exact: true
  })
  await expect(firstTurn).toContainText(root.text)
  await expect(firstTurn).toContainText(
    'My earlier attempt is still available.'
  )
  await expect(
    page.getByRole('article', { name: 'Question 2 and replies' })
  ).toContainText(second.text)
  await expect(
    page.getByText('Possibly in five years, but I am uncertain.')
  ).toBeVisible()
  const expand = page.getByRole('button', {
    name: 'Read full answer 2 to question 1',
    exact: true
  })
  await expect(expand).toHaveAttribute('aria-expanded', 'false')
  const before = await page.evaluate(
    () => document.documentElement.scrollHeight
  )
  await expand.click()
  const fullAnswer = page.getByRole('region', {
    name: 'Answer 2 to question 1',
    exact: true
  })
  expect(await fullAnswer.textContent()).toBe(longAnswer)
  await expect(fullAnswer).toHaveCSS('overflow-y', 'visible')
  expect(
    await page.evaluate(() => document.documentElement.scrollHeight)
  ).toBeGreaterThan(before)
  expect(
    await firstTurn.evaluate((element) => {
      for (
        let parent: Element | null = element;
        parent && parent.tagName !== 'HTML';
        parent = parent.parentElement
      )
        if (['auto', 'scroll'].includes(getComputedStyle(parent).overflowY))
          return true
      return false
    })
  ).toBe(false)
  await page.setViewportSize({ width: 390, height: 844 })
  expect(
    await page.evaluate(() => document.documentElement.scrollWidth)
  ).toBeLessThanOrEqual(390)
  await page
    .getByRole('button', {
      name: 'Collapse answer 2 to question 1',
      exact: true
    })
    .click()
  await expect(fullAnswer).toHaveCount(0)
  await page.reload()
  await expect(expand).toHaveAttribute('aria-expanded', 'false')
  await expect(page.getByLabel('Your answer', { exact: true })).toHaveValue(
    state.draft
  )
  expect(
    await page.evaluate(
      (key) =>
        JSON.parse(localStorage.getItem(key)!).assessment.answers[0].text,
      storageKey
    )
  ).toBe(longAnswer)
  const answer = page.getByLabel('Your answer', { exact: true })
  const beforeDraft = await page.evaluate(
    () => document.documentElement.scrollHeight
  )
  await answer.fill(longAnswer)
  await expect(answer).toHaveValue(longAnswer)
  const draftSize = await answer.evaluate((element) => ({
    height: element.clientHeight,
    scrollHeight: element.scrollHeight
  }))
  expect(draftSize.height).toBeGreaterThan(384)
  expect(draftSize.scrollHeight).toBeLessThanOrEqual(draftSize.height + 1)
  expect(
    await page.evaluate(() => document.documentElement.scrollHeight)
  ).toBeGreaterThan(beforeDraft)
  await page
    .getByRole('button', { name: 'Jev / assessment debugging details' })
    .click()
  await expect(page.locator('[data-slot="json-viewer"]').first()).toHaveCSS(
    'overflow-y',
    'visible'
  )
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
  expect(apiCalls).toBe(0)
  await page.getByRole('button', { name: 'Restart', exact: true }).click()
  await page.getByRole('button', { name: 'Restart & clear' }).click()
  await expect(page.getByRole('article')).toHaveCount(0)
  await expect(page.getByLabel('Your answer', { exact: true })).toHaveValue('')
  expect(apiCalls).toBe(0)
})
