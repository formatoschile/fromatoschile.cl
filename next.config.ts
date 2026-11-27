import type { NextConfig } from 'next';
import { withSentryConfig } from '@sentry/nextjs/config';

// Content-Security-Policy, one directive per key and one commented line per
// vendor, so adding or removing a vendor is a visible, reviewable diff.
//
// Base: Sentry's client SDK reports through the same-origin `tunnelRoute`
// below and Vercel Analytics/Speed Insights beacon through `/_vercel/*`;
// `cdn.shopify.com` serves product images and the `previewPdf` files pdf.js
// fetches client-side. 'unsafe-inline' on script/style is required because
// Next's App Router streams RSC payloads via inline <script> tags, the
// consent default and GTM loader are inline in the root layout, and
// `inlineCss` emits inline <style> tags; removing it needs a nonce-based CSP
// wired through middleware. 'wasm-unsafe-eval' lets pdf.js compile its
// WebAssembly image decoders (served from `/pdfjs/wasm/`), needed for
// scanned PDFs.
//
// Tracking vendors (docs/plans/tracking-plan.md, phase 2, "CSP"): hosts from
// Google's CSP guide for Tag Manager + GA4, including the Google signals
// hosts (signals is on). A refused script looks, from GTM, exactly like a
// fired one — check the browser console for violations after any change.
// Never widen to `*` or `https:`. Meta and Google Ads join when they are
// used.
const CSP_DIRECTIVES: Record<string, string[]> = {
  'default-src': ["'self'"],
  'script-src': [
    "'self'",
    "'unsafe-inline'",
    "'wasm-unsafe-eval'",
    'https://www.googletagmanager.com', // GTM container + Google tag (gtag.js)
  ],
  'style-src': ["'self'", "'unsafe-inline'"],
  'img-src': [
    "'self'",
    'data:',
    'https://cdn.shopify.com', // product images
    'https://*.google-analytics.com', // GA4 hits sent as images
    'https://www.googletagmanager.com', // GTM / Google tag pixels
    'https://*.g.doubleclick.net', // Google signals
    'https://www.google.com', // Google signals
    'https://www.google.cl', // Google signals (country domain)
  ],
  'font-src': ["'self'", 'data:'],
  'connect-src': [
    "'self'",
    'https://cdn.shopify.com', // pdf.js preview fetches
    'https://*.google-analytics.com', // GA4 collect
    'https://*.analytics.google.com', // GA4 collect (regional endpoints)
    'https://www.googletagmanager.com', // Google tag
    'https://*.g.doubleclick.net', // Google signals
    'https://www.google.com', // Google signals
    'https://www.google.cl', // Google signals (country domain)
  ],
  'object-src': ["'none'"],
  'base-uri': ["'self'"],
  'form-action': ["'self'"],
  'frame-ancestors': ["'none'"],
  'frame-src': [
    'https://www.googletagmanager.com', // Tag Assistant preview / debug mode
  ],
};

const CONTENT_SECURITY_POLICY = Object.entries(CSP_DIRECTIVES)
  .map(([directive, sources]) => `${directive} ${sources.join(' ')}`)
  .join('; ');

// Files the PDF thumbnail routes load at runtime that Next's file tracing
// can't see: pdf.js requires `@napi-rs/canvas` by name (plus its per-platform
// native binary, e.g. `@napi-rs/canvas-linux-x64-gnu` on Vercel) and loads
// its worker, fonts and wasm image decoders by path.
const PDF_RENDERING_FILES = [
  './node_modules/@napi-rs/canvas/**',
  './node_modules/@napi-rs/canvas-*/**',
  './node_modules/pdfjs-dist/legacy/build/pdf.worker.mjs',
  './node_modules/pdfjs-dist/standard_fonts/**',
  './node_modules/pdfjs-dist/wasm/**',
];

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
  // Server-side PDF thumbnail rendering (src/lib/pdf): load these from
  // node_modules at runtime instead of bundling them — `@napi-rs/canvas` ships
  // a native binary, and pdf.js loads its worker and fonts by path.
  serverExternalPackages: ['pdfjs-dist', '@napi-rs/canvas'],
  outputFileTracingIncludes: {
    '/api/revalidate': PDF_RENDERING_FILES,
    '/api/cron/preview-thumbnails': PDF_RENDERING_FILES,
  },
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
