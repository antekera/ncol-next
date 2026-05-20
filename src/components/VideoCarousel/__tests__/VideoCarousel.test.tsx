import { render, screen } from '@testing-library/react'
import { VideoCarousel } from '../index'
import { PostHome } from '@lib/types'
import { useInView } from 'react-intersection-observer'
import { useVideoPosts } from '@lib/hooks/data/useVideoPosts'
import { GAEvent } from '@lib/utils/ga'

// Mock GAEvent
jest.mock('@lib/utils/ga', () => ({
  GAEvent: jest.fn()
}))

// Mock next/image
jest.mock('next/image', () => ({
  __esModule: true,
  default: (props: any) => {
    // eslint-disable-next-line @next/next/no-img-element
    return <img {...props} alt={props.alt || ''} />
  }
}))

// Mock HoverPrefetchLink
jest.mock('@components/HoverPrefetchLink', () => ({
  HoverPrefetchLink: ({ href, children, ...props }: any) => (
    <a href={href} {...props}>
      {children}
    </a>
  )
}))

// Mock react-intersection-observer
jest.mock('react-intersection-observer', () => ({
  useInView: jest.fn()
}))

// Mock useVideoPosts hook
jest.mock('@lib/hooks/data/useVideoPosts', () => ({
  useVideoPosts: jest.fn()
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

describe('VideoCarousel', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    ;(useInView as jest.Mock).mockReturnValue({
      ref: jest.fn(),
      inView: true
    })
  })

  test('renders section title, category links (ignoring post layout categories), and posts', () => {
    ;(useVideoPosts as jest.Mock).mockReturnValue({
      posts: mockPosts,
      isLoading: false,
      error: null
    })

    render(<VideoCarousel />)

    // Check section title
    expect(screen.getByText('Videos Recientes')).toBeInTheDocument()

    // Check post titles
    expect(screen.getByText('Test Video Post 1')).toBeInTheDocument()
    expect(screen.getByText('Test Video Post 2')).toBeInTheDocument()

    // Check category links (Deportes should be visible, but _Pos_Columna_der ignored to default to "Video")
    const categoryLink = screen.getByText('Deportes')
    expect(categoryLink).toBeInTheDocument()
    expect(categoryLink.getAttribute('href')).toBe('/categoria/deportes')

    // Second post has layout category ignored, so it defaults to category text 'Video' without link slug
    expect(screen.getByText('Video')).toBeInTheDocument()
  })

  test('renders iframes directly without preview images', () => {
    ;(useVideoPosts as jest.Mock).mockReturnValue({
      posts: mockPosts,
      isLoading: false,
      error: null
    })

    render(<VideoCarousel />)

    // Verify both videos have rendered their iframes directly
    const iframes = document.querySelectorAll('iframe')
    expect(iframes.length).toBe(2)
    expect(iframes[0].getAttribute('src')).toContain('youtube.com/embed')
    expect(iframes[1].getAttribute('src')).toContain('dailymotion.com/embed')
  })

  test('renders skeleton when loading', () => {
    ;(useVideoPosts as jest.Mock).mockReturnValue({
      posts: [],
      isLoading: true,
      error: null
    })

    const { container } = render(<VideoCarousel />)

    // Check that we have a pulse skeleton layout
    expect(container.querySelector('.animate-pulse')).toBeInTheDocument()
  })

  test('returns null if no posts are returned', () => {
    ;(useVideoPosts as jest.Mock).mockReturnValue({
      posts: [],
      isLoading: false,
      error: null
    })

    const { container } = render(<VideoCarousel />)
    expect(container.firstChild).toBeNull()
  })

  test('renders skeleton when not in view', () => {
    ;(useInView as jest.Mock).mockReturnValue({
      ref: jest.fn(),
      inView: false
    })
    ;(useVideoPosts as jest.Mock).mockReturnValue({
      posts: [],
      isLoading: false,
      error: null
    })

    const { container } = render(<VideoCarousel />)
    expect(container.querySelector('.animate-pulse')).toBeInTheDocument()
  })

  test('dispatches GAEvent when links are clicked', () => {
    ;(useVideoPosts as jest.Mock).mockReturnValue({
      posts: mockPosts,
      isLoading: false,
      error: null
    })

    render(<VideoCarousel />)

    // Click Category Link
    const categoryLink = screen.getByText('Deportes')
    categoryLink.click()
    expect(GAEvent).toHaveBeenCalledWith({
      action: 'CLICK_CATEGORY_LINK',
      category: 'VIDEO_WIDGET',
      label: 'deportes'
    })

    // Click Title Link
    const titleLink = screen.getByText('Test Video Post 1')
    titleLink.click()
    expect(GAEvent).toHaveBeenCalledWith({
      action: 'CLICK_POST_LINK',
      category: 'VIDEO_WIDGET',
      label: '/test-video-post-1'
    })

    // Click Ver noticia Link
    const viewNewsLink = screen.getAllByText('Ver noticia')[0]
    viewNewsLink.click()
    expect(GAEvent).toHaveBeenCalledWith({
      action: 'CLICK_VIEW_NEWS',
      category: 'VIDEO_WIDGET',
      label: '/test-video-post-1'
    })
  })

  test('dispatches GAEvent on play when iframe is clicked/focused', () => {
    ;(useVideoPosts as jest.Mock).mockReturnValue({
      posts: mockPosts,
      isLoading: false,
      error: null
    })

    render(<VideoCarousel />)

    const iframes = document.querySelectorAll('iframe')
    const firstIframe = iframes[0]

    // Mock document.activeElement to point to the iframe
    Object.defineProperty(document, 'activeElement', {
      value: firstIframe,
      writable: true,
      configurable: true
    })

    // Dispatch window blur event
    window.dispatchEvent(new Event('blur'))

    expect(GAEvent).toHaveBeenCalledWith({
      action: 'PLAY_VIDEO',
      category: 'VIDEO_WIDGET',
      label: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ'
    })
  })
})
