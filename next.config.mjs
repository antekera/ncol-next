// @ts-check
/**
 * @type {import('next').NextConfig}
 */
import { withSentryConfig } from '@sentry/nextjs'

const nextConfig = {
  experimental: {
    scrollRestoration: true,
    serverActions: {
      allowedOrigins: ['*'],
      maxAge: 60 // Cache for 60 seconds
    },
    // Enable Turbopack filesystem cache in development for faster rebuilds
    turbopackFileSystemCacheForDev: true
  },
  output: 'standalone',
  // Help Next correctly infer workspace root in monorepos or when multiple lockfiles exist
  turbopack: {
    root: import.meta.dirname
  },
  outputFileTracingRoot: import.meta.dirname,
  generateEtags: false,
  onDemandEntries: {
    maxInactiveAge: 60 * 60 * 1000, // 1 hour
    pagesBufferLength: 5
  },
  trailingSlash: true,
  async headers() {
    return [
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
  async redirects() {
    return [
      {
        source: '/categoria/nacionales/dolar-hoy/',
        destination: '/dolar-hoy/',
        permanent: true
      },
      {
        source: '/author/:slug/',
        destination: '/autor/:slug/',
        permanent: true
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
