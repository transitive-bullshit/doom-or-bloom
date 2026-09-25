import { defineConfig, devices } from '@playwright/test'
import { portlessUrl } from './tests/portless'

const baseURL = portlessUrl('prefetch-tests.doom-or-bloom')

// Run after build:local. An unreachable database proves these built pages do
// not silently fall back to database-backed rendering on a first request.
export default defineConfig({
  testDir: './tests/prefetch',
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
      'pnpm exec portless run --name prefetch-tests.doom-or-bloom pnpm start:local',
    url: baseURL,
    ignoreHTTPSErrors: true,
    reuseExistingServer: false,
    gracefulShutdown: { signal: 'SIGTERM', timeout: 5000 },
    env: {
      DATABASE_URL: 'postgresql://localhost:1/doom_bloom_unreachable',
      BETTER_AUTH_URL: baseURL
    }
  }
})
