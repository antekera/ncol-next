import {
  filterHomeHeadlineDates,
  homeEditorialDay,
  isOpeningEligible,
  isHeadlineCurrent
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
beforeEach(() =>
  jest.useFakeTimers().setSystemTime(new Date('2026-10-18T15:00:00Z'))
)
afterEach(() => jest.useRealTimers())
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
it('expires the category override after 24 hours without excluding ordinary older news', () => {
  const expired = {
    ...post('Noticia de deportes', '2026-10-17T10:59:59'),
    categories: { edges: [{ node: { slug: 'deportes', name: 'Deportes' } }] },
    customFields: { noticiadestacada: true }
  }
  expect(isOpeningEligible(expired, allowed)).toBe(false)
  expect(
    isOpeningEligible({ ...expired, categories: post().categories }, allowed)
  ).toBe(true)
  expect(
    isOpeningEligible(post('Noticia antigua', '2020-01-01T12:00:00'), allowed)
  ).toBe(true)
})

it('rechecks a cached manual feature at expiry and preserves every other module', () => {
  const marked = {
    ...post('Destacada manual', '2026-10-18T10:00:00'),
    categories: { edges: [{ node: { slug: 'deportes', name: 'Deportes' } }] },
    customFields: { noticiadestacada: true }
  }
  const ordinary = {
    ...post('Noticia ordinaria', '2026-10-18T10:30:00'),
    categories: { edges: [{ node: { slug: 'cabimas', name: 'Cabimas' } }] }
  }
  const data = {
    featured: marked,
    openingCategorySlugs: [...allowed],
    sections: {
      opening: [ordinary, marked],
      deportes: [marked],
      latest: [marked, ordinary]
    },
    regions: [],
    errors: []
  }
  expect(filterHomeHeadlineDates(data, day).featured).toBe(marked)
  const expired = filterHomeHeadlineDates(
    data,
    '2026-10-19',
    Date.parse('2026-10-19T14:00:00Z')
  )
  expect(expired.featured).toBe(ordinary)
  expect(expired.sections.opening).toEqual([ordinary])
  expect(expired.sections.deportes).toEqual([marked])
  expect(expired.sections.latest).toEqual([marked, ordinary])
  expect(data.featured).toBe(marked)
  expect(data.sections.opening).toEqual([ordinary, marked])
})

it('removes expired manual priority for allowed categories but can select the story normally', () => {
  const marked = {
    ...post('Destacada', '2026-10-17T08:00:00'),
    customFields: { noticiadestacada: true }
  }
  const recent = post('Más reciente')
  const data = {
    featured: marked,
    sections: { opening: [recent, marked] },
    regions: [],
    errors: []
  }
  expect(filterHomeHeadlineDates(data, day).featured).toBe(recent)
  expect(
    filterHomeHeadlineDates({ ...data, sections: { opening: [marked] } }, day)
      .featured
  ).toBe(marked)
})
it.each([
  ['Mejoran la vialidad en Cabimas', '2026-10-17T08:00:00', true],
  ['Mejoran la vialidad en Cabimas', undefined, true],
  ['Mejoran la vialidad en Cabimas', '2025-01-01T08:00:00', true],
  ['Jornada especial este 18 de octubre', '2026-10-17T08:00:00', true],
  ['Jornada especial este 17 de octubre', '2026-10-18T08:00:00', false],
  ['Jornada especial este 19 de octubre', '2026-10-17T08:00:00', true],
  ['Jornada este 18 de octubre de 2025', '2026-10-18T08:00:00', false],
  ['Jornada este 18 de octubre', '2025-10-18T08:00:00', true],
  ['Jornada este 18 de OCTUBRE de 2026', '2026-10-10T08:00:00', true],
  ['Jornada el 31 de febrero', '2026-10-18T08:00:00', true],
  ['Noticias de hoy', '2026-10-17T08:00:00', true],
  ['Jornada del 2026-10-17', '2026-10-18T08:00:00', false],
  ['Jornada del 17/10/2026', '2026-10-18T08:00:00', false]
])(
  'headline %s eligibility ignores publication age (%s)',
  (title, date, expected) => {
    expect(isHeadlineCurrent({ title, date }, day)).toBe(expected)
  }
)
it('uses the last explicit date of a range and handles year boundaries', () => {
  expect(
    isHeadlineCurrent(
      {
        title: 'Cotización del sábado 17 al lunes 19 de octubre',
        date: '2026-10-17'
      },
      day
    )
  ).toBe(true)
  expect(
    isHeadlineCurrent(
      {
        title: 'Cotización del 17 de octubre al 19 de octubre',
        date: '2026-10-17'
      },
      '2026-10-20'
    )
  ).toBe(false)
  expect(
    isHeadlineCurrent(
      { title: 'Jornada del 31 de diciembre', date: '2026-12-31' },
      '2027-01-01'
    )
  ).toBe(false)
  expect(
    isHeadlineCurrent(
      { title: 'Jornada del 2 de enero', date: '2026-12-30' },
      '2026-12-31'
    )
  ).toBe(true)
})
it('expires dated headlines at Caracas midnight while keeping older ordinary news in every cached feed', () => {
  const ordinary = post('Obras en Cabimas', '2026-10-10T08:00:00')
  const dated = {
    ...post('Jornada del 18 de octubre'),
    customFields: { noticiadestacada: true }
  }
  const data = {
    featured: dated,
    sections: {
      opening: [dated, ordinary],
      videos: [dated, ordinary],
      latest: [dated, ordinary],
      zulia: [dated, ordinary]
    },
    regions: [],
    errors: []
  }
  expect(homeEditorialDay(new Date('2026-10-19T03:59:59Z'))).toBe(day)
  const filtered = filterHomeHeadlineDates(
    data,
    homeEditorialDay(new Date('2026-10-19T04:00:00Z'))
  )
  expect(filtered.featured).toEqual(ordinary)
  expect(
    Object.values(filtered.sections).every(
      articles => articles.length === 1 && articles[0] === ordinary
    )
  ).toBe(true)
})

it.each([
  ['Jornada del 17 de octubre al 19', '2026-10-18', true],
  ['Jornada del 17 de octubre al 19', '2026-10-20', false],
  ['Jornada del 31 de diciembre al 2', '2027-01-01', true],
  ['Jornada del 17/10', '2026-10-18', false],
  ['Jornada del 17-10-2026', '2026-10-18', false],
  ['Jornada del 2026-01-02', '2026-01-03', false]
])(
  'handles abbreviated range or numeric headline %s on %s',
  (title, today, expected) => {
    expect(
      isHeadlineCurrent(
        {
          title,
          date: title.includes('diciembre') ? '2026-12-31' : '2026-10-17'
        },
        today
      )
    ).toBe(expected)
  }
)

it('uses the title date alone even when publication metadata or URI belongs to another year', () => {
  expect(
    isHeadlineCurrent(
      {
        title: 'Jornada del 18 de octubre',
        date: '2020-10-18',
        uri: '/2020/10/18/nota/'
      },
      day
    )
  ).toBe(true)
  expect(
    isHeadlineCurrent(
      { title: 'Jornada del 17 de abril', date: '2020-10-18' },
      day
    )
  ).toBe(false)
})
