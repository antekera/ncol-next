import { canonicalPath, siteUrl } from '../siteUrl'

describe('siteUrl', () => {
  it.each([
    ['/', 'https://www.noticiascol.com/'],
    ['/categoria/zulia', 'https://www.noticiascol.com/categoria/zulia/'],
    [
      // eslint-disable-next-line sonarjs/no-clear-text-protocols -- verify legacy HTTP redirects
      'http://noticiascol.com/2016/01/02/nota?q=a%20b#nota',
      'https://www.noticiascol.com/2016/01/02/nota/?q=a%20b#nota'
    ],
    [
      'https://admin.noticiascol.com/2026/10/10/nota/',
      'https://www.noticiascol.com/2026/10/10/nota/'
    ]
  ])('normalizes %s', (input, expected) => {
    expect(siteUrl(input)).toBe(expected)
  })
  it.each([
    '/api/track',
    '/_next/image',
    '/robots.txt',
    '/ads.txt',
    '/sitemap.xml',
    '/sitemap-0.xml',
    '/feed',
    '/feed.xml',
    '/articles-sitemap/1',
    '/media/logo.svg'
  ])('keeps %s without a slash', path => {
    expect(canonicalPath(path)).toBe(path)
    expect(canonicalPath(`${path}/`)).toBe(path)
  })
})
