/** @type {import('next').NextConfig} */
module.exports = {
  experimental: {
    images: {
      unoptimized: true,
    },
  },
  reactStrictMode: true,
  images: {
    domains: ['i0.wp.com', 'i1.wp.com', 'i2.wp.com', 'secure.gravatar.com'],
    formats: ['image/avif', 'image/webp'],
  },
}
