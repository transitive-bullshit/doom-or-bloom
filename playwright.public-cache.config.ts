import { defineConfig } from '@playwright/test'
import { portlessUrl } from './tests/portless'

const baseURL = portlessUrl('public-cache-tests.doom-or-bloom')
const database = process.env.TEST_DATABASE_URL
if (!database || !new URL(database).pathname.endsWith('_test'))
  throw new Error('Set TEST_DATABASE_URL to a dedicated test database')

// Build first with build:local. Runtime writes use only synthetic test records;
// no assessment-generation POST or paid inference is used in this suite.
export default defineConfig({
  testDir: './tests/public-cache',
  workers: 1,
  use: { baseURL, ignoreHTTPSErrors: true, trace: 'retain-on-failure' },
  webServer: {
    command:
      'pnpm exec portless run --name public-cache-tests.doom-or-bloom pnpm start:local',
    url: baseURL,
    ignoreHTTPSErrors: true,
    reuseExistingServer: false,
    gracefulShutdown: { signal: 'SIGTERM', timeout: 5000 },
    env: { DATABASE_URL: database, BETTER_AUTH_URL: baseURL }
  }
})
