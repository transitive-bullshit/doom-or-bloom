import type { NextConfig } from 'next'
import {
  PHASE_DEVELOPMENT_SERVER,
  PHASE_PRODUCTION_SERVER
} from 'next/constants'
import createNextIntlPlugin from 'next-intl/plugin'
import {
  localeRedirects,
  localeRewrites,
  privateRoutePrefixes
} from './i18n/next-routes'
import { adminEnvironmentAllowed } from './lib/admin/access'
import { validateServerEnv } from './lib/server/validate-env'

const withNextIntl = createNextIntlPlugin('./i18n/request.ts')
const cardAssets = ['public/personas/*', 'lib/sharing/fonts/*.woff2']

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
      },
      {
        // Earlier shares advertised WebP previews, which X's composer does not render.
        source: '/public/assessments/:id/social-image.webp',
        destination: '/public/assessments/:id/social-image.png',
        permanent: true
      },
      // After legacy URLs, so a remembered language applies to their new form.
      ...localeRedirects()
    ]
  },
  async headers() {
    return [
      '/admin/:path*',
      ...privateRoutePrefixes.map((prefix) => `${prefix}/:path*`),
      '/public/assessments/:id/data'
    ].map((source) => ({
      source,
      headers: [{ key: 'Cache-Control', value: 'private, no-store' }]
    }))
  },
  distDir: process.env.NEXT_TEST_DIST_DIR || '.next',
  // Results are read from PostgreSQL. Native image rendering still needs
  // portraits, and the Noto subsets for non-Latin scripts (Takumi never reads
  // system fonts).
  outputFileTracingIncludes: {
    '/api/assessments/*/results-image': cardAssets,
    '/api/share-card': cardAssets,
    '/api/map-png': ['lib/sharing/fonts/*.woff2'],
    '/users/*/opengraph-image': cardAssets,
    '/public/assessments/*/social-image.png': cardAssets,
    '/*/public/assessments/*/social-image.png': cardAssets
  },
  experimental: {
    // Unknown URLs match no route in app/[locale]; see app/global-not-found.tsx.
    globalNotFound: true
  },
  // Takumi loads a platform-specific native addon at runtime.
  serverExternalPackages: ['takumi-js']
}

export default function nextConfig(phase: string) {
  if (phase === PHASE_DEVELOPMENT_SERVER || phase === PHASE_PRODUCTION_SERVER)
    validateServerEnv()
  const admin =
    phase === PHASE_DEVELOPMENT_SERVER && adminEnvironmentAllowed(process.env)
  return withNextIntl({
    ...config,
    env: { LOCAL_ADMIN_BUILD: admin ? 'true' : 'false' },
    async rewrites() {
      return {
        beforeFiles: admin
          ? []
          : [{ source: '/admin/:path*', destination: '/internal-unavailable' }],
        afterFiles: localeRewrites(),
        fallback: []
      }
    }
  })
}
