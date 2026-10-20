import { render, screen } from '@testing-library/react'
import { PostEditorialLinks } from '..'
import { CATEGORY_PATH, TAG_PATH } from '@lib/constants'

describe('PostEditorialLinks', () => {
  const originalSlashFlag = process.env.__NEXT_MANUAL_TRAILING_SLASH
  beforeAll(() => {
    process.env.__NEXT_MANUAL_TRAILING_SLASH = 'true'
  })
  afterAll(() => {
    if (originalSlashFlag === undefined)
      delete process.env.__NEXT_MANUAL_TRAILING_SLASH
    else process.env.__NEXT_MANUAL_TRAILING_SLASH = originalSlashFlag
  })
  test('renders category, tags and editorial routes', () => {
    render(
      <PostEditorialLinks
        categories={{
          type: 'category',
          edges: [
            { node: { name: 'Nacionales', slug: 'nacionales' } },
            { node: { name: 'Sucesos', slug: 'sucesos' } }
          ]
        }}
        tags={{
          edges: [
            { node: { id: '1', name: 'Política', slug: 'politica' } },
            { node: { id: '2', name: 'Economía', slug: 'economia' } }
          ]
        }}
      />
    )

    expect(
      screen.getByRole('region', { name: 'Sigue explorando esta cobertura' })
    ).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Nacionales' })).toHaveAttribute(
      'href',
      `${CATEGORY_PATH}/nacionales/`
    )
    expect(screen.getByRole('link', { name: 'Política' })).toHaveAttribute(
      'href',
      `${TAG_PATH}/politica/`
    )
    expect(screen.getByText('Más leídos')).toBeInTheDocument()
    expect(
      screen.queryAllByRole('button', { name: /suscribirte/i })
    ).toHaveLength(0)
  })
  it.each([
    '/category/nacionales',
    'https://admin.noticiascol.com/category/nacionales/'
  ])('keeps CMS category %s on the current deployment', uri => {
    render(
      <PostEditorialLinks
        categories={{
          type: 'category',
          edges: [{ node: { name: 'Nacionales', slug: 'nacionales', uri } }]
        }}
      />
    )
    const link = screen.getByRole('link', { name: 'Nacionales' })
    expect(link).toHaveAttribute('href', `${CATEGORY_PATH}/nacionales/`)
    expect(
      new URL(link.getAttribute('href')!, 'https://preview.example/').origin
    ).toBe('https://preview.example')
  })
})
