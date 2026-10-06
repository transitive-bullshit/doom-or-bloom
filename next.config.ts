import type { NextConfig } from 'next'
import {
  PHASE_DEVELOPMENT_SERVER,
  PHASE_PRODUCTION_SERVER
} from 'next/constants'
import createMDX from '@next/mdx'
import createNextIntlPlugin from 'next-intl/plugin'
import {
  localeRedirects,
  localeRewrites,
  privateRoutePrefixes
} from './i18n/next-routes'
import { adminEnvironmentAllowed } from './lib/admin/access'
import { movedPostRedirects } from './lib/blog/moved-posts'
import { validateServerEnv } from './lib/server/validate-env'

const withNextIntl = createNextIntlPlugin('./i18n/request.ts')
// Blog posts are MDX imported from content/blog (docs/BLOG.md). Plugins are
// named by string so Turbopack (development) and webpack (builds) both load
// them; remark-frontmatter keeps the YAML header out of the rendered post.
const withMDX = createMDX({
  options: {
    remarkPlugins: [['remark-frontmatter', ['yaml']], 'remark-gfm']
  }
})
const cardAssets = ['public/personas/*', 'lib/sharing/fonts/*.woff2']
// Pages that show authored text read their release, rubric and translations
// by version at runtime (lib/content/l10n-loader.ts), which tracing misses.
const authoredContent = [
  'content/l10n/*/{releases,rubrics}/*.json',
  'content/releases/*/{prompts,findings,resources}.json',
  'content/rubrics/*/rubric.json'
]

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
      // Renamed blog posts, in every locale.
      ...movedPostRedirects(),
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
    '/*/public/assessments/*/social-image.png': cardAssets,
    '/*/s/*/social-image.png': cardAssets,
    '/*/assessments/*': authoredContent,
    '/*/public/assessments/*': authoredContent,
    '/*/users/*': authoredContent,
    // Regenerated at runtime: they list blog posts from their frontmatter,
    // and the sitemap lists translated posts in every locale.
    '/sitemap.xml': ['content/blog/*.mdx', 'content/l10n/*/blog/*.mdx'],
    '/llms.txt': ['content/blog/*.mdx']
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
  return withNextIntl(
    withMDX({
      ...config,
      env: { LOCAL_ADMIN_BUILD: admin ? 'true' : 'false' },
      async rewrites() {
        const locale = localeRewrites()
        return {
          beforeFiles: [
            ...(admin
              ? []
              : [
                  {
                    source: '/admin/:path*',
                    destination: '/internal-unavailable'
                  }
                ]),
            ...locale.beforeFiles
          ],
          afterFiles: locale.afterFiles,
          fallback: []
        }
      }
    })
  )
}
