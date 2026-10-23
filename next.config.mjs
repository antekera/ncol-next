// @ts-check
/**
 * @type {import('next').NextConfig}
 */
import { withSentryConfig } from '@sentry/nextjs'
import { HomeV2WebpackStatsPlugin } from './scripts/home-v2/webpack-stats-plugin.mjs'
import { resolve } from 'node:path'

// Select once per deployment so the inactive Home cannot enter the root bundle.
const homeEntry =
  process.env.HOME_V2_PUBLIC_ENABLED === 'true'
    ? './src/components/HomeV2/PublicHome.tsx'
    : './src/components/LegacyHome/index.tsx'

const nextConfig = {
  webpack(config, { isServer, webpack }) {
    config.plugins.push(
      new webpack.NormalModuleReplacementPlugin(
        /^@components\/HomeEntry$/,
        resolve(import.meta.dirname, homeEntry)
      )
    )
    if (!isServer && process.env.HOME_V2_BUNDLE_STATS === 'true') {
      config.plugins.push(new HomeV2WebpackStatsPlugin())
    }
    return config
  },
  experimental: {
    scrollRestoration: true,
    serverActions: {
      bodySizeLimit: '4mb',
      allowedOrigins: ['*'],
      maxAge: 60 // Cache for 60 seconds
    },
    // Enable Turbopack filesystem cache in development for faster rebuilds
    turbopackFileSystemCacheForDev: true
  },
  output: 'standalone',
  // Help Next correctly infer workspace root in monorepos or when multiple lockfiles exist
  turbopack: {
    root: import.meta.dirname,
    resolveAlias: { '@components/HomeEntry': homeEntry }
  },
  outputFileTracingRoot: import.meta.dirname,
  generateEtags: false,
  onDemandEntries: {
    maxInactiveAge: 60 * 60 * 1000, // 1 hour
    pagesBufferLength: 5
  },
  trailingSlash: true,
  // Canonicalize host and path together in proxy, before any slash redirect.
  skipTrailingSlashRedirect: true,
  skipProxyUrlNormalize: true,
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin'
          },
          { key: 'X-XSS-Protection', value: '1; mode=block' }
        ]
      },
      {
        source: '/:section/:month(\\d{2})/:day(\\d{2})/:slug',
        headers: [
          {
            key: 'Cache-Control',
            value:
              'public, max-age=86400, s-maxage=86400, stale-while-revalidate=604800'
          }
        ]
      },
      {
        source: '/:all*(svg|jpg|png|ico)',
        locale: false,
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, must-revalidate'
          }
        ]
      }
    ]
  },
  reactStrictMode: false,
  images: {
    formats: ['image/webp'],
    deviceSizes: [375, 640, 750, 828, 1080, 1200, 1920],
    imageSizes: [175, 300, 320, 371, 660, 728, 970, 1134],
    minimumCacheTTL: 31536000, // 1 year in seconds
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'www.noticiascol.com',
        port: '',
        pathname: '/**'
      },
      {
        protocol: 'https',
        hostname: 'noticiascol.com',
        port: '',
        pathname: '/**'
      },
      {
        protocol: 'https',
        hostname: 'cdn.noticiascol.com',
        port: '',
        pathname: '/**'
      },
      {
        protocol: 'https',
        hostname: 'secure.gravatar.com',
        port: '',
        pathname: '/**'
      },
      {
        protocol: 'https',
        hostname: 'admin.noticiascol.com',
        port: '',
        pathname: '/**'
      }
    ]
  }
}

export default withSentryConfig(nextConfig, {
  // For all available options, see:
  // https://www.npmjs.com/package/@sentry/webpack-plugin#options
  // https://docs.sentry.io/platforms/javascript/guides/nextjs/manual-setup/

  org: process.env.SENTRY_ORG || 'noticiascol',
  project: process.env.SENTRY_PROJECT || 'ncol-next',

  // Auth token for source map uploads
  authToken: process.env.SENTRY_AUTH_TOKEN,

  // Only print logs for uploading source maps in CI
  silent: !process.env.CI,

  // Upload a larger set of source maps for prettier stack traces (increases build time)
  widenClientFileUpload: true,

  // Configure source maps - delete them after upload to hide from browser devtools
  sourcemaps: {
    deleteSourcemapsAfterUpload: true
  },

  // Tunnel disabled to reduce Vercel Function invocations. Ad-blockers will
  // block direct Sentry requests (~20-30% of client errors lost) — acceptable
  // tradeoff since server errors are still captured.
  // tunnelRoute: '/monitoring',

  // Automatically tree-shake Sentry logger statements to reduce bundle size
  disableLogger: true,

  // Enables automatic instrumentation of Vercel Cron Monitors. (Does not yet work with App Router route handlers.)
  // See the following for more information:
  // https://docs.sentry.io/product/crons/
  // https://vercel.com/docs/cron-jobs
  automaticVercelMonitors: true
})
