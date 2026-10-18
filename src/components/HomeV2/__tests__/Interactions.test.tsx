import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { RegionalFilter } from '../RegionalFilter'
import { VideoStrip } from '../VideoStrip'
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
it('loads a video iframe only after an explicit play action', () => {
  const { container } = render(
    <VideoStrip
      posts={[
        {
          ...post,
          customFields: { videodestacado: 'https://youtu.be/example123' }
        }
      ]}
    />
  )
  expect(container.querySelector('iframe')).toBeNull()
  fireEvent.click(
    screen.getByRole('button', { name: `Reproducir: ${post.title}` })
  )
  expect(screen.getByTitle(post.title)).toHaveAttribute(
    'src',
    'https://www.youtube.com/embed/example123?autoplay=1'
  )
  expect(screen.getByRole('link', { name: post.title })).toBeInTheDocument()
})
