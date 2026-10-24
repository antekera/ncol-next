import { render, screen } from '@testing-library/react'
import { SidebarRankings } from '..'

jest.mock('@lib/hooks/data/useSidebarRankings', () => ({
  useSidebarRankings: jest.fn()
}))
jest.mock('react-intersection-observer', () => ({
  useInView: () => ({ ref: jest.fn(), inView: true })
}))
jest.mock('@components/CategoryArticle', () => ({
  CategoryArticle: ({
    title,
    homePosition
  }: {
    title: string
    homePosition?: number
  }) => <article data-item-position={homePosition}>{title}</article>
}))

import { useSidebarRankings } from '@lib/hooks/data/useSidebarRankings'

describe('SidebarRankings', () => {
  it('renders both rankings and view more links', () => {
    ;(useSidebarRankings as jest.Mock).mockReturnValue({
      data: {
        mostRead: [
          { slug: '/a', image: '/a.jpg', title: 'A' },
          { slug: '/b', image: '/b.jpg', title: 'B' }
        ],
        mostViewedToday: [
          { slug: '/c', image: '/c.jpg', title: 'C' },
          { slug: '/d', image: '/d.jpg', title: 'D' }
        ]
      },
      error: null
    })

    render(<SidebarRankings />)

    expect(screen.getByText('Más leídos')).toBeInTheDocument()
    expect(screen.getByText('Más visto hoy')).toBeInTheDocument()
    expect(screen.getByText('A')).toBeInTheDocument()
    expect(screen.getByText('D')).toBeInTheDocument()

    const links = screen.getAllByRole('link', { name: 'Ver más' })
    expect(links).toHaveLength(2)
    expect(links[0]).toHaveAttribute('href', '/mas-leidos')
    expect(links[1]).toHaveAttribute('href', '/mas-visto-hoy')
  })

  it('renders skeletons while loading', () => {
    ;(useSidebarRankings as jest.Mock).mockReturnValue({
      data: null,
      error: null
    })

    const { container } = render(<SidebarRankings />)

    expect(container.querySelectorAll('.animate-pulse').length).toBeGreaterThan(
      0
    )
  })
  it('exposes distinct Home rankings and positions only when explicitly requested', () => {
    ;(useSidebarRankings as jest.Mock).mockReturnValue({
      data: {
        mostRead: [{ slug: '/a', image: '/a.jpg', title: 'A' }],
        mostViewedToday: [{ slug: '/b', image: '/b.jpg', title: 'B' }]
      },
      error: null
    })
    const { container, rerender } = render(<SidebarRankings />)
    expect(container.querySelector('[data-module-id]')).toBeNull()
    rerender(<SidebarRankings homeMeasurement />)
    const sections = container.querySelectorAll('section[data-module-id]')
    expect(
      [...sections].map(section => section.getAttribute('data-module-id'))
    ).toEqual(['ranking', 'ranking-today'])
    expect(sections[0].querySelector('[data-item-position="1"]')).not.toBeNull()
    expect(sections[1].querySelector('[data-module-marker]')).not.toBeNull()
    expect(sections[0].querySelector('a')).toHaveAttribute(
      'data-component-type',
      'section_link'
    )
  })
})
