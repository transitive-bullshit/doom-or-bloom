import { expect, test, startAssessment } from './fixtures'

test('participants place themselves before the reveal and can say whether the result feels right', async ({
  page
}, testInfo) => {
  await startAssessment(page)
  const id = new URL(page.url()).pathname.split('/').at(-1)!
  // Fixture judgments place the map after one answer; this does not test live semantics.
  await page
    .getByLabel('Your answer', { exact: true })
    .fill('I expect useful tools and serious risks, depending on oversight.')
  await page.getByRole('button', { name: /^Continue/ }).click()
  await page.getByRole('button', { name: 'View my results' }).click()

  await expect(
    page.getByRole('heading', { name: 'Your results are ready', exact: true })
  ).toBeVisible()
  const reveal = page.getByRole('button', { name: 'Show where I landed' })
  await expect(reveal).toBeDisabled()
  await expect(page.getByRole('img', { name: /^Doom–Bloom:/ })).toHaveCount(0)
  const map = page.locator('[data-slot="worldview-map-svg"]')
  const box = (await map.boundingBox())!
  await page.mouse.click(box.x + box.width * 0.8, box.y + box.height * 0.2)
  await expect(page.locator('[data-slot="worldview-map-guess"]')).toBeVisible()
  await page.screenshot({ path: testInfo.outputPath('self-placement.png') })
  await reveal.click()

  await expect(
    page.getByRole('heading', { name: 'Results', exact: true })
  ).toBeVisible()
  await expect(page.getByText('Your guess', { exact: true })).toBeVisible()
  await expect(
    page.getByText(/^Your answers read as|^Close to where you placed yourself/)
  ).toBeVisible()
  const feedback = page.getByRole('region', { name: 'Result feedback' })
  await expect(feedback.getByText('Does this feel right?')).toBeVisible()
  await feedback.getByRole('button', { name: 'Not quite' }).click()
  await feedback
    .getByRole('button', { name: 'I’m more hopeful than this' })
    .click()
  await feedback
    .getByLabel('What feels off (optional)')
    .fill('I am more optimistic about oversight.')
  await feedback.getByRole('button', { name: 'Send' }).click()
  await expect(feedback.getByText(/Thanks for telling us/)).toBeVisible()
  await page.screenshot({
    path: testInfo.outputPath('result-feedback.png'),
    fullPage: true
  })

  const saved = await page.request.get(`/api/assessments/${id}/feedback`)
  expect(saved.ok()).toBe(true)
  const { feedback: items } = (await saved.json()) as {
    feedback: Array<{ kind: string; payload: Record<string, unknown> }>
  }
  expect(items.map((item) => item.kind).sort()).toEqual([
    'agreement',
    'self_placement'
  ])
  expect(
    items.find((item) => item.kind === 'agreement')?.payload
  ).toMatchObject({
    rating: 'not_quite',
    aspects: ['outlook_too_doom'],
    comment: 'I am more optimistic about oversight.',
    // The server records what was displayed alongside the rating.
    shown: { x: expect.any(Number), y: expect.any(Number) }
  })
  const guess = items.find((item) => item.kind === 'self_placement')
    ?.payload as { guess: { x: number; y: number } }
  expect(guess.guess.x).toBeGreaterThan(0.6)
  expect(guess.guess.y).toBeGreaterThan(0.6)

  // A reveal is never offered twice, and saved feedback is shown again.
  await page.reload()
  await expect(
    page.getByRole('heading', { name: 'Results', exact: true })
  ).toBeVisible()
  await expect(
    page.getByRole('heading', { name: 'Your results are ready' })
  ).toHaveCount(0)
  await expect(page.getByText('Your guess', { exact: true })).toBeVisible()
  await expect(
    page
      .getByRole('region', { name: 'Result feedback' })
      .getByText(/Thanks for telling us/)
  ).toBeVisible()
})

test('a large placement gap offers one question, and answering it updates the result', async ({
  page
}, testInfo) => {
  await startAssessment(page)
  await page
    .getByLabel('Your answer', { exact: true })
    .fill('I expect useful tools and serious risks, depending on oversight.')
  await page.getByRole('button', { name: /^Continue/ }).click()
  await page.getByRole('button', { name: 'View my results' }).click()
  // Fixture judgments place the result at the worried, low-change corner; a
  // guess in the hopeful, high-change corner is far from it on both axes.
  const map = page.locator('[data-slot="worldview-map-svg"]')
  const box = (await map.boundingBox())!
  await page.mouse.click(box.x + box.width * 0.9, box.y + box.height * 0.1)
  await page.getByRole('button', { name: 'Show where I landed' }).click()

  const question = page.getByRole('region', {
    name: 'A question about the difference'
  })
  await expect(
    question.getByText(
      'You placed yourself as more hopeful than your answers suggest. What gives you hope that we missed?'
    )
  ).toBeVisible()
  await page.screenshot({
    path: testInfo.outputPath('placement-question.png'),
    fullPage: true
  })
  await question.getByRole('button', { name: 'Answer this question' }).click()
  await page
    .getByLabel('Your answer', { exact: true })
    .fill('I expect people to adapt and share the gains over time.')
  await page.getByRole('button', { name: /^Continue/ }).click()

  // The answer returns straight to an updated result, and the question is not offered again.
  await expect(
    page.getByRole('heading', { name: 'Results', exact: true })
  ).toBeVisible()
  await expect(
    page.getByRole('heading', { name: 'Your results are ready' })
  ).toHaveCount(0)
  await expect(page.getByText(/^Your answers read as/)).toBeVisible()
  await expect(
    page.getByRole('region', { name: 'A question about the difference' })
  ).toHaveCount(0)
})
