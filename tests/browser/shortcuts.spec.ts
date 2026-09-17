import { expect, test } from '@playwright/test'
import {
  acceptAnswer,
  currentPrompt,
  issuePrompt
} from '../../lib/assessment/state'

test('Cmd/Ctrl+Enter submits through the normal guards; Enter and composition remain native', async ({
  page
}) => {
  let submitted: string[] = []
  await page.route('**/api/assessment', async (route) => {
    const input = route.request().postDataJSON()
    submitted.push(input.operation.text)
    const prompt = currentPrompt(input.assessment)
    let state = acceptAnswer(input.assessment, {
      id: `${prompt.id}:a`,
      promptInstanceId: prompt.id,
      promptText: prompt.text,
      text: input.operation.text,
      substantive: true,
      hasHorizon: false,
      hasConviction: false
    })
    state = issuePrompt(state, {
      promptId: 'timeline.general',
      text: 'When do you expect these changes?',
      family: 'timeline',
      variant: 'original',
      sourceEvidenceIds: []
    })
    state.revision++
    await route.fulfill({
      json: {
        assessmentId: state.id,
        baseRevision: input.assessment.revision,
        requestId: input.requestId,
        assessment: state,
        provider: 'fixture'
      }
    })
  })
  await page.goto('/')
  const answer = page.getByLabel('Your answer', { exact: true })
  await answer.press('Meta+Enter')
  await answer.fill('   ')
  await answer.press('Control+Enter')
  expect(submitted).toEqual([])
  const longDraft = 'a'.repeat(20_001)
  await answer.fill(longDraft)
  await answer.press('Meta+Enter')
  expect(submitted).toEqual([])
  await expect(answer).toHaveValue(longDraft)
  await answer.fill('AI could improve medicine.')
  await answer.press('Enter')
  await page.keyboard.type('The timing is uncertain.')
  await expect(answer).toHaveValue(
    'AI could improve medicine.\nThe timing is uncertain.'
  )
  await answer.press('Meta+Enter')
  await expect(answer).toHaveValue('')
  expect(submitted).toEqual([
    'AI could improve medicine.\nThe timing is uncertain.'
  ])
  await answer.fill('Possibly in five years.')
  await answer.press('Control+Enter')
  await expect(answer).toHaveValue('')
  expect(submitted).toHaveLength(2)
  await answer.fill('An unfinished composed answer')
  await answer.dispatchEvent('keydown', {
    key: 'Enter',
    ctrlKey: true,
    bubbles: true,
    isComposing: true
  })
  await answer.dispatchEvent('keydown', {
    key: 'Enter',
    metaKey: true,
    bubbles: true,
    repeat: true
  })
  expect(submitted).toHaveLength(2)
  await expect(answer).toHaveValue('An unfinished composed answer')
})
