import { render, screen, act } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { NcolAdSlot, NcolAdSlotPopup, NcolAdSlotStickyBottom } from '..'
import type { ServedAd } from '@lib/hooks/data/useAds'

// ── Mock useAds and pickAd ────────────────────────────────────────────────────

const mockPickAd = jest.fn()
const mockUseAds = jest.fn()

jest.mock('@lib/hooks/data/useAds', () => ({
  useAds: (...args: unknown[]) => mockUseAds(...args),
  pickAd: (...args: unknown[]) => mockPickAd(...args)
}))

// ── Helpers ───────────────────────────────────────────────────────────────────

function makeBannerAd(overrides: Partial<ServedAd> = {}): ServedAd {
  return {
    id: 'ad-1',
    type: 'banner',
    imageUrl: 'https://example.com/img.png',
    imageUrlMobile: 'https://example.com/img-mobile.png',
    htmlContent: null,
    linkUrl: 'https://example.com',
    slot: 'header',
    ...overrides
  }
}

function makeHtmlAd(overrides: Partial<ServedAd> = {}): ServedAd {
  return {
    id: 'ad-2',
    type: 'html',
    imageUrl: null,
    imageUrlMobile: null,
    htmlContent: '<div class="custom-ad">HTML Ad Content</div>',
    linkUrl: null,
    slot: 'inline',
    ...overrides
  }
}

beforeEach(() => {
  jest.clearAllMocks()
  mockUseAds.mockReturnValue({ data: [] })
  mockPickAd.mockReturnValue(null)
  // Reset localStorage
  localStorage.clear()
})

// ── NcolAdSlot ────────────────────────────────────────────────────────────────

describe('NcolAdSlot', () => {
  it('renders nothing when no ad is available for the slot', () => {
    mockPickAd.mockReturnValue(null)
    const { container } = render(<NcolAdSlot slot='header' />)
    expect(container.firstChild).toBeNull()
  })

  it('renders banner image when ad type is banner', async () => {
    const ad = makeBannerAd()
    mockUseAds.mockReturnValue({ data: [ad] })
    mockPickAd.mockReturnValue(ad)

    await act(async () => {
      render(<NcolAdSlot slot='header' />)
    })

    // The image appears after useEffect sets imgSrc
    const imgs = document.querySelectorAll('img')
    expect(imgs.length).toBeGreaterThan(0)
    expect(imgs[0]).toHaveAttribute('src', 'https://example.com/img.png')
  })

  it('renders a link wrapping the banner image', async () => {
    const ad = makeBannerAd({ linkUrl: 'https://example.com/campaign' })
    mockUseAds.mockReturnValue({ data: [ad] })
    mockPickAd.mockReturnValue(ad)

    await act(async () => {
      render(<NcolAdSlot slot='header' />)
    })

    const link = screen.getByRole('link')
    expect(link).toHaveAttribute('href', 'https://example.com/campaign')
    expect(link).toHaveAttribute('target', '_blank')
  })

  it('renders html content when ad type is html', async () => {
    const ad = makeHtmlAd({ slot: 'inline' })
    mockUseAds.mockReturnValue({ data: [ad] })
    mockPickAd.mockReturnValue(ad)

    const { container } = render(<NcolAdSlot slot='inline' />)

    // dangerouslySetInnerHTML renders content in the DOM
    await act(async () => {})
    expect(container.querySelector('.custom-ad')).toBeTruthy()
  })

  it('shows PUBLICIDAD label on banner ads', async () => {
    const ad = makeBannerAd()
    mockUseAds.mockReturnValue({ data: [ad] })
    mockPickAd.mockReturnValue(ad)

    render(<NcolAdSlot slot='header' />)

    const label = await screen.findByText('PUBLICIDAD')
    expect(label).toBeInTheDocument()
  })

  it('shows PUBLICIDAD label on html ads', async () => {
    const ad = makeHtmlAd({ slot: 'inline' })
    mockUseAds.mockReturnValue({ data: [ad] })
    mockPickAd.mockReturnValue(ad)

    render(<NcolAdSlot slot='inline' />)

    await act(async () => {})
    const labels = screen.getAllByText('PUBLICIDAD')
    expect(labels.length).toBeGreaterThan(0)
  })

  it('renders nothing for banner ad with no image src', async () => {
    const ad = makeBannerAd({
      imageUrl: null,
      imageUrlMobile: null
    })
    mockUseAds.mockReturnValue({ data: [ad] })
    mockPickAd.mockReturnValue(ad)

    const { container } = render(<NcolAdSlot slot='header' />)
    await act(async () => {})
    // No img should be rendered since both sources are null
    expect(container.querySelector('img')).toBeNull()
  })

  it('renders nothing for html ad with no htmlContent', async () => {
    const ad = makeHtmlAd({ htmlContent: null })
    mockUseAds.mockReturnValue({ data: [ad] })
    mockPickAd.mockReturnValue(ad)

    const { container } = render(<NcolAdSlot slot='inline' />)
    await act(async () => {})
    expect(container.firstChild).toBeNull()
  })
})

// ── NcolAdSlotPopup ───────────────────────────────────────────────────────────

