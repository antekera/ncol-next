/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: 'https://www.noticiascol.com',
  generateRobotsTxt: true,
  exclude: [
    '/contacto',
    '/terminos-y-condiciones',
    '/categoria/_pos_*',
    'categoria/sin-categoria'
  ],
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
