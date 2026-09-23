import sharp from 'sharp'
import { unzipSync, strFromU8 } from 'fflate'
import {
  expect,
  test,
  startAssessment,
  seedAssessment,
  savedAssessment,
  mockEvaluation
} from './fixtures'
import { readFile } from 'node:fs/promises'
import {
  createAssessment,
  issuePrompt,
  recordDisposition
} from '../../lib/assessment/state'
import { storageKey } from '../../lib/persistence/storage'
import { limits, versions } from '../../lib/assessment/schema'
const operationUrl = /\/api\/assessments\/[a-f0-9-]+$/
const root = 'What do you think AI means for our future—and why?'
async function submit(page: import('@playwright/test').Page, text: string) {
  await page.getByLabel('Your answer', { exact: true }).fill(text)
  const response = page.waitForResponse(
    (r) => operationUrl.test(r.url()) && r.request().method() === 'POST'
  )
  await page.getByRole('button', { name: /^Continue/ }).click()
  expect((await response).status()).toBe(200)
  await expect(
    page.getByText('Reading the evidence and choosing a useful next step…')
  ).toHaveCount(0)
}
for (const contentVersion of ['0.2.0-draft', '0.3.0-draft']) {
  test(`saved ${contentVersion} assessments preserve their content through results and a new assessment adopts the current draft`, async ({
    page
  }) => {
    const earlier = createAssessment('earlier-browser', 'fixture-v1')
    earlier.versions.content = contentVersion
    earlier.draft = 'My earlier unsent answer is intact.'
    const originalId = await seedAssessment(page, earlier)
    await expect(
      page.getByText('Updated draft available', { exact: true })
    ).toBeVisible()
    await expect(page.getByLabel('Your answer', { exact: true })).toHaveValue(
      earlier.draft
    )
    for (let i = 0; i < 3; i++)
      await submit(page, `Earlier-version synthetic answer ${i}.`)
    await page.getByRole('button', { name: 'View my results' }).click()
    await expect(page.getByRole('heading', { name: 'Results' })).toBeVisible()
    const saved = await savedAssessment(page)
    expect(saved.versions.content).toBe(contentVersion)
    expect(saved.result!.versions.content).toBe(contentVersion)
    expect(saved.answers[0]!.text).toBe('Earlier-version synthetic answer 0.')
    await page.reload()
    await expect(page.getByRole('heading', { name: 'Results' })).toBeVisible()
    await page
      .getByRole('link', { name: 'My assessments', exact: true })
      .click()
    await page
      .getByRole('button', { name: 'New assessment', exact: true })
      .click()
    await expect(page).toHaveURL(/\/assessments\/[a-f0-9-]+$/)
    await expect(page).not.toHaveURL(new RegExp(originalId))
    await expect(
      page.getByText('Updated draft available', { exact: true })
    ).toHaveCount(0)
    expect((await savedAssessment(page)).versions.content).toBe(
      versions.content
    )
    const original = await (
      await page.request.get(`/api/assessments/${originalId}`)
    ).json()
    expect(original.assessment.result.versions.content).toBe(contentVersion)
  })
}
test('long inserted answers remain intact across reload and use a soft submission limit', async ({
  page
}) => {
  const submitted: string[] = []
  page.on('request', (request) => {
    if (!operationUrl.test(request.url()) || request.method() !== 'POST') return
    const operation = request.postDataJSON().operation
    if (operation.type === 'answer') submitted.push(operation.text)
  })
  await startAssessment(page)
  const answer = page.getByLabel('Your answer', { exact: true })
  const continueButton = page.getByRole('button', { name: /^Continue/ })
  await expect(page.locator('#answer-length')).toHaveCount(0)
  await answer.fill('A short answer.')
  await expect(page.locator('#answer-length')).toHaveCount(0)
  await answer.fill('')
  const fullAnswer = 'AI could benefit people with safeguards. '.repeat(501)
  expect(fullAnswer.length).toBeGreaterThan(limits.answerChars)
  await answer.focus()
  // Native insertion models dictation/paste and catches browser maxlength truncation.
  await page.keyboard.insertText(fullAnswer)
  await expect(answer).toHaveValue(fullAnswer)
  expect(await answer.getAttribute('maxlength')).toBeNull()
  await expect(answer).toBeEnabled()
  await expect(answer).toHaveAttribute('aria-invalid', 'true')
  await expect(continueButton).toBeDisabled()
  await expect(page.locator('#answer-length')).toHaveText(
    `${fullAnswer.length.toLocaleString('en-US')} / 20,000 characters`
  )
  await expect(page.locator('#answer-limit')).toHaveText(
    `Your full answer is still here. Shorten it by ${(fullAnswer.length - limits.answerChars).toLocaleString('en-US')} characters to continue.`
  )
  await page.reload()
  await expect(answer).toHaveValue(fullAnswer)
  await expect(continueButton).toBeDisabled()
  // Direct form submission must respect the same guard as the disabled button.
  await page.locator('form').evaluate((form) => {
    const element = form as HTMLFormElement
    element.requestSubmit()
  })
  expect(submitted).toEqual([])
  const accepted = 'a'.repeat(limits.answerChars)
  await answer.fill(accepted)
  await expect(page.locator('#answer-length')).toHaveCount(0)
  await expect(answer).toHaveAttribute('aria-invalid', 'false')
  await expect(page.locator('#answer-limit')).toHaveCount(0)
  await expect(continueButton).toBeEnabled()
  const response = page.waitForResponse(
    (r) => operationUrl.test(r.url()) && r.request().method() === 'POST'
  )
  await continueButton.click()
  expect((await response).status()).toBe(200)
  await expect(answer).toHaveValue('')
  expect(submitted).toEqual([accepted])
  expect((await savedAssessment(page)).answers[0]!.text).toBe(accepted)
})
test('three answers, draft resume, map, report download and another assessment', async ({
  page
}, testInfo) => {
  const outbound: string[] = []
  page.on('request', (r) => {
    if (/posthog|analytics|typesafe\.ai/.test(r.url())) outbound.push(r.url())
  })
  await startAssessment(page)
  await expect(page.getByRole('heading', { name: root })).toBeVisible()
  await page.getByLabel('Your answer', { exact: true }).fill('Unsent draft')
  await page.reload()
  await expect(page.getByLabel('Your answer', { exact: true })).toHaveValue(
    'Unsent draft'
  )
  for (let i = 0; i < 3; i++)
    await submit(page, `Relevant synthetic answer ${i}.`)
  await page.getByRole('button', { name: 'View my results' }).click()
  await expect(page.getByRole('heading', { name: 'Results' })).toBeVisible()
  await expect(
    page.getByRole('article', { name: 'Question 1 and replies', exact: true })
  ).toContainText('Relevant synthetic answer 0.')
  await expect(
    page.getByRole('img', { name: /^Doom–Bloom:/ }).first()
  ).toHaveAttribute('aria-label', /interpretation coordinates/)
  await expect(
    page.getByText('Your milestone timeline', { exact: true })
  ).toHaveCount(0)
  await expect(
    page.getByText('What your outlook hinges on', { exact: true })
  ).toHaveCount(0)
  await expect(
    page.getByText('Reasoning judgments to inspect', { exact: true })
  ).toHaveCount(0)
  await expect(
    page.getByRole('button', { name: 'Review & clarify my results' })
  ).toHaveCount(0)
  const reportWait = page.waitForEvent('download')
  await page.getByRole('button', { name: 'Download full report' }).click()
  const report = await reportWait
  const files = unzipSync(await readFile((await report.path())!))
  expect(Object.keys(files).sort()).toEqual([
    'assessment.md',
    'diagnostics.json',
    'interview.md',
    'results.png',
    'worldview-map.png'
  ])
  const diagnostics = JSON.parse(strFromU8(files['diagnostics.json']!))
  expect(report.suggestedFilename()).toBe(
    `doom or bloom assessment ${diagnostics.assessmentId}.zip`
  )
  expect(strFromU8(files['interview.md']!)).toContain(
    'Relevant synthetic answer 0.'
  )
  expect(strFromU8(files['assessment.md']!)).toContain('## Profile')
  expect(strFromU8(files['assessment.md']!)).not.toContain('```json')
  expect(diagnostics.versions.assessment).toBe(versions.assessment)
  for (const name of ['results.png', 'worldview-map.png'])
    expect(Buffer.from(files[name]!).subarray(0, 8).toString('hex')).toBe(
      '89504e470d0a1a0a'
    )
  const mapPixels = await sharp(files['worldview-map.png']!)
    .resize(100, 60)
    .removeAlpha()
    .raw()
    .toBuffer()
  let coloredPixels = 0
  for (let i = 0; i < mapPixels.length; i += 3) {
    const channels = [mapPixels[i]!, mapPixels[i + 1]!, mapPixels[i + 2]!]
    if (Math.max(...channels) - Math.min(...channels) > 30) coloredPixels++
  }
  // The archive must contain the colored worldview field, not the toolbar icon.
  expect(coloredPixels / (100 * 60)).toBeGreaterThan(0.2)
  await report.saveAs(testInfo.outputPath('full-report.zip'))
  await expect(page.getByRole('link', { name: 'Post on X' })).toHaveCount(0)
  expect(outbound).toEqual([])
  const previous = page.url()
  await page.getByRole('link', { name: 'My assessments', exact: true }).click()
  await page
    .getByRole('button', { name: 'New assessment', exact: true })
    .click()
  await expect(page).toHaveURL(/\/assessments\/[a-f0-9-]+$/)
  await expect(page).not.toHaveURL(previous)
  await expect(page.getByRole('heading', { name: root })).toBeVisible()
})
test('bounded nonsense recovery, paperclip dismissal, refresh and exhaustion', async ({
  page
}) => {
  let calls = 0
  await mockEvaluation(page, async (input) => {
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
    return {
      assessmentId: state.id,
      baseRevision: state.revision - 1,
      requestId: input.requestId,
      assessment: state,
      provider: 'fixture'
    }
  })
  await startAssessment(page)
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
  await expect(page.getByLabel('Your answer', { exact: true })).toBeEnabled()
  await submit(page, 'nonsense three')
  await submit(page, 'nonsense four')
  await expect(
    page.getByRole('button', { name: 'Try again', exact: true })
  ).toHaveCount(0)
  await expect(
    page.getByRole('button', { name: 'View my results' })
  ).toHaveCount(0)
  expect(calls).toBe(4)
})
test('two tabs cannot overwrite committed answers', async ({
  page,
  context
}) => {
  await startAssessment(page)
  const second = await context.newPage()
  await second.goto(page.url())
  await submit(second, 'The saved answer from the second tab.')
  await page
    .getByLabel('Your answer', { exact: true })
    .fill('Stale competing answer.')
  const rejected = page.waitForResponse(
    (r) => operationUrl.test(r.url()) && r.status() === 409
  )
  await page.getByRole('button', { name: /^Continue/ }).click()
  await rejected
  await page.getByRole('button', { name: 'Refresh saved progress' }).click()
  await expect(
    page.getByRole('article', { name: 'Question 1 and replies' })
  ).toContainText('The saved answer from the second tab.')
  const state = await savedAssessment(page)
  expect(state.answers.map((answer) => answer.text)).toEqual([
    'The saved answer from the second tab.'
  ])
})
test('an unavailable response preserves the draft and previous saved progress', async ({
  page
}) => {
  await startAssessment(page)
  await submit(page, 'AI could improve medicine with careful governance.')
  const before = await savedAssessment(page)
  await page.route(operationUrl, (route) =>
    route.request().method() === 'POST'
      ? route.fulfill({
          status: 503,
          json: { error: 'Evaluator unavailable.' }
        })
      : route.continue()
  )
  await page
    .getByLabel('Your answer', { exact: true })
    .fill('preserved on failure')
  await page.getByRole('button', { name: /^Continue/ }).click()
  await expect(
    page.getByRole('button', { name: 'Check submission', exact: true })
  ).toBeVisible()
  await expect(page.getByLabel('Your answer', { exact: true })).toHaveValue(
    'preserved on failure'
  )
  expect((await savedAssessment(page)).revision).toBe(before.revision)
  await page.reload()
  await expect(page.getByLabel('Your answer', { exact: true })).toHaveValue(
    'preserved on failure'
  )
})
test('legacy corrupt storage is ignored and unavailable draft storage still saves submitted progress', async ({
  page
}) => {
  await page.addInitScript(
    (key) => localStorage.setItem(key, '{bad'),
    storageKey
  )
  await startAssessment(page)
  await expect(page.getByLabel('Your answer', { exact: true })).toBeEnabled()
  await page.addInitScript(() => {
    Object.defineProperty(window, 'localStorage', {
      get: () => {
        throw new Error('unavailable')
      }
    })
  })
  await page.reload()
  await page
    .getByLabel('Your answer', { exact: true })
    .fill('Server saved answer despite unavailable local storage.')
  await expect(
    page.getByText(
      'Unsubmitted typing cannot be saved in this browser. Submitted progress is saved on the server.'
    )
  ).toBeVisible()
  const refreshed = page.waitForResponse(
    (r) => operationUrl.test(r.url()) && r.request().method() === 'GET'
  )
  await page.getByRole('button', { name: 'Refresh saved progress' }).click()
  await refreshed
  await expect(page.getByLabel('Your answer', { exact: true })).toHaveValue(
    'Server saved answer despite unavailable local storage.'
  )
  await submit(page, 'Server saved answer despite unavailable local storage.')
  await page.reload()
  await expect(
    page.getByRole('article', { name: 'Question 1 and replies' })
  ).toContainText('Server saved answer despite unavailable local storage.')
})
test('the twelfth prompt finalizes insufficient evidence after a non-answer without issuing another', async ({
  page
}) => {
  let state = createAssessment('browser-cap', 'fixture-v1')
  for (let i = 1; i < 12; i++)
    state = issuePrompt(state, {
      promptId: 'timeline.general',
      text: 'When, if ever, do you expect AI to bring major changes to everyday life?',
      family: 'timeline',
      variant: 'original',
      sourceEvidenceIds: []
    })
  await seedAssessment(page, state)
  await expect(page.getByText('Approaching the limit')).toBeVisible()
  await submit(page, 'test')
  await expect(page.getByText('12-prompt cap reached')).toBeVisible()
  await expect(
    page.getByText('Insufficient evidence', { exact: true })
  ).toBeVisible()
  await expect(
    page.getByRole('button', { name: 'Continue answering questions' })
  ).toHaveCount(0)
})
test('a lost response replays its original key without duplicating the semantic attempt', async ({
  page
}) => {
  const ids: string[] = []
  await page.route(operationUrl, async (route) => {
    if (route.request().method() !== 'POST') return route.continue()
    ids.push(route.request().postDataJSON().requestKey)
    const response = await route.fetch()
    if (ids.length === 1) await route.abort('failed')
    else await route.fulfill({ response })
  })
  await startAssessment(page)
  await page
    .getByLabel('Your answer', { exact: true })
    .fill('Preserved after a lost response.')
  await page.getByRole('button', { name: /^Continue/ }).click()
  const check = page.getByRole('button', {
    name: 'Check submission',
    exact: true
  })
  await expect(check).toBeVisible()
  await check.click()
  await expect(page.getByLabel('Your answer', { exact: true })).toHaveValue('')
  expect(ids).toHaveLength(2)
  expect(ids[0]).toBe(ids[1])
  const state = await savedAssessment(page)
  expect(state.attempts.filter((attempt) => attempt.evaluated)).toHaveLength(1)
  expect(state.answers.map((answer) => answer.text)).toEqual([
    'Preserved after a lost response.'
  ])
})

