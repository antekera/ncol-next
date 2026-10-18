import {
  filterHomePublicationDay,
  homePublicationDay,
  isOpeningEligible,
  isPublishedOnDay,
  rankingPublicationDay
} from '../editorialPolicy'
import type { HomeArticle } from '../types'
const day = '2026-10-18'
const post = (
  title = 'Noticia',
  date = '2026-10-18T08:00:00'
): HomeArticle => ({
  id: title,
  title,
  date,
  uri: '/nota/',
  categories: { edges: [{ node: { slug: 'zulia', name: 'Zulia' } }] }
})
const allowed = new Set(['zulia', 'cabimas', 'nacionales', 'sucesos'])
it.each([
  'Inameh informa',
  'I-N-A-M-E-H: clima',
  'I–N–A–M–E–H',
  'Precio del DÓLAR',
  'Dolar hoy',
  'Precio del d&oacute;lar',
  'Precio del d&#243;lar'
])('excludes %s from the opening even with an explicit flag', title => {
  expect(
    isOpeningEligible(
      { ...post(title), customFields: { noticiadestacada: true } },
      allowed
    )
  ).toBe(false)
})
it('allows configured categories and descendants, with a strict boolean override for other sections', () => {
  expect(isOpeningEligible(post(), allowed)).toBe(true)
  const other = {
    ...post(),
    categories: { edges: [{ node: { slug: 'deportes', name: 'Deportes' } }] }
  }
  expect(isOpeningEligible(other, allowed)).toBe(false)
  expect(
    isOpeningEligible(
      { ...other, customFields: { noticiadestacada: true } },
      allowed
    )
  ).toBe(true)
  expect(
    isOpeningEligible(
      { ...other, customFields: { noticiadestacada: false } },
      allowed
    )
  ).toBe(false)
  expect(
    isOpeningEligible(
      { ...other, customFields: JSON.parse('{"noticiadestacada":"true"}') },
      allowed
    )
  ).toBe(false)
})
it.each([
  ['2026-10-18T00:00:00', true],
  ['2026-10-18T23:59:59', true],
  ['2026-10-18T03:59:59Z', false],
  ['2026-10-18T04:00:00Z', true],
  ['2026-10-19T03:59:59Z', true],
  ['2026-10-19T04:00:00Z', false],
  ['2026-10-18T01:00:00+03:00', false],
  ['2026-10-17T23:59:59', false],
  ['2026-10-19T00:00:00', false],
  ['2026-10-18', true],
  ['broken', false],
  ['', false],
  ['2026-02-30T00:00:00', false],
  ['2026-10-18T24:00:00', false]
])('publication date %s eligibility is %s in Caracas', (date, expected) => {
  expect(isPublishedOnDay({ date }, day)).toBe(expected)
})
it('removes all stale cached news including flagged hero and video feeds at midnight without fallback', () => {
  const article = { ...post(), customFields: { noticiadestacada: true } }
  const data = {
    featured: article,
    sections: {
      opening: [article],
      videos: [article],
      latest: [article],
      zulia: [article]
    },
    regions: [],
    errors: []
  }
  expect(homePublicationDay(new Date('2026-10-19T03:59:59Z'))).toBe(day)
  const filtered = filterHomePublicationDay(
    data,
    homePublicationDay(new Date('2026-10-19T04:00:00Z'))
  )
  expect(filtered.featured).toBeNull()
  expect(Object.values(filtered.sections).flat()).toEqual([])
  expect(isPublishedOnDay({}, day)).toBe(false)
})
it('reads ranking publication dates from canonical article paths, never visit dates', () => {
  expect(rankingPublicationDay('/2026/10/18/nota/')).toBe(day)
  expect(
    rankingPublicationDay('https://www.noticiascol.com/2026/10/18/nota/?x=1')
  ).toBe(day)
  expect(rankingPublicationDay('/2026/02/30/nota/')).toBeNull()
  expect(rankingPublicationDay('/categoria/zulia/')).toBeNull()
})
