import { render, screen } from '@testing-library/react'
import { Footer } from '..'
import { usePathname, useSearchParams } from 'next/navigation'
import {
  isHomeV2PreviewEnabled,
  isHomeV2PerformanceAuditEnabled
} from '@lib/homeV2/preview'

jest.mock('next/navigation', () => ({
  usePathname: jest.fn(),
  useParams() {
    return {
      slug: '/'
    }
  },
  useSearchParams: jest.fn().mockReturnValue(new URLSearchParams())
}))

describe('Footer', () => {
  test('should render expanded static subcategory links', () => {
    render(<Footer />)

    expect(screen.getByRole('link', { name: 'Política' })).toHaveAttribute(
      'href',
      '/categoria/nacionales/politica'
    )
    expect(
      screen.getByRole('link', { name: 'Costa Oriental' })
    ).toHaveAttribute('href', '/categoria/zulia/costa-oriental')
    expect(
      screen.getByRole('link', { name: 'Ciencia y Tecnología' })
    ).toHaveAttribute('href', '/categoria/tendencias/ciencia-y-tecnologia')
  })

  test('renders without the editorial hubs section', () => {
    render(<Footer />)
    expect(screen.getByRole('contentinfo')).toBeInTheDocument()
    expect(
      screen.queryByRole('region', { name: 'Secciones editoriales' })
    ).not.toBeInTheDocument()
  })
})

jest.mock('@components/NcolAdSlot', () => ({
  NcolAdSlot: ({ slot }: { slot: string }) => (
    <div data-testid='managed-slot' data-slot={slot} />
  )
}))
jest.mock('@lib/homeV2/preview', () => ({
  ...jest.requireActual('@lib/homeV2/preview'),
  isHomeV2PreviewEnabled: jest.fn(() => false),
  isHomeV2PerformanceAuditEnabled: jest.fn(() => false)
}))

describe('Footer ad ownership', () => {
  beforeEach(() => {
    jest.mocked(usePathname).mockReturnValue('/')
    jest.mocked(useSearchParams).mockReturnValue(new URLSearchParams() as never)
    jest.mocked(isHomeV2PreviewEnabled).mockReturnValue(false)
    jest.mocked(isHomeV2PerformanceAuditEnabled).mockReturnValue(false)
  })
  it('keeps the existing footer ad in control and restores it when leaving V2', () => {
    jest.mocked(isHomeV2PreviewEnabled).mockReturnValue(true)
    jest.mocked(usePathname).mockReturnValue('/home-v2-preview/')
    const { rerender } = render(<Footer />)
    expect(screen.queryByTestId('managed-slot')).not.toBeInTheDocument()
    jest.mocked(usePathname).mockReturnValue('/categoria/zulia/')
    rerender(<Footer />)
    expect(screen.getByTestId('managed-slot')).toHaveAttribute(
      'data-slot',
      'footer'
    )
  })
  it('leaves the moved footer ad to V2 on the opt-in localhost rewrite', () => {
    jest.mocked(isHomeV2PreviewEnabled).mockReturnValue(true)
    jest.mocked(isHomeV2PerformanceAuditEnabled).mockReturnValue(true)
    jest
      .mocked(useSearchParams)
      .mockReturnValue(new URLSearchParams('__ncol_home_audit=v2') as never)
    render(<Footer />)
    expect(screen.queryByTestId('managed-slot')).not.toBeInTheDocument()
  })
  it('preserves the control ad when a public query cannot activate the local rewrite', () => {
    jest
      .mocked(useSearchParams)
      .mockReturnValue(new URLSearchParams('__ncol_home_audit=v2') as never)
    render(<Footer />)
    expect(screen.getByTestId('managed-slot')).toHaveAttribute(
      'data-slot',
      'footer'
    )
  })
  it('preserves the control ad when actualizar bypasses the audit rewrite', () => {
    jest.mocked(isHomeV2PreviewEnabled).mockReturnValue(true)
    jest.mocked(isHomeV2PerformanceAuditEnabled).mockReturnValue(true)
    jest
      .mocked(useSearchParams)
      .mockReturnValue(
        new URLSearchParams('__ncol_home_audit=v2&actualizar=1') as never
      )
    render(<Footer />)
    expect(screen.getByTestId('managed-slot')).toHaveAttribute(
      'data-slot',
      'footer'
    )
  })
})
