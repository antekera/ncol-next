import { render } from '@testing-library/react'
import { AdSenseBanner } from '..'

describe('AdSenseBanner', () => {
  const baseData = {
    'data-ad-format': 'auto',
    'data-ad-slot': '1234567890'
  } as const

  test('does not render without data', () => {
    const { container } = render(
      <AdSenseBanner data={undefined} />
    )
    expect(container.firstChild).toBeNull()
  })

  test('renders ad container with attributes', () => {
    const { container } = render(
      <AdSenseBanner
        data={baseData}
        className='custom-class'
        style={{ minHeight: 50 }}
      />
    )

    const wrapper = container.querySelector('div > div') as HTMLDivElement
    expect(wrapper).toBeInTheDocument()

    const ins = wrapper.querySelector('ins.adsbygoogle') as HTMLInsElement
    expect(ins).toBeInTheDocument()
    expect(ins).toHaveAttribute('data-ad-format', 'auto')
    expect(ins).toHaveAttribute('data-ad-slot', '1234567890')
    expect(wrapper.style.minHeight).toBe('50px')
  })
})
