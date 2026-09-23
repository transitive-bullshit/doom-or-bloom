import { test, expect, startAssessment } from './fixtures'

const sizes: Record<string, string> = {
  H1: '30px',
  H2: '24px',
  H3: '20px',
  H4: '18px',
  H5: '16px',
  H6: '14px'
}
for (const width of [390, 1488]) {
  test(`headings share one scale across pages at ${width}px`, async ({
    page
  }) => {
    await page.setViewportSize({ width, height: 1036 })
    for (const path of [
      '/about',
      '/privacy',
      '/assessments',
      '/users/jensenhuang'
    ]) {
      await page.goto(path)
      const column = page.locator('.content-column').first()
      expect((await column.boundingBox())!.width, path).toBe(
        Math.min(width, 672)
      )
      const headings = await page
        .locator('main :is(h1,h2,h3,h4,h5,h6)')
        .evaluateAll((elements) =>
          elements.map((element) => ({
            tag: element.tagName,
            size: getComputedStyle(element).fontSize,
            weight: getComputedStyle(element).fontWeight
          }))
        )
      expect(headings.length, path).toBeGreaterThan(0)
      for (const heading of headings) {
        expect(heading.size, `${path} ${heading.tag}`).toBe(sizes[heading.tag])
        expect(heading.weight, `${path} ${heading.tag}`).toBe('600')
      }
    }
    await page.goto('/')
    await expect(page.getByRole('heading', { level: 1 })).toHaveCSS(
      'font-size',
      width === 390 ? '36px' : '76px'
    )
    await startAssessment(page)
    expect(
      (await page.locator('section.content-column').boundingBox())!.width
    ).toBe(Math.min(width, 672))
    await expect(page.getByRole('heading', { level: 1 })).toHaveCSS(
      'font-size',
      '30px'
    )
    await expect(page.getByRole('heading', { level: 2 })).toHaveCSS(
      'font-size',
      '24px'
    )
    await page.screenshot({
      path: `/tmp/heading-assessment-${width}.png`,
      fullPage: true
    })
  })
}
