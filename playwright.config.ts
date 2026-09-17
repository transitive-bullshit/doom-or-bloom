import { defineConfig, devices } from '@playwright/test'
export default defineConfig({
  testDir: './tests/browser',
  fullyParallel: false,
  workers: 1,
  use: {
    baseURL: 'http://localhost:3011',
    trace: 'retain-on-failure',
    ...devices['Desktop Chrome']
  },
  webServer: {
    command: 'pnpm exec next dev -p 3011',
    url: 'http://localhost:3011',
    reuseExistingServer: false,
    env: {
      ASSESSMENT_PROVIDER: 'fixture',
      NEXT_PUBLIC_ASSESSMENT_DEBUG: 'true',
      NEXT_PUBLIC_ANALYTICS_ENABLED: 'false'
    }
  }
})