test('a well-covered first answer offers results while ordinary follow-ups remain the default', async ({
  page
}) => {
  const requests: string[] = []
  page.on('request', (request) => {
    if (/typesafe\.ai|posthog/.test(request.url())) requests.push(request.url())
  })
  await startAssessment(page)
  await expect(
    page.getByRole('meter', { name: 'Evidence readiness' })
  ).toHaveCount(0)
  await expect(
    page.getByRole('button', { name: 'View my results' })
  ).toHaveCount(0)
  // Fixture judgments represent comprehensive coverage; this does not test live semantics.
  await submit(
    page,
    'My detailed expectations, mechanisms, uncertainties and counterarguments. '.repeat(
      30
    )
  )
  await expect(
    page.getByRole('meter', { name: 'Evidence readiness' })
  ).toHaveAttribute('aria-valuenow', '100')
  await expect(
    page.getByRole('button', { name: 'View my results' })
  ).toBeEnabled()
  await expect(page.getByLabel('Your answer', { exact: true })).toBeVisible()
  const state = await savedAssessment(page)
  expect(state.answers).toHaveLength(1)
  expect(state.prompts).toHaveLength(2)
  await page.getByRole('button', { name: 'view your results now' }).click()
  await expect(page.getByRole('heading', { name: 'Results' })).toBeVisible()
  await expect(
    page.locator('[data-slot="worldview-map"]').first()
  ).toContainText('scale of transformation')
  await expect(
    page.locator('[data-slot="worldview-map"]').first()
  ).toContainText('interpretation coordinates, not event probabilities')
  expect(requests).toEqual([])
})
