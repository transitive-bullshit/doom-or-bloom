import { defineConfig, devices } from '@playwright/test'
import { portlessUrl } from './tests/portless'
const baseURL = portlessUrl('persistence-tests.doom-or-bloom')
const database = process.env.TEST_DATABASE_URL
if (!database || !new URL(database).pathname.endsWith('_test'))
  throw new Error('Set TEST_DATABASE_URL to a dedicated _test database')
export default defineConfig({
  testDir: './tests/persistence',
  workers: 1,
  use: { baseURL, ...devices['Desktop Chrome'], trace: 'retain-on-failure' },
  webServer: {
    command:
      'pnpm db:seed --test && pnpm exec portless run --name persistence-tests.doom-or-bloom next dev --hostname 127.0.0.1',
    url: baseURL,
    reuseExistingServer: false,
    gracefulShutdown: { signal: 'SIGTERM', timeout: 5000 },
    env: {
      NEXT_TEST_DIST_DIR: '.next-persistence',
      DATABASE_URL: database,
      BETTER_AUTH_URL: baseURL,
      ASSESSMENT_PROVIDER: 'fixture',
      X_CLIENT_ID: 'browser-fixture-client',
      X_CLIENT_SECRET: 'browser-fixture-secret',
      NEXT_PUBLIC_ANALYTICS_ENABLED: 'false'
    }
  }
})
