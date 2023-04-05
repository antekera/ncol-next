/** @type {import('next').NextConfig} */

const { withSentryConfig } = require('@sentry/nextjs')

const moduleExports = {
  experimental: {
    scrollRestoration: true
  },
  reactStrictMode: false,
  images: {
    unoptimized: true,
    domains: ['i0.wp.com', 'i1.wp.com', 'i2.wp.com', 'secure.gravatar.com'],
    formats: ['image/avif', 'image/webp']
  },
  async redirects() {
    return [
      {
        source: '/wp-admin',
        destination: 'https://admin.noticiascol.com/wp-admin',
        permanent: true
      },
      {
        source: '/wp-login.php',
        destination: 'https://admin.noticiascol.com/wp-admin',
        permanent: true
      },
      {
        source: '/actualidad',
        destination: 'https://noticiascol.com/categoria/actualidad',
        permanent: true
      },
      {
        source: '/baralt',
        destination: 'https://noticiascol.com/categoria/baralt',
        permanent: true
      },
      {
        source: '/cabimas',
        destination: 'https://noticiascol.com/categoria/cabimas',
        permanent: true
      },
      {
        source: '/cine',
        destination: 'https://noticiascol.com/categoria/cine',
        permanent: true
      },
      {
        source: '/costa-oriental',
        destination: 'https://noticiascol.com/categoria/costa-oriental',
        permanent: true
      },
      {
        source: '/cultura',
        destination: 'https://noticiascol.com/categoria/cultura',
        permanent: true
      },
      {
        source: '/curiosidades',
        destination: 'https://noticiascol.com/categoria/curiosidades',
        permanent: true
      },
      {
        source: '/deportes',
        destination: 'https://noticiascol.com/categoria/deportes',
        permanent: true
      },
      {
        source: '/economia',
        destination: 'https://noticiascol.com/categoria/economia',
        permanent: true
      },
      {
        source: '/educacion',
        destination: 'https://noticiascol.com/categoria/educacion',
        permanent: true
      },
      {
        source: '/entretenimiento',
        destination: 'https://noticiascol.com/categoria/entretenimiento',
        permanent: true
      },
      {
        source: '/especiales',
        destination: 'https://noticiascol.com/categoria/especiales',
        permanent: true
      },
      {
        source: '/estilo-de-vida',
        destination: 'https://noticiascol.com/categoria/estilo-de-vida',
        permanent: true
      },
      {
        source: '/farandula',
        destination: 'https://noticiascol.com/categoria/farandula',
        permanent: true
      },
      {
        source: '/gastronomia',
        destination: 'https://noticiascol.com/categoria/gastronomia',
        permanent: true
      },
      {
        source: '/internacionales',
        destination: 'https://noticiascol.com/categoria/internacionales',
        permanent: true
      },
      {
        source: '/internet',
        destination: 'https://noticiascol.com/categoria/internet',
        permanent: true
      },
      {
        source: '/lagunillas',
        destination: 'https://noticiascol.com/categoria/lagunillas',
        permanent: true
      },
      {
        source: '/maracaibo',
        destination: 'https://noticiascol.com/categoria/maracaibo',
        permanent: true
      },
      {
        source: '/miranda',
        destination: 'https://noticiascol.com/categoria/miranda',
        permanent: true
      },
      {
        source: '/mundo',
        destination: 'https://noticiascol.com/categoria/mundo',
        permanent: true
      },
      {
        source: '/musica',
        destination: 'https://noticiascol.com/categoria/musica',
        permanent: true
      },
      {
        source: '/nacionales',
        destination: 'https://noticiascol.com/categoria/nacionales',
        permanent: true
      },
      {
        source: '/opinion',
        destination: 'https://noticiascol.com/categoria/opinion',
        permanent: true
      },
      {
        source: '/politica',
        destination: 'https://noticiascol.com/categoria/politica',
        permanent: true
      },
      {
        source: '/salud',
        destination: 'https://noticiascol.com/categoria/salud',
        permanent: true
      },
      {
        source: '/san-francisco',
        destination: 'https://noticiascol.com/categoria/san-francisco',
        permanent: true
      },
      {
        source: '/santa-rita',
        destination: 'https://noticiascol.com/categoria/santa-rita',
        permanent: true
      },
      {
        source: '/simon-bolivar',
        destination: 'https://noticiascol.com/categoria/simon-bolivar',
        permanent: true
      },
      {
        source: '/sucesos',
        destination: 'https://noticiascol.com/categoria/sucesos',
        permanent: true
      },
      {
        source: '/tecnologia',
        destination: 'https://noticiascol.com/categoria/tecnologia',
        permanent: true
      },
      {
        source: '/television',
        destination: 'https://noticiascol.com/categoria/television',
        permanent: true
      },
      {
        source: '/valmore-rodriguez',
        destination: 'https://noticiascol.com/categoria/valmore-rodriguez',
        permanent: true
      },
      {
        source: '/costa-oriental/cabimas',
        destination: 'https://noticiascol.com/categoria/cabimas',
        permanent: true
      },
      {
        source: '/contactos',
        destination: 'https://noticiascol.com/contacto',
        permanent: true
      },
      {
        source: '/wp-content',
        destination: 'https://noticiascol.com/',
        permanent: true
      },
      {
        source: '/wp-admin',
        destination: 'https://noticiascol.com/',
        permanent: true
      },
      {
        source: '/wp-includes',
        destination: 'https://noticiascol.com/',
        permanent: true
      }
    ]
  }
}

const sentryWebpackPluginOptions = {
  silent: true,
  authToken: process.env.NEXT_PUBLIC_SENTRY_AUTH_TOKEN
}

module.exports = withSentryConfig(moduleExports, sentryWebpackPluginOptions)
