import { defineConfig, devices } from '@playwright/test'
export default defineConfig({
  testDir: './tests/analytics',
  workers: 1,
  use: { baseURL: 'http://localhost:3041', ...devices['Desktop Chrome'] },
  webServer: {
    command: 'pnpm exec next dev -p 3041',
    url: 'http://localhost:3041',
    reuseExistingServer: false,
    env: {
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
