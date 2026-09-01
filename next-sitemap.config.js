/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: 'https://www.noticiascol.com',
  generateRobotsTxt: true,
  exclude: [
    '/contacto',
    '/terminos-y-condiciones',
    '/auth/auth-code-error',
    '/categoria/_pos_*',
    'categoria/sin-categoria'
  ],
  robotsTxtOptions: {
    additionalSitemaps: [
      'https://www.noticiascol.com/articles-sitemap',
      'https://www.noticiascol.com/news-sitemap.xml'
    ],
    // Política de rastreo versionada aquí, NO en public/robots.txt: ese archivo
    // lo regenera next-sitemap en cada postbuild y cualquier edición manual se
    // pierde en el siguiente despliegue.
    policies: [
      { userAgent: '*', allow: '/' },

      // Buscadores con respuesta generativa: citan con enlace y devuelven tráfico.
      { userAgent: 'OAI-SearchBot', allow: '/' },
      { userAgent: 'ChatGPT-User', allow: '/' },
      { userAgent: 'PerplexityBot', allow: '/' },
      { userAgent: 'Claude-SearchBot', allow: '/' },
      { userAgent: 'Claude-User', allow: '/' },

      // Rastreo para entrenamiento de modelos. Decisión editorial: hoy se
      // permite, igual que antes de existir esta lista. Para revocarlo basta
      // cambiar `allow` por `disallow` en los agentes de este bloque.
      { userAgent: 'GPTBot', allow: '/' },
      { userAgent: 'ClaudeBot', allow: '/' },
      { userAgent: 'Google-Extended', allow: '/' },
      { userAgent: 'Applebot-Extended', allow: '/' },
      { userAgent: 'meta-externalagent', allow: '/' },
      { userAgent: 'CCBot', allow: '/' },

      // Rastreo agresivo sin retorno de tráfico.
      { userAgent: 'Bytespider', disallow: '/' },
      { userAgent: 'ImagesiftBot', disallow: '/' }
    ]
  },
  transform: async (config, path) => {
    // Article pages /:section/:month/:day/:slug/ — change rarely
    const isArticle = /^\/[^/]+\/\d{2}\/\d{2}\/[^/]+/.test(path)
    // Category and tag listing pages — change frequently
    const isListing =
      path.startsWith('/categoria/') || path.startsWith('/etiqueta/')

    let changefreq = 'hourly'
    let priority = 1.0
    if (isArticle) {
      changefreq = 'weekly'
      priority = 0.7
    } else if (isListing) {
      changefreq = 'daily'
      priority = 0.85
    }

    return {
      loc: path,
      changefreq,
      priority,
      lastmod: new Date().toISOString()
    }
  }
}
