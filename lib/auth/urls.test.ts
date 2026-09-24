import { afterEach, expect, test, vi } from 'vitest'
import { authUrls } from './urls'
import { hasTrustedOrigin } from './origin'

const preview = {
  VERCEL_ENV: 'preview',
  VERCEL_URL: 'doom-or-bloom-abc-saasify.vercel.app',
  VERCEL_BRANCH_URL: 'doom-or-bloom-git-feature-saasify.vercel.app'
}

afterEach(() => vi.unstubAllEnvs())

test('preview auth uses exact deployment and branch hosts, not production', () => {
  const config = authUrls({
    ...preview,
    BETTER_AUTH_URL: 'https://production.example'
  })
  expect(config.origins).toEqual([
    `https://${preview.VERCEL_URL}`,
    `https://${preview.VERCEL_BRANCH_URL}`
  ])
  expect(config.baseURL).toEqual({
    allowedHosts: [preview.VERCEL_URL, preview.VERCEL_BRANCH_URL],
    protocol: 'https',
    fallback: `https://${preview.VERCEL_URL}`
  })
})

test.each([
  '',
  'https://example.vercel.app',
  '*.vercel.app',
  'example.vercel.app.evil.test',
  'example.vercel.app/path'
])('preview rejects malformed host %s', (host) => {
  expect(() => authUrls({ ...preview, VERCEL_URL: host })).toThrow(
    'Preview authentication'
  )
})

test('preview branch alias is optional and duplicate hosts are deduplicated', () => {
  expect(
    authUrls({ ...preview, VERCEL_BRANCH_URL: undefined }).origins
  ).toHaveLength(1)
  expect(
    authUrls({ ...preview, VERCEL_BRANCH_URL: preview.VERCEL_URL }).origins
  ).toHaveLength(1)
})

test('production and development keep their explicit auth URL', () => {
  expect(
    authUrls({
      ...preview,
      VERCEL_ENV: 'production',
      BETTER_AUTH_URL: 'https://app.example'
    })
  ).toEqual({
    origins: ['https://app.example'],
    baseURL: 'https://app.example'
  })
  expect(() => authUrls({ VERCEL_ENV: 'production' })).toThrow(
    'BETTER_AUTH_URL'
  )
})

test('preview mutation guard accepts configured origins and rejects spoofed or absent origins', () => {
  for (const [key, value] of Object.entries(preview)) vi.stubEnv(key, value)
  for (const origin of authUrls().origins) {
    expect(hasTrustedOrigin(new Request(origin, { headers: { origin } }))).toBe(
      true
    )
  }
  for (const origin of [
    'https://unrelated.vercel.app',
    'https://production.example',
    `http://${preview.VERCEL_URL}`,
    'null'
  ]) {
    expect(
      hasTrustedOrigin(
        new Request(`https://${preview.VERCEL_URL}`, {
          headers: { origin, 'x-forwarded-host': preview.VERCEL_URL }
        })
      )
    ).toBe(false)
  }
  expect(hasTrustedOrigin(new Request(`https://${preview.VERCEL_URL}`))).toBe(
    false
  )
})
