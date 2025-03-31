import { fireEvent, render, screen } from '@testing-library/react'
import { Share } from '..'

jest.mock('next/navigation', () => ({
  usePathname: jest.fn(),
  useParams() {
    return {
      slug: '/'
    }
  }
}))

describe('Share', () => {
  beforeEach(() => {
    window.dataLayer = []
  })

  test('it should render without errors', () => {
    const { container } = render(<Share uri={'http...'} />)
    expect(container.firstChild).toBeInTheDocument()
  })

  test('it should call the GAEvent function when clicking on the Facebook, Twitter, and WhatsApp links', () => {
    render(<Share uri={'http...'} />)

    fireEvent.click(screen.getByTitle('Compartir por WhatsApp'))
    expect(window.dataLayer).toMatchObject([
      {
        category: 'SHARE_OPTION',
        event: 'CLICK_EVENT',
        label: 'WHATSAPP',
        non_interaction: false
      }
    ])
  })
})
