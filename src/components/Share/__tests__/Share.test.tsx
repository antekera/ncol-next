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

  test('copy to clipboard shows tooltip and writes URL', async () => {
    const writeText = jest.fn().mockResolvedValue(undefined)
    Object.assign(navigator, { clipboard: { writeText } })

    render(<Share uri={'/post'} />)

    fireEvent.click(screen.getByTitle('Copia el enlace'))
    expect(writeText).toHaveBeenCalledWith('https://www.noticiascol.com/post')
    // tooltip becomes visible
    expect(screen.getByText('¡Enlace copiado!')).toBeVisible()
  })

  test('uses native share when available', async () => {
    const share = jest.fn().mockResolvedValue(undefined)
    Object.assign(navigator, {
      share,
      canShare: jest.fn().mockReturnValue(true)
    })

    render(<Share uri={'/post'} />)

    const button = await screen.findByRole('button', { name: 'Compartir' })
    fireEvent.click(button)

    expect(share).toHaveBeenCalledWith({
      title: document.title,
      text: document.title,
      url: 'https://www.noticiascol.com/post'
    })
  })

  test('falls back to link sharing when an embedded native share bridge fails', async () => {
    const share = jest.fn().mockRejectedValue(new Error('bridge unavailable'))
    Object.assign(navigator, {
      share,
      canShare: jest.fn().mockReturnValue(true)
    })

    render(<Share uri={'/post'} />)

    fireEvent.click(await screen.findByRole('button', { name: 'Compartir' }))

    expect(
      await screen.findByRole('button', { name: 'Copia el enlace' })
    ).toBeInTheDocument()
  })
})
