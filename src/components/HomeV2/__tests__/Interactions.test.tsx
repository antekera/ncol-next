import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { RegionalFilter } from '../RegionalFilter'
import type { HomeArticle, HomeSection } from '@lib/homeV2/types'
import { getHomeV2Region } from '@app/actions/getHomeV2Region'

jest.mock('@app/actions/getHomeV2Region', () => ({
  getHomeV2Region: jest.fn()
}))
const post: HomeArticle = {
  id: 'p1',
  uri: '/zulia/10/17/puente/',
  title: 'Zulia mejora la infraestructura vial de la región',
  categories: { edges: [] }
}
const section: HomeSection = {
  id: 'zulia',
  title: 'Todo Zulia',
  categorySlug: 'zulia',
  position: 2,
  presentation: 'regional',
  limit: 7,
  href: '/categoria/zulia/',
  includeDescendants: true,
  articles: [post]
}
const regions = [
  { id: 'c1', databaseId: 52, slug: 'zulia', name: 'Zulia', parentId: null },
  {
    id: 'c2',
    databaseId: 10,
    slug: 'maracaibo',
    name: 'Maracaibo',
    parentId: 'c1'
  }
]

it('keeps the all-Zulia control first when CMS taxonomies arrive in another order', () => {
  render(<RegionalFilter section={section} regions={[...regions].reverse()} />)
  expect(screen.getAllByRole('button')[0]).toHaveTextContent('Todo Zulia')
  expect(screen.getAllByRole('button')[0]).toHaveAttribute(
    'aria-pressed',
    'true'
  )
})
it('filters locally without navigation and reuses a previously loaded municipality', async () => {
  jest.mocked(getHomeV2Region).mockResolvedValue({
    ok: true,
    articles: [
      { ...post, id: 'p2', title: 'Maracaibo recupera sus espacios públicos' }
    ]
  })
  render(<RegionalFilter section={section} regions={regions} />)
  fireEvent.change(
    screen.getByRole('combobox', { name: 'Municipio o región' }),
    { target: { value: 'maracaibo' } }
  )
  await waitFor(() =>
    expect(
      screen.getByText('Maracaibo recupera sus espacios públicos')
    ).toBeVisible()
  )
  fireEvent.click(screen.getByRole('button', { name: 'Todo Zulia' }))
  expect(screen.getByText(post.title)).toBeVisible()
  fireEvent.change(
    screen.getByRole('combobox', { name: 'Municipio o región' }),
    { target: { value: 'maracaibo' } }
  )
  expect(
    screen.getByText('Maracaibo recupera sus espacios públicos')
  ).toBeVisible()
  expect(getHomeV2Region).toHaveBeenCalledTimes(1)
})
it('keeps current news and announces a failed regional request', async () => {
  jest.mocked(getHomeV2Region).mockResolvedValue({ ok: false, articles: [] })
  render(<RegionalFilter section={section} regions={regions} />)
  fireEvent.change(
    screen.getByRole('combobox', { name: 'Municipio o región' }),
    { target: { value: 'maracaibo' } }
  )
  await waitFor(() =>
    expect(screen.getByRole('status')).toHaveTextContent(
      'No pudimos actualizar'
    )
  )
  expect(screen.getByText(post.title)).toBeVisible()
  expect(screen.getByRole('region', { name: 'Todo Zulia' })).toHaveAttribute(
    'data-region-id',
    'zulia'
  )
})

it('uses the cookie-free public GET and reuses a fresh municipality without an Action', async () => {
  jest.clearAllMocks()
  const now = Date.now()
  const day = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/Caracas',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  }).format(new Date(now))
  const originalFetch = global.fetch
  const request = jest.fn().mockResolvedValue({
    ok: true,
    json: async () => ({
      ok: true,
      articles: [{ ...post, title: 'Noticias públicas de Maracaibo' }],
      editorialDay: day,
      cacheUntil: now + 60000,
      validUntil: Date.parse(`${day}T00:00:00-04:00`) + 86400000
    })
  })
  global.fetch = request
  try {
    render(
      <RegionalFilter
        section={section}
        regions={regions}
        publicRegionApi
        initialDay={day}
        initialCacheUntil={now + 60000}
      />
    )
    const select = screen.getByRole('combobox', { name: 'Municipio o región' })
    fireEvent.change(select, { target: { value: 'maracaibo' } })
    await waitFor(() =>
      expect(screen.getByText('Noticias públicas de Maracaibo')).toBeVisible()
    )
    fireEvent.click(screen.getByRole('button', { name: 'Todo Zulia' }))
    fireEvent.change(select, { target: { value: 'maracaibo' } })
    expect(screen.getByText('Noticias públicas de Maracaibo')).toBeVisible()
    expect(request).toHaveBeenCalledTimes(1)
    expect(request).toHaveBeenCalledWith(
      `/api/home-v2/region/${day}/maracaibo`,
      { credentials: 'omit' }
    )
    expect(getHomeV2Region).not.toHaveBeenCalled()
  } finally {
    global.fetch = originalFetch
  }
})

it('requests a public municipality again after its cache deadline, without polling', async () => {
  jest.clearAllMocks()
  const now = Date.now()
  const day = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/Caracas',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  }).format(new Date(now))
  const originalFetch = global.fetch
  const request = jest.fn().mockImplementation(async () => ({
    ok: true,
    json: async () => ({
      ok: true,
      articles: [
        { ...post, title: `Respuesta pública ${request.mock.calls.length}` }
      ],
      editorialDay: day,
      cacheUntil: Date.now() + 1000,
      validUntil: Date.parse(`${day}T00:00:00-04:00`) + 86400000
    })
  }))
  global.fetch = request
  try {
    render(
      <RegionalFilter
        section={section}
        regions={regions}
        publicRegionApi
        initialDay={day}
        initialCacheUntil={now + 60000}
      />
    )
    const select = screen.getByRole('combobox', { name: 'Municipio o región' })
    fireEvent.change(select, { target: { value: 'maracaibo' } })
    await waitFor(() =>
      expect(screen.getByText('Respuesta pública 1')).toBeVisible()
    )
    jest.advanceTimersByTime(1100)
    expect(request).toHaveBeenCalledTimes(1)
    fireEvent.click(screen.getByRole('button', { name: 'Todo Zulia' }))
    fireEvent.change(select, { target: { value: 'maracaibo' } })
    await waitFor(() =>
      expect(screen.getByText('Respuesta pública 2')).toBeVisible()
    )
    expect(request).toHaveBeenCalledTimes(2)
  } finally {
    global.fetch = originalFetch
  }
})
