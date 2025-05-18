import { fireEvent, render, screen } from '@testing-library/react'
import { Share } from '..'
import { FacebookProvider } from 'react-facebook'

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
    const { container } = render(
      <FacebookProvider appId={'123456'}>
        <Share uri={'http...'} />
      </FacebookProvider>
    )
    expect(container.firstChild).toBeInTheDocument()
  })

  test('it should call the GAEvent function when clicking on the Facebook, Twitter, and WhatsApp links', () => {
    render(
      <FacebookProvider appId={'123456'}>
        <Share uri={'http...'} />
      </FacebookProvider>
    )

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
