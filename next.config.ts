import type { NextConfig } from 'next'

const config: NextConfig = {
  distDir: process.env.NEXT_TEST_DIST_DIR || '.next',
  // Takumi loads a platform-specific native addon at runtime.
  serverExternalPackages: ['takumi-js']
}

export default config
