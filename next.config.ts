import type { NextConfig } from 'next'

const config: NextConfig = {
  // Takumi loads a platform-specific native addon at runtime.
  serverExternalPackages: ['takumi-js']
}

export default config
