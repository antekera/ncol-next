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

  test('copy to clipboard shows tooltip and writes URL', async () => {
    const writeText = jest.fn().mockResolvedValue(undefined)
    Object.assign(navigator, { clipboard: { writeText } })

    render(
      <FacebookProvider appId={'123456'}>
        <Share uri={'/post'} />
      </FacebookProvider>
    )

    fireEvent.click(screen.getByTitle('Copia el enlace'))
    expect(writeText).toHaveBeenCalledWith('https://noticiascol.com/post')
    // tooltip becomes visible
    expect(screen.getByText('¡Enlace copiado!')).toBeVisible()
  })

  test('clicking comments link toggles and scrolls to anchor', () => {
    const anchor = document.createElement('div')
    anchor.id = 'comentarios'
    const scrollSpy = jest.fn()
    anchor.scrollIntoView = scrollSpy
    document.body.appendChild(anchor)

    render(
      <FacebookProvider appId={'123456'}>
        <Share uri={'/post'} />
      </FacebookProvider>
    )

    fireEvent.click(screen.getByTitle('Ver los comentarios'))
    expect(scrollSpy).toHaveBeenCalled()
  })
})
