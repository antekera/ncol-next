import { render, screen } from '@testing-library/react'
import { VisitCounter } from '..'

jest.mock('@lib/httpClient', () => ({
  HttpClient: class {
    post = jest.fn().mockResolvedValue({ count: 11 })
  }
}))

describe('VisitCounter', () => {
  const base = {
    slug: 'a',
    featuredImage: '/img.jpg',
    title: 'título'
  }

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
    render(<VisitCounter {...base} dateString={new Date().toISOString()} />)
    // counter appears with value from API
    expect(await screen.findByText('11')).toBeInTheDocument()
  })
})
