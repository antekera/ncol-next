import { render, screen, waitFor } from '@testing-library/react'
import { VisitCounter } from '..'
import { HttpClient } from '@lib/httpClient'

jest.mock('@lib/httpClient')

jest.mock('@components/ui/skeleton', () => ({
  Skeleton: () => <div data-testid='skeleton' />
}))

describe('VisitCounter', () => {
  const base = {
    slug: 'a',
    featuredImage: '/img.jpg',
    title: 'título'
  }

  let mockPost: jest.Mock

  beforeEach(() => {
    // Access the instance created in the component file
    const mockInstance = (HttpClient as unknown as jest.Mock).mock.instances[0]
    mockPost = mockInstance.post as jest.Mock
    mockPost.mockReset()
  })

  test('does not render for posts older than 30 days', () => {
    const oldDate = new Date(
      Date.now() - 60 * 24 * 60 * 60 * 1000
    ).toISOString()
    const { container } = render(
      <VisitCounter {...base} dateString={oldDate} />
    )
    expect(container.firstChild).toBeNull()
  })

  test('renders counter when count >= 10', async () => {
    mockPost.mockResolvedValue({ count: 11 })
    render(<VisitCounter {...base} dateString={new Date().toISOString()} />)
    // counter appears with value from API
    expect(await screen.findByText('11')).toBeInTheDocument()
  })

  test('renders skeleton while loading', () => {
    mockPost.mockReturnValue(new Promise(() => {})) // Never resolves
    render(<VisitCounter {...base} dateString={new Date().toISOString()} />)
    expect(screen.getByTestId('skeleton')).toBeInTheDocument()
  })

  test('does not render when count < 10', async () => {
    mockPost.mockResolvedValue({ count: 5 })
    const { container } = render(
      <VisitCounter {...base} dateString={new Date().toISOString()} />
    )

    await waitFor(() => {
      expect(container.firstChild).toBeNull()
    })
  })
})
