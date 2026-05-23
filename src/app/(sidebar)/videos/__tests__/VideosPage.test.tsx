import { render, screen } from '@testing-library/react'
import Page from '../page'
import { VideosPageContent } from '../VideosPageContent'
import { useVideoPosts } from '@lib/hooks/data/useVideoPosts'
import { PostHome } from '@lib/types'

// Mock useVideoPosts
jest.mock('@lib/hooks/data/useVideoPosts', () => ({
  useVideoPosts: jest.fn()
}))

// Mock next/image
jest.mock('next/image', () => ({
  __esModule: true,
  default: (props: any) => {
    // eslint-disable-next-line @next/next/no-img-element
    return <img {...props} alt={props.alt || ''} />
  }
}))

// Mock Sidebar component
jest.mock('@components/Sidebar', () => ({
  Sidebar: () => <div data-testid='sidebar'>Sidebar</div>
}))

// Mock HoverPrefetchLink
jest.mock('@components/HoverPrefetchLink', () => ({
  HoverPrefetchLink: ({ href, children, ...props }: any) => (
    <a href={href} {...props}>
      {children}
    </a>
  )
}))

// Mock GAEvent
jest.mock('@lib/utils/ga', () => ({
  GAEvent: jest.fn()
}))

const mockPosts: PostHome[] = [
  {
    id: 'post-1',
    title: 'Test Video Post 1',
    uri: '/test-video-post-1',
    date: '2026-05-20T00:00:00.000Z',
    slug: 'test-video-post-1',
    featuredImage: null,
    categories: {
      edges: [
        {
          node: {
            name: 'Deportes',
            slug: 'deportes',
            parentId: null
          }
        }
      ]
    },
    customFields: {
      videodestacado: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ'
    }
  },
  {
    id: 'post-2',
    title: 'Test Video Post 2',
    uri: '/test-video-post-2',
    date: '2026-05-19T00:00:00.000Z',
    slug: 'test-video-post-2',
    featuredImage: null,
    categories: {
      edges: [
        {
          node: {
            name: '_Pos_Columna_der',
            slug: 'pos-columna-der',
            parentId: null
          }
        }
      ]
    },
    customFields: {
      videodestacado: 'https://www.dailymotion.com/video/x7tgad0'
    }
  }
]

describe('VideosPageContent', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  test('renders skeletons when loading', () => {
    ;(useVideoPosts as jest.Mock).mockReturnValue({
      posts: [],
      isLoading: true,
      error: null
    })

    const { container } = render(<VideosPageContent />)
    expect(container.querySelectorAll('.animate-pulse').length).toBe(4)
  })

  test('renders error state when fetch fails', () => {
    ;(useVideoPosts as jest.Mock).mockReturnValue({
      posts: [],
      isLoading: false,
      error: new Error('Failed to fetch')
    })

    render(<VideosPageContent />)
    expect(
      screen.getByText(
        'Hubo un error cargando los videos. Por favor, intente de nuevo.'
      )
    ).toBeInTheDocument()
  })

  test('renders empty state when no posts are returned', () => {
    ;(useVideoPosts as jest.Mock).mockReturnValue({
      posts: [],
      isLoading: false,
      error: null
    })

    render(<VideosPageContent />)
    expect(
      screen.getByText('No se encontraron videos recientes.')
    ).toBeInTheDocument()
  })

  test('renders video grid when posts are loaded', () => {
    ;(useVideoPosts as jest.Mock).mockReturnValue({
      posts: mockPosts,
      isLoading: false,
      error: null
    })

    render(<VideosPageContent />)

    // Check that useVideoPosts was called with filterByDate: false
    expect(useVideoPosts).toHaveBeenCalledWith({ filterByDate: false })

    // Check posts titles
    expect(screen.getByText('Test Video Post 1')).toBeInTheDocument()
    expect(screen.getByText('Test Video Post 2')).toBeInTheDocument()

    // Verify both videos have rendered their iframes
    const iframes = document.querySelectorAll('iframe')
    expect(iframes.length).toBe(2)
  })
})

describe('Videos Page Server Component', () => {
  test('renders Page layout with title and no sidebar', () => {
    ;(useVideoPosts as jest.Mock).mockReturnValue({
      posts: mockPosts,
      isLoading: false,
      error: null
    })

    render(<Page />)

    expect(
      screen.getByRole('heading', { name: 'Videos Recientes' })
    ).toBeInTheDocument()
    expect(screen.queryByTestId('sidebar')).not.toBeInTheDocument()
  })
})
