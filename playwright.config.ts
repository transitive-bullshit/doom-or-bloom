import { defineConfig, devices } from '@playwright/test'
import { portlessUrl } from './tests/portless'

const baseURL = portlessUrl('browser.doom-or-bloom')
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
      'pnpm exec portless run --name browser.doom-or-bloom next dev --hostname 127.0.0.1',
    url: baseURL,
    ignoreHTTPSErrors: true,
    reuseExistingServer: false,
    gracefulShutdown: { signal: 'SIGTERM', timeout: 5000 },
    env: {
      ASSESSMENT_PROVIDER: 'fixture',
      NEXT_PUBLIC_ASSESSMENT_DEBUG: 'true',
      NEXT_PUBLIC_ANALYTICS_ENABLED: 'false'
    }
  }
})
