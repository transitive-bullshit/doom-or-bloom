import { defineConfig, devices } from '@playwright/test'
import { portlessUrl } from './tests/portless'

const baseURL = portlessUrl('analytics.doom-or-bloom')
const database = process.env.TEST_DATABASE_URL
if (!database || !new URL(database).pathname.endsWith('_test'))
  throw new Error('Set TEST_DATABASE_URL to a dedicated native test database')
export default defineConfig({
  testDir: './tests/analytics',
  workers: 1,
  use: {
    baseURL,
    trace: 'retain-on-failure',
    ignoreHTTPSErrors: true,
    ...devices['Desktop Chrome']
  },
  webServer: {
    command:
      'pnpm db:seed --test && pnpm exec portless run --name analytics.doom-or-bloom next dev --hostname 127.0.0.1',
    url: baseURL,
    ignoreHTTPSErrors: true,
    reuseExistingServer: false,
    gracefulShutdown: { signal: 'SIGTERM', timeout: 5000 },
    env: {
      DATABASE_URL: database,
      BETTER_AUTH_URL: baseURL,
      NEXT_TEST_DIST_DIR: '.next-analytics',
      ASSESSMENT_PROVIDER: 'live',
      TYPESAFE_API_KEY: '',
      NEXT_PUBLIC_ANALYTICS_ENABLED: 'true',
      NEXT_PUBLIC_POSTHOG_KEY: 'phc_synthetic_test_key',
      NEXT_PUBLIC_POSTHOG_HOST: 'https://posthog.invalid',
      POSTHOG_IP_DISPOSAL_CONFIRMED: 'true',
      NEXT_PUBLIC_ASSESSMENT_DEBUG: 'false'
    }
  }
})
