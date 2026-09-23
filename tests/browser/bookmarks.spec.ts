import { expect, test } from './fixtures'

test('bookmarks fade overflowing text without overflowing the mobile viewport', async ({
  page
}) => {
  await page.setViewportSize({ width: 1280, height: 900 })
  await page.goto('/users/noahpinion')
  const list = page.locator('[data-resource-layout="list"]')
  await page.setViewportSize({ width: 390, height: 844 })
  const text = list.locator('.fade-truncated-text')
  await expect(list.locator('[data-truncated="true"]').first()).toBeVisible()
  const measurements = await text.evaluateAll((elements) =>
    elements.map((element) => {
      const style = getComputedStyle(element)
      return {
        lines: Number(style.getPropertyValue('--fade-lines')),
        height: element.getBoundingClientRect().height,
        lineHeight: Number.parseFloat(style.lineHeight),
        truncated: element.getAttribute('data-truncated') === 'true',
        mask: style.maskImage,
        ellipsis: style.textOverflow
      }
    })
  )
  for (const item of measurements) {
    expect(item.height).toBeLessThanOrEqual(item.lines * item.lineHeight + 1)
    expect(item.ellipsis).not.toBe('ellipsis')
    expect(item.mask === 'none').toBe(!item.truncated)
  }
  const box = await list.boundingBox()
  expect(box!.width).toBeLessThan(390)
})