describe('NcolAdSlotPopup', () => {
  it('does not render immediately (waits 3 s)', () => {
    const ad = makeBannerAd({ slot: 'popup' })
    mockUseAds.mockReturnValue({ data: [ad] })
    mockPickAd.mockReturnValue(ad)

    const { container } = render(<NcolAdSlotPopup />)
    // Before timers fire no overlay visible
    expect(container.querySelector('.fixed')).toBeNull()
  })

  it('renders popup overlay after 3 s with banner ad', async () => {
    const ad = makeBannerAd({ slot: 'popup' })
    mockUseAds.mockReturnValue({ data: [ad] })
    mockPickAd.mockImplementation((_ads: unknown, slot: unknown) =>
      slot === 'popup' ? ad : null
    )

    await act(async () => {
      render(<NcolAdSlotPopup />)
    })
    await act(async () => {
      jest.advanceTimersByTime(3000)
    })

    const imgs = document.querySelectorAll('img')
    expect(imgs.length).toBeGreaterThan(0)
    expect(imgs[0]).toHaveAttribute('src', 'https://example.com/img.png')
  })

  it('renders close button in popup', async () => {
    const ad = makeBannerAd({ slot: 'popup' })
    mockUseAds.mockReturnValue({ data: [ad] })
    mockPickAd.mockImplementation((_ads: unknown, slot: unknown) =>
      slot === 'popup' ? ad : null
    )

    await act(async () => {
      render(<NcolAdSlotPopup />)
    })
    await act(async () => {
      jest.advanceTimersByTime(3000)
    })

    const closeBtn = screen.getByLabelText('Cerrar anuncio')
    expect(closeBtn).toBeInTheDocument()
  })

  it('dismisses popup when close button is clicked', async () => {
    const ad = makeBannerAd({ slot: 'popup' })
    mockUseAds.mockReturnValue({ data: [ad] })
    mockPickAd.mockImplementation((_ads: unknown, slot: unknown) =>
      slot === 'popup' ? ad : null
    )

    await act(async () => {
      render(<NcolAdSlotPopup />)
    })
    await act(async () => {
      jest.advanceTimersByTime(3000)
    })

    const closeBtn = screen.getByLabelText('Cerrar anuncio')
    await act(async () => {
      await userEvent.setup({ delay: null }).click(closeBtn)
    })

    expect(screen.queryByLabelText('Cerrar anuncio')).toBeNull()
  })

  it('renders nothing if no popup ad exists after 3 s', async () => {
    mockUseAds.mockReturnValue({ data: [] })
    mockPickAd.mockReturnValue(null)

    const { container } = render(<NcolAdSlotPopup />)

    await act(async () => {
      jest.advanceTimersByTime(3000)
    })

    expect(container.querySelector('.fixed')).toBeNull()
  })
})

// ── NcolAdSlotStickyBottom ────────────────────────────────────────────────────

describe('NcolAdSlotStickyBottom', () => {
  it('renders nothing when no ad is available', async () => {
    mockPickAd.mockReturnValue(null)
    const { container } = render(<NcolAdSlotStickyBottom />)
    await act(async () => {})
    expect(container.firstChild).toBeNull()
  })

  it('renders sticky banner when banner ad is available', async () => {
    const ad = makeBannerAd({ slot: 'sticky-bottom' })
    mockUseAds.mockReturnValue({ data: [ad] })
    mockPickAd.mockReturnValue(ad)

    await act(async () => {
      render(<NcolAdSlotStickyBottom />)
    })

    const imgs = document.querySelectorAll('img')
    expect(imgs.length).toBeGreaterThan(0)
    expect(imgs[0]).toHaveAttribute('src', 'https://example.com/img.png')
  })

  it('renders html content in sticky slot', async () => {
    const ad = makeHtmlAd({ slot: 'sticky-bottom' })
    mockUseAds.mockReturnValue({ data: [ad] })
    mockPickAd.mockReturnValue(ad)

    const { container } = render(<NcolAdSlotStickyBottom />)
    await act(async () => {})

    expect(container.querySelector('.custom-ad')).toBeTruthy()
  })

  it('renders close button for sticky slot', async () => {
    const ad = makeBannerAd({ slot: 'sticky-bottom' })
    mockUseAds.mockReturnValue({ data: [ad] })
    mockPickAd.mockReturnValue(ad)

    render(<NcolAdSlotStickyBottom />)

    const closeBtn = await screen.findByLabelText('Cerrar anuncio')
    expect(closeBtn).toBeInTheDocument()
  })

  it('hides sticky ad when close button is clicked', async () => {
    const ad = makeBannerAd({ slot: 'sticky-bottom' })
    mockUseAds.mockReturnValue({ data: [ad] })
    mockPickAd.mockReturnValue(ad)

    await act(async () => {
      render(<NcolAdSlotStickyBottom />)
    })

    const closeBtn = screen.getByLabelText('Cerrar anuncio')
    await act(async () => {
      await userEvent.setup({ delay: null }).click(closeBtn)
    })

    expect(document.querySelectorAll('img').length).toBe(0)
  })
})
