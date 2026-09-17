import { expect, test } from '@playwright/test'
import {
  createAssessment,
  issuePrompt,
  recordDisposition
} from '../../lib/assessment/state'
import { storageKey } from '../../lib/persistence/storage'
const root = 'What do you think AI means for our future—and why?'
async function submit(page: import('@playwright/test').Page, text: string) {
  await page.getByLabel('Your answer', { exact: true }).fill(text)
  await page.getByRole('button', { name: /^Continue/ }).click()
  await expect(
    page.getByRole('button', { name: /^Reading your answer/ })
  ).toHaveCount(0)
}
test('three answers, draft resume, map, correction, downloads and restart', async ({
  page
}) => {
  const outbound: string[] = []
  page.on('request', (r) => {
    if (/posthog|analytics|typesafe\.ai/.test(r.url())) outbound.push(r.url())
  })
  await page.goto('/')
  await expect(page.getByRole('heading', { name: root })).toBeVisible()
  await page.getByLabel('Your answer', { exact: true }).fill('Unsent draft')
  await page.reload()
  await expect(page.getByLabel('Your answer', { exact: true })).toHaveValue(
    'Unsent draft'
  )
  for (let i = 0; i < 3; i++)
    await submit(page, `Relevant synthetic answer ${i}.`)
  await page.getByRole('button', { name: 'View my result' }).click()
  await expect(
    page.getByRole('heading', { name: 'A map of your AI worldview' })
  ).toBeFocused()
  await expect(page.getByRole('img', { name: /^Doom–Bloom:/ })).toHaveAttribute(
    'aria-label',
    /interpretation coordinates/
  )
  await page
    .getByRole('button', { name: 'Inspect evidence & clarify my view' })
    .click()
  await page
    .getByRole('button', { name: 'That’s not quite my view' })
    .first()
    .click()
  await submit(
    page,
    'I meant current testing is insufficient, not that control is impossible.'
  )
  await expect(
    page.getByRole('heading', { name: 'A map of your AI worldview' })
  ).toBeVisible()
  const reportWait = page.waitForEvent('download')
  await page.getByRole('button', { name: 'Download full report' }).click()
  expect((await reportWait).suggestedFilename()).toBe('doom-or-bloom-report.md')
  const cardWait = page.waitForEvent('download')
  await page.getByRole('button', { name: 'Download card' }).click()
  expect((await cardWait).suggestedFilename()).toBe('doom-or-bloom.png')
  await expect(page.getByRole('link', { name: 'Post on X' })).toHaveAttribute(
    'href',
    /x.com\/intent\/post/
  )
  expect(outbound).toEqual([])
  await page.getByRole('button', { name: 'Restart', exact: true }).click()
  await page.getByRole('button', { name: 'Restart & clear' }).click()
  await expect(page.getByRole('heading', { name: root })).toBeVisible()
})
test('bounded nonsense recovery, paperclip dismissal, refresh and exhaustion', async ({
  page
}) => {
  let calls = 0
  await page.route('**/api/assessment', async (route) => {
    const input = route.request().postDataJSON()
    const state =
      input.operation.type === 'answer'
        ? recordDisposition(input.assessment, 'non_answer', 1, input.requestId)
        : input.assessment
    calls += input.operation.type === 'answer' ? 1 : 0
    if (input.operation.type === 'retry') {
      state.status = 'recovery'
      state.recovery.paperclipActive = false
    }
    if (input.operation.type === 'dismiss')
      state.recovery.paperclipActive = false
    state.revision++
    await route.fulfill({
      json: {
        assessmentId: state.id,
        baseRevision: state.revision - 1,
        requestId: input.requestId,
        assessment: state,
        provider: 'fixture'
      }
    })
  })
  await page.goto('/')
  await submit(page, 'nonsense one')
  await expect(page.getByText('Another try?', { exact: true })).toBeVisible()
  await submit(page, 'nonsense two')
  await expect(
    page.getByText('We’ve made some paperclips.', { exact: true })
  ).toBeVisible()
  await expect(
    page.getByRole('button', { name: 'Dismiss paperclips' })
  ).toBeVisible()
  await page.getByRole('button', { name: 'Dismiss paperclips' }).click()
  expect(calls).toBe(2)
  await page.reload()
  await expect(
    page.getByRole('button', { name: 'Dismiss paperclips' })
  ).toHaveCount(0)
  await page.getByRole('button', { name: 'Try again', exact: true }).click()
  await submit(page, 'nonsense three')
  await expect(
    page.getByRole('button', { name: 'Try again', exact: true })
  ).toHaveCount(0)
  await expect(
    page.getByRole('button', { name: 'View my result' })
  ).toHaveCount(0)
  expect(calls).toBe(3)
})
test('two tabs cannot overwrite each other', async ({ page, context }) => {
  await page.goto('/')
  const second = await context.newPage()
  await second.goto('/')
  await second.getByLabel('Your answer', { exact: true }).fill('newer draft')
  await expect(
    page.getByText('This assessment changed in another tab')
  ).toBeVisible()
  await expect(page.getByLabel('Your answer', { exact: true })).toBeDisabled()
  await page.getByRole('button', { name: 'Reload latest version' }).click()
  await expect(page.getByLabel('Your answer', { exact: true })).toHaveValue(
    'newer draft'
  )
})
test('restart discards in-flight work; provider failure preserves draft', async ({
  page
}) => {
  let release: (() => void) | undefined
  await page.route('**/api/assessment', async (route) => {
    await new Promise<void>((resolve) => {
      release = resolve
    })
    await route
      .fulfill({
        status: 503,
        json: {
          error:
            'The evaluator is temporarily unavailable. Your answer is saved; please retry.'
        }
      })
      .catch(() => {
        /* Restart cancels the obsolete browser request. */
      })
  })
  await page.goto('/')
  await page.getByLabel('Your answer', { exact: true }).fill('surviving draft')
  await page.getByRole('button', { name: /^Continue/ }).click()
  await expect(
    page.getByText('Reading the evidence and choosing a useful next step…')
  ).toBeVisible()
  await page.getByRole('button', { name: 'Restart', exact: true }).click()
  await page.getByRole('button', { name: 'Restart & clear' }).click()
  release?.()
  await expect(page.getByRole('heading', { name: root })).toBeVisible()
  await expect(page.getByLabel('Your answer', { exact: true })).toHaveValue('')
  await page.unroute('**/api/assessment')
  await page.route('**/api/assessment', (route) =>
    route.fulfill({
      status: 503,
      json: {
        error:
          'The evaluator is temporarily unavailable. Your answer is saved; please retry.'
      }
    })
  )
  await submit(page, 'preserved on failure')
  await expect(page.getByText('Could not complete that step')).toBeVisible()
  await expect(page.getByLabel('Your answer', { exact: true })).toHaveValue(
    'preserved on failure'
  )
})
test('corrupt storage offers backup; unavailable storage permits ephemeral use', async ({
  page
}) => {
  await page.addInitScript(
    (key) => localStorage.setItem(key, '{bad'),
    storageKey
  )
  await page.goto('/')
  await expect(
    page.getByRole('button', { name: 'Download saved backup' })
  ).toBeVisible()
  await expect(page.getByLabel('Your answer', { exact: true })).toBeDisabled()
  const ephemeral = await page.context().browser()!.newContext()
  const other = await ephemeral.newPage()
  await other.addInitScript(() => {
    Object.defineProperty(window, 'localStorage', {
      get: () => {
        throw new Error('unavailable')
      }
    })
  })
  await other.goto('http://localhost:3011/')
  await expect(
    other.getByText(
      'Browser storage is unavailable. Keep this tab open to preserve progress.'
    )
  ).toBeVisible()
  await expect(other.getByLabel('Your answer', { exact: true })).toBeEnabled()
  await ephemeral.close()
})
test('the fiftieth prompt finalizes without issuing another', async ({
  page
}) => {
  let state = createAssessment('browser-cap', 'fixture-v1')
  for (let i = 1; i < 50; i++)
    state = issuePrompt(state, {
      promptId: 'timeline.general',
      text: 'When do you expect AI to make changes on that scale, if ever?',
      family: 'timeline',
      variant: 'original',
      sourceEvidenceIds: []
    })
  await page.addInitScript(
    ({ key, snapshot }) =>
      localStorage.setItem(
        key,
        JSON.stringify({ token: 'cap-token', assessment: snapshot })
      ),
    { key: storageKey, snapshot: state }
  )
  await page.goto('/')
  await expect(page.getByText('Approaching the limit')).toBeVisible()
  await submit(page, 'I do not know when, if ever.')
  await expect(page.getByText('50-prompt cap reached')).toBeVisible()
  await expect(
    page.getByText('Insufficient evidence', { exact: true })
  ).toBeVisible()
  await expect(
    page.getByRole('button', { name: 'Keep exploring' })
  ).toHaveCount(0)
})
test('an uncertain transport retry reuses the same request and semantic attempt', async ({
  page
}) => {
  const ids: string[] = []
  await page.route('**/api/assessment', async (route) => {
    ids.push(route.request().postDataJSON().requestId)
    const response = await route.fetch()
    if (ids.length === 1) await route.abort('failed')
    else await route.fulfill({ response })
  })
  await page.goto('/')
  await submit(page, 'Preserved after a lost response.')
  await expect(page.getByText('Could not complete that step')).toBeVisible()
  await submit(page, 'Preserved after a lost response.')
  await expect(page.getByLabel('Your answer', { exact: true })).toHaveValue('')
  expect(ids).toHaveLength(2)
  expect(ids[0]).toBe(ids[1])
})
