/** @type {import('next').NextConfig} */

const { withSentryConfig } = require('@sentry/nextjs')

const moduleExports = {
  experimental: {
    images: {
      unoptimized: true
    }
  },
  reactStrictMode: true,
  images: {
    domains: ['i0.wp.com', 'i1.wp.com', 'i2.wp.com', 'secure.gravatar.com'],
    formats: ['image/avif', 'image/webp']
  }
}

const sentryWebpackPluginOptions = {
  silent: true,
  authToken: process.env.NEXT_PUBLIC_SENTRY_AUTH_TOKEN
}

module.exports = withSentryConfig(moduleExports, sentryWebpackPluginOptions)
