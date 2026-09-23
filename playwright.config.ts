import { defineConfig, devices } from '@playwright/test'
import { portlessUrl } from './tests/portless'

const baseURL = portlessUrl('browser-tests.doom-or-bloom')
const database = process.env.TEST_DATABASE_URL
if (!database || !new URL(database).pathname.endsWith('_test'))
  throw new Error('Set TEST_DATABASE_URL to a dedicated native test database')
export default defineConfig({
  testDir: './tests/browser',
  fullyParallel: false,
  workers: 1,
  use: {
    baseURL,
    ignoreHTTPSErrors: true,
    trace: 'retain-on-failure',
    ...devices['Desktop Chrome']
  },
  webServer: {
    command:
      'pnpm db:seed --test && pnpm exec portless run --name browser-tests.doom-or-bloom next dev --hostname 127.0.0.1',
    url: baseURL,
    ignoreHTTPSErrors: true,
    reuseExistingServer: false,
    gracefulShutdown: { signal: 'SIGTERM', timeout: 5000 },
    env: {
      NEXT_TEST_DIST_DIR: '.next-browser',
      DATABASE_URL: database,
      BETTER_AUTH_URL: baseURL,
      ASSESSMENT_PROVIDER: 'fixture',
      NEXT_PUBLIC_ASSESSMENT_DEBUG: 'true',
      NEXT_PUBLIC_ANALYTICS_ENABLED: 'false'
    }
  }
})
