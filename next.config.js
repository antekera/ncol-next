/** @type {import('next').NextConfig} */

const { withSentryConfig } = require('@sentry/nextjs')

const moduleExports = {
  experimental: {
    scrollRestoration: true
  },
  env: {
    REVALIDATE_KEY: process.env.REVALIDATE_KEY,
  },
  reactStrictMode: false,
  images: {
    unoptimized: true,
    domains: ['i0.wp.com', 'i1.wp.com', 'i2.wp.com', 'secure.gravatar.com'],
    formats: ['image/avif', 'image/webp']
  }
}

const sentryWebpackPluginOptions = {
  silent: true,
  authToken: process.env.NEXT_PUBLIC_SENTRY_AUTH_TOKEN,
  hideSourceMaps: true,
}

module.exports = withSentryConfig(moduleExports, sentryWebpackPluginOptions)
