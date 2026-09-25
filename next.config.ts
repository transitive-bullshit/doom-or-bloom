import type { NextConfig } from 'next'
import {
  PHASE_DEVELOPMENT_SERVER,
  PHASE_PRODUCTION_SERVER
} from 'next/constants'
import { adminEnvironmentAllowed } from './lib/admin/access'
import { validateServerEnv } from './lib/server/validate-env'

const config: NextConfig = {
  images: {
    qualities: [75, 90],
    remotePatterns: [new URL('https://pbs.twimg.com/profile_images/**')]
  },
  allowedDevOrigins: [
    process.env.PORTLESS_TAILSCALE_URL,
    process.env.DEV_TUNNEL_URL
  ]
    .filter((value): value is string => Boolean(value))
    .map((value) => new URL(value).hostname),
  async redirects() {
    return [
      {
        source: '/assessment/:id',
        destination: '/assessments/:id',
        permanent: true
      }
    ]
  },
  async headers() {
    return [
      '/admin/:path*',
      '/assessment/:path*',
      '/assessments/:path*',
      '/public/assessments/:id/data'
    ].map((source) => ({
      source,
      headers: [{ key: 'Cache-Control', value: 'private, no-store' }]
    }))
  },
  distDir: process.env.NEXT_TEST_DIST_DIR || '.next',
  // Results are read from PostgreSQL. Native image rendering still needs portraits.
  outputFileTracingIncludes: {
    '/api/assessments/*/results-image': ['public/personas/*'],
    '/api/share-card': ['public/personas/*'],
    '/users/*/opengraph-image': ['public/personas/*'],
    '/public/assessments/*/social-image.webp': ['public/personas/*']
  },
  // Takumi loads a platform-specific native addon at runtime.
  serverExternalPackages: ['takumi-js']
}

export default function nextConfig(phase: string) {
  if (phase === PHASE_DEVELOPMENT_SERVER || phase === PHASE_PRODUCTION_SERVER)
    validateServerEnv()
  const admin =
    phase === PHASE_DEVELOPMENT_SERVER && adminEnvironmentAllowed(process.env)
  return {
    ...config,
    env: { LOCAL_ADMIN_BUILD: admin ? 'true' : 'false' },
    async rewrites() {
      return {
        beforeFiles: admin
          ? []
          : [{ source: '/admin/:path*', destination: '/internal-unavailable' }],
        afterFiles: [],
        fallback: []
      }
    }
  }
}
