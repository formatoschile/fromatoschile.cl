import type { NextConfig } from 'next';
import { withSentryConfig } from '@sentry/nextjs';

// Sentry's client SDK reports through the same-origin `tunnelRoute` below and
// Vercel Analytics/Speed Insights beacon through `/_vercel/*`, so `connect-src`
// only needs 'self' plus Shopify's CDN — the PDF preview viewer (pdf.js) fetches
// `previewPdf` files straight from `cdn.shopify.com` client-side.
// 'unsafe-inline' on script/style is required because Next's App Router
// streams RSC payloads via inline <script> tags and `inlineCss` emits inline
// <style> tags; removing it needs a nonce-based CSP wired through middleware.
const CONTENT_SECURITY_POLICY = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline'",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: https://cdn.shopify.com",
  "font-src 'self' data:",
  "connect-src 'self' https://cdn.shopify.com",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
  "frame-src 'none'",
].join('; ');

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'Content-Security-Policy', value: CONTENT_SECURITY_POLICY },
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload',
          },
          {
            key: 'Permissions-Policy',
            value:
              'camera=(), microphone=(), geolocation=(), interest-cohort=()',
          },
        ],
      },
    ];
  },
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
