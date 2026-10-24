import { act, render, screen } from '@testing-library/react'
import { HomeV2 } from '..'
import type { HomeArticle, HomeV2Data } from '@lib/homeV2/types'
jest.mock('@app/actions/getHomeV2Region', () => ({
  getHomeV2Region: jest.fn()
}))
jest.mock('@components/NcolAdSlot', () => ({
  NcolAdSlot: ({ slot }: { slot: string }) => (
    <aside data-testid={`ad-${slot}`}>Publicidad</aside>
  )
}))
jest.mock('../Sidebar', () => ({ Sidebar: () => null }))
jest.mock('@components/VideoCarousel', () => ({
  VideoCarousel: ({ posts }: { posts: HomeArticle[] }) => (
    <section data-testid='videos'>
      {posts.map(p => (
        <span key={p.id}>{p.title}</span>
      ))}
    </section>
  )
}))
const ordinary: HomeArticle = {
  id: 'ordinary',
  uri: '/ordinary/',
  title: 'Noticia permanente',
  date: '2020-01-01T00:00:00Z',
  categories: { edges: [{ node: { slug: 'zulia', name: 'Zulia' } }] }
}
const source = (lead: HomeArticle): HomeV2Data => ({
  featured: lead,
  sections: Object.fromEntries(
    [
      'opening',
      'zulia',
      'latest',
      'videos',
      'nacionales',
      'sucesos',
      'internacionales',
      'deportes',
      'tendencias',
      'entretenimiento'
    ].map(id => [id, [lead, ordinary]])
  ),
  regions: [],
  errors: []
})
afterEach(() => jest.useRealTimers())
it('switches actual Home modules at midnight, retaining one heading, positions and ad DOM', () => {
  jest.useFakeTimers().setSystemTime(new Date('2026-10-24T03:59:59Z'))
  const dated = {
    ...ordinary,
    id: 'dated',
    uri: '/dated/',
    title: 'Jornada del 23 de octubre de 2026'
  }
  const { container } = render(<HomeV2 data={source(dated)} />)
  const ad = screen.getByTestId('ad-article-top'),
    footer = screen.getByTestId('ad-footer')
  expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(
    dated.title
  )
  act(() => jest.advanceTimersByTime(1000))
  expect(screen.queryAllByText(dated.title)).toHaveLength(0)
  expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(
    ordinary.title
  )
  expect(screen.getAllByRole('heading', { level: 1 })).toHaveLength(1)
  expect(screen.getByTestId('ad-article-top')).toBe(ad)
  expect(screen.getByTestId('ad-footer')).toBe(footer)
  expect(screen.getByTestId('videos')).toHaveTextContent(ordinary.title)
  for (const node of container.querySelectorAll('[data-article-id]'))
    expect(node).toHaveAttribute('data-item-position', '1')
})
it('expires the manual override across cover treatments while retaining its ordinary appearances', () => {
  jest.useFakeTimers().setSystemTime(new Date('2026-10-23T15:00:00Z'))
  const manual = {
    ...ordinary,
    id: 'manual',
    uri: '/manual/',
    title: 'Destacada manual',
    featuredImage: {
      node: {
        sourceUrl: 'https://cdn.noticiascol.com/test-cover.jpg',
        mediaDetails: { width: 1600, height: 900 }
      }
    },
    date: '2026-10-22T15:00:01Z',
    customFields: { noticiadestacada: true },
    categories: { edges: [{ node: { slug: 'deportes', name: 'Deportes' } }] }
  }
  const { container } = render(<HomeV2 data={source(manual)} />)
  expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(
    manual.title
  )
  expect(
    container.querySelector('section[data-module-id="opening"]')
  ).toHaveAttribute('data-opening-treatment', 'photographic')
  act(() => jest.advanceTimersByTime(1000))
  expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(
    ordinary.title
  )
  expect(
    container.querySelector('section[data-module-id="opening"]')
  ).toHaveAttribute('data-opening-treatment', 'traditional')
  expect(
    container.querySelector('section[data-module-id="opening"]')
  ).not.toHaveTextContent(manual.title)
  expect(
    container.querySelector('section[data-module-id="latest"]')
  ).toHaveTextContent(manual.title)
})
