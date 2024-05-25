// @ts-check

/**
 * @type {import('next').NextConfig}
 */
import { withSentryConfig } from '@sentry/nextjs'
import MillionLint from '@million/lint'

const nextConfig = {
  experimental: {
    scrollRestoration: true
  },
  env: {
    REVALIDATE_KEY: process.env.REVALIDATE_KEY
  },
  reactStrictMode: false,
  images: {
    unoptimized: true,
    domains: ['i0.wp.com', 'i1.wp.com', 'i2.wp.com', 'secure.gravatar.com'],
    formats: ['image/avif', 'image/webp']
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
  MillionLint.next()(nextConfig),
  sentryWebpackPluginOptions
)
