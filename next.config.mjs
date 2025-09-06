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
    }
  },
  output: 'standalone',
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
      },
      {
        source: '/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=3600, must-revalidate'
          }
        ]
      }
    ]
  },
  reactStrictMode: false,
  images: {
    domains: ['cdn.noticiascol.com'],
    unoptimized: true,
    formats: ['image/avif', 'image/webp'],
    minimumCacheTTL: 31536000, // 1 year in seconds
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'cdn.noticiascol.com',
        port: '',
        pathname: '/**'
      }
    ]
  }
}

const sentryWebpackPluginOptions = {
  authToken: process.env.NEXT_PUBLIC_SENTRY_AUTH_TOKEN,
  automaticVercelMonitors: true,
  disableLogger: true,
  hideSourceMaps: true,
  org: 'noticiascol',
  project: 'ncol-next',
  silent: !process.env.CI,
  widenClientFileUpload: true
}

export default withSentryConfig(
  withSentryConfig(nextConfig, {
    ...sentryWebpackPluginOptions
  }),
  {
    // For all available options, see:
    // https://www.npmjs.com/package/@sentry/webpack-plugin#options

    org: process.env.SENTRY_ORG,
    project: process.env.SENTRY_PROJECT,

    // Only print logs for uploading source maps in CI
    silent: !process.env.CI,

    // For all available options, see:
    // https://docs.sentry.io/platforms/javascript/guides/nextjs/manual-setup/

    // Upload a larger set of source maps for prettier stack traces (increases build time)
    widenClientFileUpload: true,

    // Route browser requests to Sentry through a Next.js rewrite to circumvent ad-blockers.
    // This can increase your server load as well as your hosting bill.
    // Note: Check that the configured route will not match with your Next.js middleware, otherwise reporting of client-
    // side errors will fail.
    tunnelRoute: '/monitoring',

    // Automatically tree-shake Sentry logger statements to reduce bundle size
    disableLogger: true,

    // Enables automatic instrumentation of Vercel Cron Monitors. (Does not yet work with App Router route handlers.)
    // See the following for more information:
    // https://docs.sentry.io/product/crons/
    // https://vercel.com/docs/cron-jobs
    automaticVercelMonitors: true
  }
)
