import type { NextConfig } from 'next'

const config: NextConfig = {
  allowedDevOrigins: [
    process.env.PORTLESS_TAILSCALE_URL,
    process.env.DEV_TUNNEL_URL
  ]
    .filter((value): value is string => Boolean(value))
    .map((value) => new URL(value).hostname),
  distDir: process.env.NEXT_TEST_DIST_DIR || '.next',
  // Persona pages and About read the canonical saved journeys.
  outputFileTracingIncludes: {
    '/about': ['eval/development/live-persona-journeys.json'],
    '/users/*': ['eval/development/live-persona-journeys.json']
  },
  // Takumi loads a platform-specific native addon at runtime.
  serverExternalPackages: ['takumi-js']
}

export default config
