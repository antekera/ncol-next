/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: 'https://noticiascol.com',
  generateRobotsTxt: true,
  changefreq: 'monthly',
  exclude: [
    '/contacto',
    '/terminos-y-condiciones',
    '/categoria/_pos_*',
    'categoria/sin-categoria'
  ]
}
