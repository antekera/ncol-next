/**
 * @type {import('next').NextConfig}
 */
import { withSentryConfig } from '@sentry/nextjs'
import { withLogtail } from '@logtail/next'

const nextConfig = {
  experimental: {
    scrollRestoration: true
  },
  env: {
    REVALIDATE_KEY: process.env.REVALIDATE_KEY
  },
  async headers() {
    return [
      {
        source: '/:all*(svg|jpg|png)',
        locale: false,
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=9999999999, must-revalidate'
          }
        ]
      },
      {
        source: '/2022/:slug*',
        headers: [
          {
            key: 'Cache-Control',
            value: 's-maxage=604800, stale-while-revalidate=86400'
          }
        ]
      },
      {
        source: '/2023/:slug*',
        headers: [
          {
            key: 'Cache-Control',
            value: 's-maxage=604800, stale-while-revalidate=86400'
          }
        ]
      },
      {
        source: '/2024/:slug*',
        headers: [
          {
            key: 'Cache-Control',
            value: 's-maxage=604800, stale-while-revalidate=86400'
          }
        ]
      }
    ]
  },
  reactStrictMode: false,
  images: {
    unoptimized: true,
    formats: ['image/avif', 'image/webp'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'admin.noticiascol.com',
        port: '',
        pathname: '/wp-content/**'
      },
      {
        protocol: 'https',
        hostname: 'i0.wp.com',
        port: '',
        pathname: '/**'
      },
      {
        protocol: 'https',
        hostname: 'i1.wp.com',
        port: '',
        pathname: '/**'
      },
      {
        protocol: 'https',
        hostname: 'i2.wp.com',
        port: '',
        pathname: '/**'
      },
      {
        protocol: 'https',
        hostname: 'secure.gravatar.com',
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
  withLogtail(
    withSentryConfig(nextConfig, {
      ...sentryWebpackPluginOptions
    })
  ),
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
