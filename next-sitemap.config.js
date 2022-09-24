/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: 'https://noticiascol.com',
  generateRobotsTxt: true,
  changefreq: 'monthly',
  exclude: [
    '/contacto',
    '/publicidad',
    '/terminos-y-condiciones',
    '/categoria/_pos_*',
    'categoria/sin-categoria'
  ]
}
