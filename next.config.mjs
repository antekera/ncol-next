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
        source: '/',
        headers: [
          {
            key: 'Cache-Control',
            value: 's-maxage=10800, stale-while-revalidate=59'
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

export default withLogtail(
  withSentryConfig(nextConfig, {
    ...sentryWebpackPluginOptions
  })
)
