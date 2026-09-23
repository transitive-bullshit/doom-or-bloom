import type { NextConfig } from 'next'

const config: NextConfig = {
  allowedDevOrigins: [
    process.env.PORTLESS_TAILSCALE_URL,
    process.env.DEV_TUNNEL_URL
  ]
    .filter((value): value is string => Boolean(value))
    .map((value) => new URL(value).hostname),
  async headers() {
    return ['/assessment/:path*', '/assessments/:path*'].map((source) => ({
      source,
      headers: [{ key: 'Cache-Control', value: 'private, no-store' }]
    }))
  },
  distDir: process.env.NEXT_TEST_DIST_DIR || '.next',
  // Results are read from PostgreSQL. Native image rendering still needs portraits.
  outputFileTracingIncludes: {
    '/api/share-card': ['public/personas/*'],
    '/users/*/opengraph-image': ['public/personas/*'],
    '/assessments/public/*/social-image.webp': ['public/personas/*']
  },
  // Takumi loads a platform-specific native addon at runtime.
  serverExternalPackages: ['takumi-js']
}

export default config
