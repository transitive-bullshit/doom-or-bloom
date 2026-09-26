import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('.', import.meta.url)),
      'server-only': fileURLToPath(
        new URL('./lib/server/empty.ts', import.meta.url)
      )
    }
  },
  test: {
    environment: 'node',
    // Vitest's automatic agent reporter hides console output from passing tests.
    reporters: [
      'default',
      ...(process.env.GITHUB_ACTIONS === 'true'
        ? ['github-actions' as const]
        : [])
    ],
    include: ['lib/**/*.test.ts', 'tests/helpers/**/*.test.ts'],
    restoreMocks: true
  }
})
