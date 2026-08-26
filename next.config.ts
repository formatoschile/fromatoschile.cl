import type { NextConfig } from 'next';
import { withSentryConfig } from '@sentry/nextjs';

const nextConfig: NextConfig = {
  cacheComponents: true,
  experimental: {
    inlineCss: true
  },
  typedRoutes: true,
  reactCompiler: true,
  images: {
    formats: ['image/avif', 'image/webp'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'cdn.shopify.com',
        pathname: '/s/files/**'
      }
    ]
  },
  webpack: (config) => {
    // Handle GLTF/GLB files (for webpack builds)
    config.module.rules.push({
      test: /\.(glb|gltf)$/,
      type: 'asset/resource',
    });
    return config;
  },
  // Turbopack config - GLB files from /public are served as static assets automatically
  turbopack: {},
};

export default withSentryConfig(nextConfig, {
  org: process.env.SENTRY_ORG,
  project: process.env.SENTRY_PROJECT,

  // Source map upload auth token — set SENTRY_AUTH_TOKEN in CI to enable
  authToken: process.env.SENTRY_AUTH_TOKEN,

  widenClientFileUpload: true,

  tunnelRoute: '/monitoring',

  silent: !process.env.CI,
});
