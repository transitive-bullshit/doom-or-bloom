import {
  expect,
  test,
  startAssessment,
  mockEvaluation,
  skipSelfPlacement
} from './fixtures'
import { execFileSync } from 'node:child_process'
import type { Tweet } from 'react-tweet/api'

const tweetText =
  'Synthetic source post for testing embedded tweets and responsive source layouts.'
const tweet = (id: string): Tweet => ({
  __typename: 'Tweet',
  id_str: id,
  text: tweetText,
  lang: 'en',
  created_at: '2026-09-12T12:00:00.000Z',
  display_text_range: [0, tweetText.length],
  user: {
    id_str: '123',
    name: 'Test source author',
    screen_name: 'test_source',
    profile_image_url_https: '/personas/altman.jpg',
    profile_image_shape: 'Circle',
    verified: false,
    is_blue_verified: false
  },
  edit_control: {
    edit_tweet_ids: [id],
    editable_until_msecs: '0',
    is_edit_eligible: false,
    edits_remaining: '0'
  },
  isEdited: false,
  isStaleEdit: false,
  favorite_count: 2,
  conversation_count: 1,
  news_action_type: 'conversation'
})

test('persona bookmarks precede a separate themed tweet masonry', async ({
  page
}, testInfo) => {
  const hydrationErrors: string[] = []
  page.on('console', (message) => {
    if (message.type() === 'error' && /hydrat/i.test(message.text()))
      hydrationErrors.push(message.text())
  })
  // The server cannot see this preference; tweets must still hydrate cleanly.
  await page.emulateMedia({ colorScheme: 'dark' })
  await page.route('**/api/tweet?*', (route) =>
    route.fulfill({
      json: {
        data: tweet(new URL(route.request().url()).searchParams.get('id')!)
      }
    })
  )
  await page.goto('/users/sama')
  const sources = page.getByRole('region', { name: 'Sources', exact: true })
  await expect(sources.locator('.resource-tweet article').first()).toBeVisible()
  await expect(sources).toContainText(tweetText)
  const layout = sources.locator('[data-resource-layout=masonry]')
  await expect(layout).toHaveAttribute('data-resource-layout', 'masonry')
  await expect(layout).toHaveCSS('column-count', '2')
  const masonryBox = (await layout.boundingBox())!
  const sourceBox = (await sources.boundingBox())!
  expect(sourceBox.width).toBe(720)
  expect(masonryBox.width).toBeGreaterThan(sourceBox.width)
  expect(masonryBox.width).toBeLessThanOrEqual(1152)
  expect(
    Math.abs(
      masonryBox.x + masonryBox.width / 2 - (sourceBox.x + sourceBox.width / 2)
    )
  ).toBeLessThan(1)
  const bookmarks = sources.locator('[data-resource-layout=list]')
  await expect(bookmarks.locator('.resource-tweet')).toHaveCount(0)
  expect(
    await bookmarks.evaluate((element) =>
      Boolean(
        element.nextElementSibling?.matches('[data-resource-layout=masonry]')
      )
    )
  ).toBe(true)
  await sources.screenshot({ path: testInfo.outputPath('tweet-masonry.png') })
  const card = sources.locator('.resource-tweet .react-tweet-theme').first()
  await expect(card).toHaveCSS('background-color', 'rgb(21, 32, 43)')
  await page.getByRole('button', { name: 'Toggle light or dark theme' }).click()
  // The site's light theme overrides the dark system preference.
  await expect(card).toHaveCSS('background-color', 'rgb(255, 255, 255)')
  await page.setViewportSize({ width: 390, height: 844 })
  await expect(layout).toHaveCSS('column-count', '1')
  expect(
    await page.evaluate(() => document.documentElement.scrollWidth)
  ).toBeLessThanOrEqual(390)
  expect(hydrationErrors).toEqual([])
})

test('assessment resources embed tweets and keep a bookmark when a post cannot load', async ({
  page
}) => {
  await page.route('**/api/tweet?*', (route) => {
    const id = new URL(route.request().url()).searchParams.get('id')!
    return route.fulfill(
      id === '123'
        ? { json: { data: tweet(id) } }
        : { status: 502, json: { data: null } }
    )
  })
  await mockEvaluation(page, async (input) => {
    const response = JSON.parse(
      execFileSync(
        process.execPath,
        [
          '--conditions=react-server',
          '--import',
          'tsx',
          'tests/browser/early-engine.ts'
        ],
        { input: JSON.stringify(input), encoding: 'utf8' }
      )
    )
    // Early answers have no result yet; resources attach once one exists.
    if (!response.assessment.result) return response
    response.assessment.result.resources = [
      {
        id: 'resource.tweet',
        title: 'A source post',
        url: 'https://x.com/test_source/status/123'
      },
      {
        id: 'resource.unavailable',
        title: 'Unavailable source post',
        url: 'https://twitter.com/test_source/status/456'
      },
      {
        id: 'resource.article',
        title: 'A regular article',
        url: 'https://example.org/ai'
      }
    ].map((resource) => ({
      ...resource,
      purpose: 'Test source',
      effort: 'Short read'
    }))
    return response
  })
  await startAssessment(page)
  for (let i = 0; i < 4; i++) {
    await page
      .getByLabel('Your answer', { exact: true })
      .fill(
        'I expect useful tools and serious risks, with outcomes depending on oversight. Independent tests could change my view.'
      )
    await page.getByRole('button', { name: /^Continue/ }).click()
    if (i < 3)
      await expect(page.getByLabel('Your answer', { exact: true })).toHaveValue(
        ''
      )
  }
  await skipSelfPlacement(page)
  await expect(page.locator('.resource-tweet article')).toHaveCount(1)
  await expect(page.locator('[data-resource-layout=masonry]')).toHaveAttribute(
    'data-resource-layout',
    'masonry'
  )
  await expect(
    page.getByRole('link', { name: /Unavailable source post/ })
  ).toHaveAttribute('href', 'https://twitter.com/test_source/status/456')
  const regular = page.locator('[data-resource-layout=list]')
  await expect(
    regular.getByRole('link', { name: /A regular article/ })
  ).toBeVisible()
  expect(
    await regular.evaluate((element) =>
      Boolean(
        element.nextElementSibling?.matches('[data-resource-layout=masonry]')
      )
    )
  ).toBe(true)
})
