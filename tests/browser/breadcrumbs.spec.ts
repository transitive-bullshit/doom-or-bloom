import { test, expect, startAssessment } from './fixtures'

test('shared breadcrumbs precede page content and navigate back to the library', async ({
  page
}) => {
  for (const [path, label] of [
    ['/about', 'About'],
    ['/privacy', 'Privacy'],
    ['/assessments', 'My assessments'],
    ['/users/jensenhuang', '@jensenhuang'],
    ['/questions', 'Questions'],
    ['/corpus', 'Corpus'],
    ['/user-journeys', 'User Journeys']
  ]) {
    await page.goto(path!)
    const breadcrumb = page.getByRole('navigation', { name: 'breadcrumb' })
    await expect(breadcrumb.locator('[aria-current="page"]')).toHaveText(label!)
    await expect(
      breadcrumb.getByRole('link', { name: 'Home', exact: true })
    ).toHaveAttribute('href', '/')
    expect(
      await breadcrumb.evaluate((node) => {
        const heading = document.querySelector('main h1')!
        return (
          node.parentElement?.firstElementChild === node &&
          Boolean(
            node.compareDocumentPosition(heading) &
            Node.DOCUMENT_POSITION_FOLLOWING
          )
        )
      })
    ).toBe(true)
  }
  await page.goto('/')
  await expect(
    page.getByRole('navigation', { name: 'breadcrumb' })
  ).toHaveCount(0)
  await startAssessment(page)
  const breadcrumb = page.getByRole('navigation', { name: 'breadcrumb' })
  await expect(breadcrumb.locator('[aria-current="page"]')).toHaveText(
    'Assessment'
  )
  await breadcrumb
    .getByRole('link', { name: 'My assessments', exact: true })
    .click()
  await expect(page).toHaveURL(/\/assessments$/)
})
